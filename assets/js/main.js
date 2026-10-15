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
    if (saved && !document.documentElement.getAttribute("data-theme")) document.documentElement.setAttribute("data-theme", saved);
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
        var code = pre.querySelector("code");
        var text = (code ? code.textContent : pre.textContent.replace(/Sao chép$/, "")).trim();
        var say = function (t) { btn.textContent = t; setTimeout(function () { btn.textContent = "Sao chép"; }, 1500); };
        var fallback = function () {
          var range = document.createRange(), sel = window.getSelection();
          range.selectNodeContents(code || pre); sel.removeAllRanges(); sel.addRange(range);
          var ok = false;
          try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
          sel.removeAllRanges(); say(ok ? "Đã chép" : "Hãy chép tay");
        };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { say("Đã chép"); }, fallback);
        else fallback();
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

  /* ---------- play / pause control shared by the animated components ---------- */
  function interval(step, ms) {
    var t = null;
    return { play: function () { if (!t) t = setInterval(step, ms); }, pause: function () { clearInterval(t); t = null; } };
  }
  function controls(host, api) {
    var bar = document.createElement("div"), running = false;
    bar.className = "player";
    var toggle = document.createElement("button");
    toggle.type = "button"; toggle.className = "player__btn";
    var set = function (on) {
      running = on;
      if (on) api.play(); else api.pause();
      toggle.textContent = on ? "⏸ Tạm dừng" : "▶ Chạy";
    };
    toggle.addEventListener("click", function () { set(!running); });
    bar.appendChild(toggle);
    if (api.step) {
      var next = document.createElement("button");
      next.type = "button"; next.className = "player__btn"; next.textContent = "Bước tiếp ›";
      next.addEventListener("click", function () { if (running) set(false); api.step(); });
      bar.appendChild(next);
    }
    host.insertAdjacentElement("afterend", bar);
    set(!REDUCED);
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
      cap.className = "loop-diagram__text";
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
      var iv = interval(show, 2600);
      // announce steps only when the reader drives them; an auto-advancing live region would talk over the page
      controls(box, { play: iv.play, pause: iv.pause, step: function () { cap.setAttribute("aria-live", "polite"); show(); } });
    });
  }

  /* ---------- spectrum strip: prompt → context → harness → loop → graph ---------- */
  function initSpectrum() {
    $$("[data-component='spectrum']").forEach(function (box) {
      var steps = $$(".spectrum__step", box), k = 0;
      if (!steps.length) return;
      var tick = function () { steps.forEach(function (s, i) { s.classList.toggle("is-on", i === k); }); k = (k + 1) % steps.length; };
      tick();
      var iv = interval(tick, 1800);
      controls(box, { play: iv.play, pause: iv.pause, step: tick });
    });
  }

  /* ---------- feature state machine: mirrors the checks and messages of scripts/harness.py ---------- */
  function initMachine() {
    $$("[data-component='state-machine']").forEach(function (box) {
      var S = { state: "not_started", attempts: 0, ok: false };
      box.classList.add("machine");
      box.innerHTML =
        '<div class="machine__states">' +
        ["not_started", "active", "passing", "blocked"].map(function (s) {
          return '<div class="machine__state" data-state="' + s + '">' + s + "</div>";
        }).join("") + "</div>" +
        '<div class="machine__actions">' +
        '<button type="button" data-act="code" aria-pressed="false">mã đang sai</button>' +
        '<button type="button" data-act="next">next</button><button type="button" data-act="try">try F012</button>' +
        '<button type="button" data-act="verify">verify F012</button>' +
        '<button type="button" data-act="edit">sửa tay status → passing</button><button type="button" data-act="block">block F012</button>' +
        '<button type="button" data-act="unblock">unblock F012</button><button type="button" data-act="reset">đặt lại</button></div>' +
        '<div class="machine__log" aria-live="polite"></div>';
      var log = $(".machine__log", box), codeBtn = $("[data-act='code']", box);
      var paint = function (msg) {
        $$(".machine__state", box).forEach(function (el) { el.classList.toggle("is-on", el.getAttribute("data-state") === S.state); });
        codeBtn.textContent = S.ok ? "mã đã đúng (lệnh verify sẽ pass)" : "mã đang sai (lệnh verify sẽ fail)";
        codeBtn.setAttribute("aria-pressed", S.ok ? "true" : "false");
        if (msg) log.textContent = msg;
      };
      var acts = {
        code: function () { S.ok = !S.ok; return S.ok ? "Đã sửa mã: lệnh verification giờ thoát 0." : "Mã bị làm hỏng: lệnh verification giờ thoát khác 0."; },
        next: function () {
          if (S.state === "active") return "A feature is already active (WIP=1): F012 — POST /orders returns 201 and persists the order\n  verify: pytest tests/test_orders.py -q";
          if (S.state === "blocked") return "BLOCKED: VCR = 0.0 < 1.0 (some features are blocked). Resolve the blockers or document them in PROGRESS.md, then run `next --force` if a blocker is outside your control.";
          if (S.state !== "not_started") return "No eligible not_started feature left (all done or waiting on dependencies).";
          S.state = "active"; S.attempts = 0;
          return "ACTIVE: F012 — POST /orders returns 201 and persists the order\n  verify: pytest tests/test_orders.py -q\nWork on this feature only. When done, run `verify F012`.";
        },
        try: function () {
          return "[" + (S.ok ? "PASS" : "FAIL") + "] F012 verification exited " + (S.ok ? 0 : 1) + " (no state changed). — try chạy được ở mọi trạng thái và không bao giờ đổi trạng thái.";
        },
        verify: function () {
          if (S.state === "passing") return "F012 is already passing (state transitions are one-way).";
          if (S.state !== "active") return "ERROR: F012 is " + S.state + ". Only an active feature can be verified.";
          if (!S.ok) {
            S.attempts++;
            return "[FAIL] F012 is still active (attempt " + S.attempts + "). Fix it and verify again." +
              (S.attempts >= 3 ? " Tried ≥3 times: change your approach, or `block` it and record the reason." : "");
          }
          S.state = "passing";
          return "== verification command passed; running the project-wide quick check ==\n[PASS] F012 → passing. Evidence: commit, command, exit code 0, duration.";
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
        reset: function () { S.state = "not_started"; S.attempts = 0; S.ok = false; return "Đặt lại: F012 = not_started, mã đang sai."; }
      };
      $$("button[data-act]", box).forEach(function (b) {
        b.addEventListener("click", function () {
          var act = b.getAttribute("data-act");
          var label = act === "code" ? "(sửa mã)" : act === "edit" ? "(agent sửa feature_list.json)" :
            "$ python scripts/harness.py " + b.textContent;
          paint(label + "\n" + acts[act]());
        });
      });
      paint("Bấm thử các nút: chỉ harness mới đổi được trạng thái, verify chỉ pass khi mã thật sự đúng, và passing không bao giờ quay lại.");
    });
  }

  /* ---------- hook timeline ---------- */
  var HOOKS = [
    ["SessionStart", "Tiêm trạng thái harness vào ngữ cảnh: số feature, VCR, feature active + lệnh verify, bước tiếp, lần check gần nhất. Sau compaction: tiêm thêm snapshot."],
    ["UserPromptSubmit", "Nhắc một dòng khi có feature active (WIP=1, scope); chống lặp 10 phút."],
    ["PreToolUse", "Từ chối sửa tay status/evidence, sửa lệnh verification của feature đã bắt đầu và tệp trạng thái; hỏi trước khi ghi ngoài scope. Không bao giờ trả về \"allow\"."],
    ["PostToolUse", "Ghi tệp/lệnh mà phiên đã chạm vào .harness/activity.jsonl."],
    ["PreCompact", "Ghi .harness/compact-snapshot.md trước khi nén ngữ cảnh."],
    ["Stop", "Chặn kết thúc lượt khi còn debug code, tệp rác hoặc feature list bị sửa tay (không chặn hai lần liên tiếp)."],
    ["SessionEnd", "Ghi nhận phiên kết thúc có handoff hay không."]
  ];
  function initTimeline() {
    $$("[data-component='hook-timeline']").forEach(function (ol) {
      ol.classList.add("timeline");
      if (!$("li", ol)) {
        ol.innerHTML = HOOKS.map(function (h) {
          return '<li><span class="timeline__dot" aria-hidden="true"></span><b>' + h[0] + "</b><br>" + h[1] + "</li>";
        }).join("");
      }
      var items = $$("li", ol), k = 0;
      var tick = function () { items.forEach(function (li, i) { li.classList.toggle("is-on", i === k); }); k = (k + 1) % items.length; };
      tick();
      var iv = interval(tick, 2200);
      controls(ol, { play: iv.play, pause: iv.pause, step: tick });
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
      var i = 0, c = 0, timer = null;
      var tick = function () {
        if (i >= lines.length) { timer = setTimeout(function () { i = 0; c = 0; tick(); }, 3500); return; }
        var l = lines[i];
        if (l.kind === "prompt" && c < l.text.length) { c += 2; render(i + 1, c); timer = setTimeout(tick, 28); return; }
        render(i + 1); i++; c = 0; timer = setTimeout(tick, l.kind === "prompt" ? 500 : 260);
      };
      controls(box, {
        play: function () { if (!timer) { i = 0; c = 0; tick(); } },
        pause: function () { clearTimeout(timer); timer = null; render(lines.length); }
      });
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
