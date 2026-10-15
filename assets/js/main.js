/* harness-tutorial — interactive components. No dependencies. Every component is progressive enhancement: the page
   reads correctly without JavaScript, and motion stops under prefers-reduced-motion. */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  var EV_TEXT = { do: "Đo — số liệu công bố, có điều kiện đo", sx: "SX — báo cáo sản xuất, không phải thí nghiệm có kiểm soát",
    mh: "MH — minh họa (ví dụ giảng dạy hoặc ca đơn lẻ)", sl: "SL — suy luận của tác giả trang này" };

  /* ---------- theme ---------- */
  function initTheme() {
    var saved = store.get("ht-theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    $$(".theme-toggle").forEach(function (btn) {
      var paint = function () {
        var dark = document.documentElement.getAttribute("data-theme") === "dark" ||
          (!document.documentElement.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
        btn.textContent = dark ? "☀" : "☾";
        btn.setAttribute("aria-label", dark ? "Chuyển sang nền sáng" : "Chuyển sang nền tối");
      };
      paint();
      btn.addEventListener("click", function () {
        var dark = btn.textContent === "☀";
        var next = dark ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        store.set("ht-theme", next);
        paint();
      });
    });
  }

  /* ---------- reading progress, TOC scroll spy, reveal ---------- */
  function initScroll() {
    var bar = $(".progress");
    var links = $$(".toc a[href^='#']");
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    var onScroll = function () {
      var h = document.documentElement;
      if (bar) bar.style.transform = "scaleX(" + Math.min(1, h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) + ")";
      var current = -1;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < 140) current = i; });
      links.forEach(function (a, i) { a.classList.toggle("is-active", i === current); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    var reveal = $$(".reveal");
    if (REDUCED || !("IntersectionObserver" in window)) { reveal.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveal.forEach(function (el) { io.observe(el); });
  }

  /* ---------- evidence tags: tooltip text ---------- */
  function initEvidence() {
    $$(".ev[data-evidence]").forEach(function (el) {
      var t = EV_TEXT[el.getAttribute("data-evidence")];
      if (t && !el.title) el.title = t;
    });
  }

  /* ---------- count-up numbers ---------- */
  function initCounters() {
    var els = $$("[data-count-to]");
    var run = function (el) {
      var to = parseFloat(el.getAttribute("data-count-to"));
      var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var fmt = function (v) { return v.toFixed(dec).replace(".", ",") + suffix; };
      if (REDUCED) { el.textContent = fmt(to); return; }
      var t0 = null;
      var step = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1200);
        el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- copy buttons on code blocks ---------- */
  function initCopy() {
    $$("pre").forEach(function (pre) {
      if (pre.closest(".terminal")) return;
      var btn = document.createElement("button");
      btn.className = "copy-btn"; btn.type = "button"; btn.textContent = "Sao chép";
      btn.addEventListener("click", function () {
        var text = pre.innerText.replace(/Sao chép$/, "").trim();
        var done = function () { btn.textContent = "Đã chép"; setTimeout(function () { btn.textContent = "Sao chép"; }, 1500); };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
      });
      pre.appendChild(btn);
    });
  }

  /* ---------- tabs ---------- */
  function initTabs() {
    $$("[data-component='tabs']").forEach(function (box) {
      var tabs = $$("[role='tab']", box);
      var select = function (tab) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", on ? "true" : "false");
          t.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
      };
      tabs.forEach(function (t, i) {
        t.addEventListener("click", function () { select(t); });
        t.addEventListener("keydown", function (e) {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            var n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
            n.focus(); select(n);
          }
        });
      });
      if (tabs.length) select(tabs[0]);
    });
  }

  /* ---------- loop diagram: goal → maker → reviewer → gate → passing, with back-edges ---------- */
  var LOOP_STEPS = [
    { node: 0, text: "Mục tiêu: một feature có hành vi quan sát được và một lệnh verification." },
    { node: 1, text: "Maker làm đúng một feature, chỉ trong scope được khai báo." },
    { node: 2, text: "Reviewer phiên mới, chỉ đọc: tự chạy lệnh, không tin lời kể của maker." },
    { node: 1, text: "Reviewer trả FAIL kèm vị trí và cách sửa → quay lại maker (back-edge)." },
    { node: 2, text: "Lần review thứ hai: PASS." },
    { node: 3, text: "Test gate + pass-gate: harness tự chạy verification và check toàn dự án." },
    { node: 4, text: "passing + bằng chứng (lệnh, mã thoát, commit). Trạng thái một chiều." }
  ];
  function initLoopDiagram() {
    $$("[data-component='loop-diagram']").forEach(function (box) {
      var names = ["Mục tiêu", "Maker", "Reviewer", "Gate", "passing"];
      var xs = [20, 150, 280, 410, 540];
      var svg = '<svg viewBox="0 0 660 240" role="img" aria-label="Vòng lặp maker – reviewer – gate của harness">';
      // one marker per edge colour: a marker does not inherit the colour of the path that uses it
      svg += '<defs>' +
        '<marker id="arr-fwd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
        '<path d="M0,0 L10,5 L0,10 z" style="fill:var(--muted)"/></marker>' +
        '<marker id="arr-back" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
        '<path d="M0,0 L10,5 L0,10 z" style="fill:var(--amber)"/></marker></defs>';
      for (var i = 0; i < 4; i++) {
        svg += '<path class="edge" marker-end="url(#arr-fwd)" d="M' + (xs[i] + 100) + ',80 L' + (xs[i + 1] - 4) + ',80"/>';
      }
      // reviewer FAIL -> maker (short arc, label under it); gate red -> maker (long arc, label under it)
      svg += '<path class="edge edge--back" marker-end="url(#arr-back)" d="M315,112 C315,162 232,162 232,118"/>';
      svg += '<text class="caption" x="300" y="174" text-anchor="middle">FAIL → sửa theo issue cụ thể</text>';
      svg += '<path class="edge edge--back" marker-end="url(#arr-back)" d="M460,112 C460,232 168,232 168,118"/>';
      svg += '<text class="caption" x="314" y="226" text-anchor="middle">gate đỏ → quay lại (tối đa N lần, rồi blocked)</text>';
      names.forEach(function (n, i) {
        svg += '<g class="node" data-i="' + i + '"><rect x="' + xs[i] + '" y="50" width="100" height="60" rx="12"/>' +
          '<text x="' + (xs[i] + 50) + '" y="85" text-anchor="middle">' + n + '</text></g>';
      });
      svg += '<circle class="token" r="7" cx="70" cy="40"/></svg>';
      box.insertAdjacentHTML("afterbegin", svg);
      var cap = document.createElement("p");
      cap.className = "loop-diagram__text"; cap.setAttribute("aria-live", "polite");
      box.appendChild(cap);
      var nodes = $$(".node", box), token = $(".token", box), k = 0;
      var show = function () {
        var s = LOOP_STEPS[k];
        nodes.forEach(function (g, i) { g.classList.toggle("is-on", i === s.node); });
        token.setAttribute("cx", xs[s.node] + 50);
        cap.textContent = (k + 1) + "/" + LOOP_STEPS.length + " — " + s.text;
        k = (k + 1) % LOOP_STEPS.length;
      };
      show();
      if (!REDUCED) setInterval(show, 2600);
      else box.addEventListener("click", show);
    });
  }

  /* ---------- spectrum strip: prompt → context → harness → loop → graph ---------- */
  function initSpectrum() {
    $$("[data-component='spectrum']").forEach(function (box) {
      var steps = $$(".spectrum__step", box), k = 0;
      if (!steps.length) return;
      var tick = function () { steps.forEach(function (s, i) { s.classList.toggle("is-on", i === k); }); k = (k + 1) % steps.length; };
      tick();
      if (!REDUCED) setInterval(tick, 1800);
    });
  }

  /* ---------- feature state machine: what the runtime allows ---------- */
  function initMachine() {
    $$("[data-component='state-machine']").forEach(function (box) {
      var S = { state: "not_started", attempts: 0 };
      box.classList.add("machine");
      box.innerHTML =
        '<div class="machine__states">' +
        ["not_started", "active", "passing", "blocked"].map(function (s) {
          return '<div class="machine__state" data-state="' + s + '">' + s + "</div>";
        }).join("") + "</div>" +
        '<div class="machine__actions">' +
        '<button type="button" data-act="next">next</button><button type="button" data-act="try">try F012</button>' +
        '<button type="button" data-act="fail">verify F012 (lệnh fail)</button><button type="button" data-act="pass">verify F012 (lệnh pass)</button>' +
        '<button type="button" data-act="edit">sửa tay status → passing</button><button type="button" data-act="block">block</button>' +
        '<button type="button" data-act="unblock">unblock</button><button type="button" data-act="reset">đặt lại</button></div>' +
        '<div class="machine__log" aria-live="polite"></div>';
      var log = $(".machine__log", box);
      var paint = function (msg) {
        $$(".machine__state", box).forEach(function (el) { el.classList.toggle("is-on", el.getAttribute("data-state") === S.state); });
        if (msg) log.textContent = msg;
      };
      var acts = {
        next: function () {
          if (S.state === "active") return "A feature is already active (WIP=1): F012. Finish it (`verify F012`) or `block` it first.";
          if (S.state !== "not_started") return "ERROR: F012 is " + S.state + "; only not_started features can be activated.";
          S.state = "active"; return "ACTIVE: F012 — POST /orders returns 201 and persists the order\n  verify: pytest tests/test_orders.py -q";
        },
        try: function () { return S.state === "active" ? "[PASS] F012 verification exited 0 (no state changed)." : "try chỉ chạy lệnh verification; trạng thái không đổi."; },
        fail: function () {
          if (S.state !== "active") return "ERROR: F012 is " + S.state + ". Only an active feature can be verified.";
          S.attempts++; return "[FAIL] F012 is still active (attempt " + S.attempts + "). Fix it and verify again." +
            (S.attempts >= 3 ? " Tried ≥3 times: change your approach, or `block` it and record the reason." : "");
        },
        pass: function () {
          if (S.state === "passing") return "F012 is already passing (state transitions are one-way).";
          if (S.state !== "active") return "ERROR: F012 is " + S.state + ". Only an active feature can be verified.";
          S.state = "passing"; return "== verification command passed; running the project-wide quick check ==\n[PASS] F012 → passing. Evidence: commit, command, exit code 0, duration.";
        },
        edit: function () { return "PreToolUse hook → deny: `status` of F012 is harness state: change it with `python scripts/harness.py next/verify/block/unblock`, never by hand."; },
        block: function () {
          if (S.state === "passing") return "ERROR: cannot block a feature that is already passing.";
          S.state = "blocked"; return "F012 → blocked: waiting on the payments sandbox. VCR < 1 → `next` refuses new work.";
        },
        unblock: function () {
          if (S.state !== "blocked") return "ERROR: F012 is not blocked.";
          S.state = "not_started"; return "F012 → not_started.";
        },
        reset: function () { S.state = "not_started"; S.attempts = 0; return "Đặt lại: F012 = not_started."; }
      };
      $$("button[data-act]", box).forEach(function (b) {
        b.addEventListener("click", function () { paint("$ " + b.textContent + "\n" + acts[b.getAttribute("data-act")]()); });
      });
      paint("Bấm thử các nút: chỉ harness mới đổi được trạng thái, và passing không bao giờ quay lại.");
    });
  }

  /* ---------- hook timeline ---------- */
  var HOOKS = [
    ["SessionStart", "Tiêm trạng thái harness vào ngữ cảnh: số feature, VCR, feature active + lệnh verify, bước tiếp, lần check gần nhất. Sau compaction: tiêm thêm snapshot."],
    ["UserPromptSubmit", "Nhắc một dòng khi có feature active (WIP=1, scope); chống lặp 10 phút."],
    ["PreToolUse", "Từ chối sửa tay status/evidence và tệp trạng thái; hỏi trước khi ghi ngoài scope. Không bao giờ trả về \"allow\"."],
    ["PostToolUse", "Ghi tệp/lệnh mà phiên đã chạm vào .harness/activity.jsonl."],
    ["PreCompact", "Ghi .harness/compact-snapshot.md trước khi nén ngữ cảnh."],
    ["Stop", "Chặn kết thúc lượt khi còn debug code, tệp rác hoặc feature list bị sửa tay (không chặn hai lần liên tiếp)."],
    ["SessionEnd", "Ghi nhận phiên kết thúc có handoff hay không."]
  ];
  function initTimeline() {
    $$("[data-component='hook-timeline']").forEach(function (ol) {
      ol.classList.add("timeline");
      ol.innerHTML = HOOKS.map(function (h) {
        return '<li><span class="timeline__dot" aria-hidden="true"></span><b>' + h[0] + "</b><br>" + h[1] + "</li>";
      }).join("");
      var items = $$("li", ol), k = 0;
      var tick = function () { items.forEach(function (li, i) { li.classList.toggle("is-on", i === k); }); k = (k + 1) % items.length; };
      tick();
      if (!REDUCED) setInterval(tick, 2200);
    });
  }

  /* ---------- terminal replay ---------- */
  function initTerminal() {
    $$("[data-component='terminal']").forEach(function (box) {
      var lines = $$("[data-line]", box).map(function (el) { return { kind: el.getAttribute("data-line"), text: el.textContent }; });
      if (!lines.length) return;
      box.classList.add("terminal");
      var render = function (n, partial) {
        box.innerHTML = lines.slice(0, n).map(function (l, i) {
          var t = (i === n - 1 && partial !== undefined) ? l.text.slice(0, partial) : l.text;
          var cls = l.kind === "prompt" ? "t-prompt" : l.kind === "ok" ? "t-ok" : "t-out";
          return '<div class="' + cls + '">' + (l.kind === "prompt" ? "$ " : "") + t.replace(/</g, "&lt;") + "</div>";
        }).join("");
      };
      if (REDUCED) { render(lines.length); return; }
      var i = 0, c = 0;
      var tick = function () {
        if (i >= lines.length) { setTimeout(function () { i = 0; c = 0; tick(); }, 3500); return; }
        var l = lines[i];
        if (l.kind === "prompt" && c < l.text.length) { c += 2; render(i + 1, c); setTimeout(tick, 28); return; }
        render(i + 1); i++; c = 0; setTimeout(tick, l.kind === "prompt" ? 500 : 260);
      };
      tick();
    });
  }

  /* ---------- quiz ---------- */
  function initQuiz() {
    $$("[data-component='quiz']").forEach(function (q) {
      var explain = $(".quiz__explain", q);
      if (explain) explain.hidden = true;
      $$(".quiz__options button", q).forEach(function (b) {
        b.addEventListener("click", function () {
          var right = b.hasAttribute("data-correct");
          b.classList.add(right ? "is-right" : "is-wrong");
          if (right && explain) explain.hidden = false;
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme(); initScroll(); initEvidence(); initCounters(); initCopy(); initTabs();
    initLoopDiagram(); initSpectrum(); initMachine(); initTimeline(); initTerminal(); initQuiz();
  });
})();
