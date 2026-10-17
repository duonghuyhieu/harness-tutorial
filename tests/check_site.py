"""Acceptance checks for the tutorial site (standard library only).

    python tests/check_site.py                 # every page that exists (missing planned pages are only warnings)
    python tests/check_site.py --page guide    # one page must exist and pass
    python tests/check_site.py --strict        # every planned page must exist and pass (release gate)
    python tests/check_site.py --smoke         # assets and the template are in place

Exit code 0 = pass. Messages follow ERROR / WHY / FIX so an agent can act on them.
"""
from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "docs" / "CONTENT.md"
EVIDENCE = {"do", "sx", "mh", "sl"}
NAV = ["index.html", "problems.html", "principles.html", "harness-kit.html", "results.html", "guide.html", "references.html"]
PAGES = {
    "index": {"file": "index.html", "ids": ["luan-diem", "hanh-trinh", "so-lieu", "dinh-nghia", "pho-tien-hoa", "lo-trinh"],
              "components": ["loop-diagram", "spectrum"], "min_cites": 4, "min_stats": 4},
    "problems": {"file": "problems.html",
                 "ids": ["ap-luc-hoan-thanh", "khai-sai", "reward-hacking", "pham-vi", "mat-ngu-canh", "chi-dan-phinh",
                         "prompt-injection", "giam-sat-yeu-di", "su-co-2026"],
                 "components": [], "min_cites": 12, "min_stats": 0, "problem_cards": 9},
    "principles": {"file": "principles.html",
                   "ids": ["nam-he-con", "he-thong-ghi-chep", "router", "lien-tuc", "khoi-tao", "wip", "feature-list",
                           "maker-checker", "e2e", "quan-sat", "clean-state", "loop", "graph"],
                   "components": ["loop-diagram"], "min_cites": 3, "min_stats": 0, "principles": 13},
    "harness-kit": {"file": "harness-kit.html",
                    "ids": ["kien-truc", "bang-anh-xa", "may-trang-thai", "hook", "danh-gia", "gioi-han"],
                    "components": ["state-machine", "hook-timeline"], "min_cites": 2, "min_stats": 3},
    "results": {"file": "results.html",
                "ids": ["cach-do", "cau-tra-loi", "hanh-vi", "tac-vu-khac", "ban-phat-hanh", "vi-sao", "mo-hinh-manh",
                        "tham-do", "loi-harness", "gioi-han"],
                "components": [], "min_cites": 2, "min_stats": 4},
    "guide": {"file": "guide.html",
              "ids": ["cai-dat", "cai-gi", "quy-trinh", "lenh", "vi-du", "vong-lap", "cap-nhat", "su-co", "cach-xay-dung"],
              "components": ["tabs", "terminal"], "min_cites": 1, "min_stats": 0},
    "references": {"file": "references.html", "ids": [], "components": [], "min_cites": 0, "min_stats": 0},
}
BANNED = re.compile(r"lorem ipsum|\bTODO\b|\bFIXME\b|HARNESS:FILL|\{\{", re.I)
PERCENT = re.compile(r"(?<![\w.,])(\d{1,3}(?:[.,]\d{1,2})?)\s?%")


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags: list[tuple[str, dict]] = []
        self.ids: set[str] = set()
        self.text: list[str] = []
        self._skip = 0
        self.title = ""
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        self.tags.append((tag, a))
        if "id" in a:
            self.ids.add(a["id"])
        if tag in ("script", "style", "code", "pre"):
            self._skip += 1
        if tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag in ("script", "style", "code", "pre") and self._skip:
            self._skip -= 1
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if not self._skip:
            self.text.append(data)


def parse(path: Path) -> tuple[Page, str]:
    raw = path.read_text(encoding="utf-8")
    p = Page()
    p.feed(raw)
    return p, raw


def classes(a: dict) -> list[str]:
    return a.get("class", "").split()


def ref_ids() -> set[str]:
    path = ROOT / "references.html"
    if path.exists():
        return {i for i in parse(path)[0].ids if i.startswith("ref-")}
    return {"ref-" + k for k in re.findall(r"^- `([a-z0-9-]+)` —", CONTENT.read_text(encoding="utf-8"), re.M)}


def content_percents() -> set[str]:
    text = CONTENT.read_text(encoding="utf-8")
    return {m.replace(",", ".") for m in PERCENT.findall(text)}


def check_page(key: str, strict: bool, errors: list[str], warnings: list[str], must_exist: bool = False) -> None:
    """`must_exist`: this page itself is required; `strict`: links to planned pages must resolve too (release gate)."""
    spec = PAGES[key]
    path = ROOT / spec["file"]
    if not path.exists():
        (errors if (strict or must_exist) else warnings).append(f"{spec['file']} does not exist yet."
                                                f"\n  FIX: build it from docs/CONTENT.md and docs/PAGE-TEMPLATE.html.")
        return
    p, raw = parse(path)
    name = spec["file"]

    def err(msg: str, why: str, fix: str) -> None:
        errors.append(f"{name}: {msg}\n  WHY: {why}\n  FIX: {fix}")

    if not raw.lstrip().lower().startswith("<!doctype html>"):
        err("missing <!doctype html>", "browsers fall back to quirks mode", "start the file with <!doctype html>")
    html = [a for t, a in p.tags if t == "html"]
    if not html or html[0].get("lang") != "vi":
        err('<html lang="vi"> missing', "screen readers and search need the language", 'use <html lang="vi">')
    if not any(t == "meta" and a.get("charset", "").lower() == "utf-8" for t, a in p.tags):
        err("missing <meta charset=utf-8>", "Vietnamese text breaks without it", 'add <meta charset="utf-8">')
    if not any(t == "meta" and a.get("name") == "viewport" for t, a in p.tags):
        err("missing viewport meta", "the page must work on phones", "copy the head from docs/PAGE-TEMPLATE.html")
    if not p.title.strip():
        err("empty <title>", "tabs and search show it", "set a specific title")
    if sum(1 for t, _ in p.tags if t == "h1") != 1:
        err("needs exactly one <h1>", "one page, one main heading", "keep a single h1")
    if not any(t == "link" and a.get("href") == "assets/css/style.css" for t, a in p.tags):
        err("does not load assets/css/style.css", "shared design system", "copy the head from the template")
    if not any(t == "script" and a.get("src") == "assets/js/main.js" for t, a in p.tags):
        err("does not load assets/js/main.js", "interactive components need it", '<script defer src="assets/js/main.js">')
    if any(t == "script" and not a.get("src") for t, a in p.tags):
        err("inline <script> found", "all behavior lives in assets/js/main.js", "remove inline scripts; use data-component")
    nav_links = {a.get("href") for t, a in p.tags if t == "a" and a.get("href") in NAV}
    missing_nav = [n for n in NAV if n not in nav_links]
    if missing_nav:
        err(f"navigation lacks links to {missing_nav}", "every page links every page", "copy the nav from the template")
    if not any(t == "a" and a.get("href") == name and a.get("aria-current") == "page" for t, a in p.tags):
        err('own nav link lacks aria-current="page"', "readers need to see where they are", f'add aria-current="page" to the {name} link')
    if not any(t == "footer" for t, _ in p.tags) or "15/10/2026" not in raw:
        err("footer with the retrieval date (15/10/2026) missing", "sources change; the date dates the numbers",
            "copy the footer from the template")
    for req in spec["ids"]:
        if req not in p.ids:
            err(f'required section id="{req}" missing', "docs/CONTENT.md defines the sections of this page",
                f'add the section with id="{req}"')
    for comp in spec["components"]:
        if not any(a.get("data-component") == comp for _, a in p.tags):
            err(f'component data-component="{comp}" missing', "the page spec asks for it",
                "use the markup shown in docs/PAGE-TEMPLATE.html")
    # links and citations
    refs = ref_ids()
    cites = 0
    for t, a in p.tags:
        for attr in ("href", "src"):
            target = a.get(attr, "")
            if not target or target.startswith(("http://", "https://", "mailto:", "data:")):
                continue
            file_part, _, frag = target.partition("#")
            dest = ROOT / file_part if file_part else path
            if file_part and not dest.exists():
                if file_part in NAV and not strict:
                    warnings.append(f"{name}: links to {file_part}, not built yet")
                else:
                    err(f"broken link {target}", "dead links undermine trust", "fix the path")
                continue
            if frag and dest.suffix == ".html" and dest.exists():
                ids = p.ids if dest == path else parse(dest)[0].ids
                if frag not in ids and not (dest.name == "references.html" and frag in refs):
                    err(f"anchor #{frag} not found in {dest.name}", "dead anchor", "fix the id or the link")
        if t == "a" and "cite" in classes(a):
            cites += 1
            href = a.get("href", "")
            if not href.startswith("references.html#ref-") or href.split("#")[1] not in refs:
                err(f"citation {href} does not point to a reference id", "every claim must be traceable",
                    "use href=\"references.html#ref-<key>\" with a key from docs/CONTENT.md")
    if cites < spec["min_cites"]:
        err(f"only {cites} citations (need ≥ {spec['min_cites']})", "academic standard: sourced claims",
            'add <a class="cite" href="references.html#ref-…"> after sourced claims')
    # evidence tags
    for t, a in p.tags:
        if "ev" in classes(a) and a.get("data-evidence") not in EVIDENCE:
            err(f"evidence tag with data-evidence={a.get('data-evidence')!r}", "allowed: do, sx, mh, sl",
                "use one of the four tags")
        if "stat" in classes(a) and a.get("data-evidence") not in EVIDENCE:
            err("a .stat card has no valid data-evidence", "every number carries its evidence type",
                'add data-evidence="do|sx|mh|sl" and an .ev badge')
    stats = sum(1 for _, a in p.tags if "stat" in classes(a))
    if stats < spec["min_stats"]:
        err(f"only {stats} stat cards (need ≥ {spec['min_stats']})", "the page spec asks for key numbers up front",
            "add .stat cards from docs/CONTENT.md")
    if spec.get("problem_cards") and sum(1 for _, a in p.tags if "problem-card" in classes(a)) < spec["problem_cards"]:
        err(f"needs {spec['problem_cards']} .problem-card articles", "one card per problem in docs/CONTENT.md",
            "use the problem-card markup")
    if spec.get("principles") and sum(1 for _, a in p.tags if "principle" in classes(a)) < spec["principles"]:
        err(f"needs {spec['principles']} .principle blocks", "one block per principle in docs/CONTENT.md",
            "use the principle markup")
    # facts gate: every percentage in visible text must exist in the content brief
    allowed = content_percents()
    visible = " ".join(p.text)
    for m in sorted(set(PERCENT.findall(visible))):
        if m.replace(",", ".") not in allowed:
            err(f"percentage {m}% is not in docs/CONTENT.md", "numbers may only come from the verified content brief",
                "use the exact figure from docs/CONTENT.md or remove it")
    if BANNED.search(raw):
        err(f"placeholder text found ({BANNED.search(raw).group(0)!r})", "unfinished content", "replace it")
    if len(raw.encode("utf-8")) > 250_000:
        err("page is larger than 250 KB", "keep pages light", "trim or split")
    if key == "references":
        keys = re.findall(r"^- `([a-z0-9-]+)` —", CONTENT.read_text(encoding="utf-8"), re.M)
        for k in keys:
            if f"ref-{k}" not in p.ids:
                err(f"reference ref-{k} missing", "every source in docs/CONTENT.md is listed", f'add <li id="ref-{k}">')
        for t, a in p.tags:
            if t == "li" and a.get("id", "").startswith("ref-"):
                pass
        if not any(t == "a" and a.get("href", "").startswith("http") for t, a in p.tags):
            err("references have no external URLs", "readers must reach the sources", "link each source")


def smoke(errors: list[str]) -> None:
    for rel in ("assets/css/style.css", "assets/js/main.js", "assets/img/mark.svg", "docs/CONTENT.md",
                "docs/PAGE-TEMPLATE.html"):
        if not (ROOT / rel).exists():
            errors.append(f"{rel} missing\n  WHY: shared asset\n  FIX: restore it")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--page", choices=list(PAGES))
    ap.add_argument("--strict", action="store_true")
    ap.add_argument("--smoke", action="store_true")
    args = ap.parse_args()
    errors: list[str] = []
    warnings: list[str] = []
    smoke(errors)
    if not args.smoke:
        keys = [args.page] if args.page else list(PAGES)
        for k in keys:
            check_page(k, strict=args.strict, errors=errors, warnings=warnings, must_exist=(k == args.page))
    for w in warnings:
        print("WARNING:", w)
    for e in errors:
        print("ERROR:", e)
    print("site check:", "PASS" if not errors else f"FAIL ({len(errors)} error(s))")
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
