/* =========================================================
   Learn with Palla — free resume builder
   Vanilla JS. State lives in memory + localStorage("lwp_resume").
   Exports: PDF via print dialog, Word via HTML .doc blob.
   ========================================================= */
(function () {
  "use strict";

  var LS_KEY = "lwp_resume";

  /* ---------- Templates ----------
     ORIGINAL designs (not copied from any resume site): 10 base
     layouts × 6 colour palettes each = 60 templates, and every one
     can be recoloured with the colour bar (custom accent + header). */
  var LAYOUTS = [
    { id: "side-l",   name: "Sidebar",       lay: "lay-side-l",   mini: "mini-side-l",   group: "sidebar",
      pals: ["emerald", "teal", "sapphire", "violet", "rose", "ink"] },
    { id: "side-r",   name: "Right Rail",    lay: "lay-side-r",   mini: "mini-side-r",   group: "sidebar",
      pals: ["violet", "indigo", "cyan", "crimson", "forest", "gold"] },
    { id: "bandside", name: "Banner Duo",    lay: "lay-bandside", mini: "mini-bandside", group: "sidebar",
      pals: ["teal", "indigo", "rose", "emerald", "sunset", "sapphire"] },
    { id: "band",     name: "Banner",        lay: "lay-band",     mini: "mini-band",     group: "banner",
      pals: ["sapphire", "sunset", "gold", "emerald", "crimson", "cyan"] },
    { id: "topbar",   name: "Topline",       lay: "lay-topline",  mini: "mini-topline",  group: "banner",
      pals: ["sunset", "cyan", "emerald", "violet", "gold", "rose"] },
    { id: "plain",    name: "Classic",       lay: "lay-plain",    mini: "mini-plain",    group: "classic",
      pals: ["ink", "emerald", "sapphire", "crimson", "teal", "indigo"] },
    { id: "serif",    name: "Classic Serif", lay: "lay-plain lay-serif", mini: "mini-serif", group: "classic",
      pals: ["crimson", "gold", "ink", "forest", "sapphire", "violet"] },
    { id: "center",   name: "Centered",      lay: "lay-center",   mini: "mini-center",   group: "classic",
      pals: ["rose", "violet", "sapphire", "ink", "teal", "crimson"] },
    { id: "split",    name: "Split Header",  lay: "lay-split",    mini: "mini-split",    group: "modern",
      pals: ["cyan", "forest", "sunset", "indigo", "emerald", "rose"] },
    { id: "rail",     name: "Accent Rail",   lay: "lay-rail",     mini: "mini-rail",     group: "modern",
      pals: ["forest", "crimson", "indigo", "gold", "cyan", "sunset"] }
  ];
  var PALETTES = [
    { id: "emerald",  name: "Emerald",  acc: "#059669", soft: "#d1fae5", side: "#0f172a" },
    { id: "sapphire", name: "Sapphire", acc: "#2563eb", soft: "#dbeafe", side: "#1e3a8a" },
    { id: "teal",     name: "Teal",     acc: "#0d9488", soft: "#ccfbf1", side: "#134e4a" },
    { id: "violet",   name: "Violet",   acc: "#7c3aed", soft: "#ede9fe", side: "#2e1065" },
    { id: "sunset",   name: "Sunset",   acc: "#ea580c", soft: "#ffedd5", side: "#431407" },
    { id: "crimson",  name: "Crimson",  acc: "#dc2626", soft: "#fee2e2", side: "#450a0a" },
    { id: "gold",     name: "Gold",     acc: "#b45309", soft: "#fef3c7", side: "#292524" },
    { id: "ink",      name: "Ink",      acc: "#111827", soft: "#e5e7eb", side: "#111827" },
    { id: "rose",     name: "Rose",     acc: "#db2777", soft: "#fce7f3", side: "#500724" },
    { id: "cyan",     name: "Cyan",     acc: "#0891b2", soft: "#cffafe", side: "#164e63" },
    { id: "indigo",   name: "Indigo",   acc: "#4f46e5", soft: "#e0e7ff", side: "#1e1b4b" },
    { id: "forest",   name: "Forest",   acc: "#16a34a", soft: "#dcfce7", side: "#14532d" }
  ];
  var TPLS = [];
  LAYOUTS.forEach(function (L) {
    L.pals.forEach(function (pid) {
      var P = null;
      for (var i = 0; i < PALETTES.length; i++) if (PALETTES[i].id === pid) P = PALETTES[i];
      if (P) TPLS.push({ id: L.id + "-" + P.id, name: P.name + " " + L.name, layout: L, pal: P });
    });
  });
  // Old saved resumes used the original 8 template ids — map them over.
  var LEGACY = {
    emerald: "side-l-emerald", ocean: "band-sapphire", teal: "side-l-teal",
    violet: "side-r-violet", sunset: "band-sunset", crimson: "serif-crimson",
    gold: "band-gold", ink: "plain-ink"
  };

  /* ---------- State ---------- */
  var blank = {
    template: "side-l-emerald", accent: "", side: "", photo: null, ats: true,
    name: "", title: "", email: "", phone: "", location: "", linkedin: "",
    summary: "", skills: "",
    exp: [], edu: [], projects: [],
    certs: "", languages: "", hobbies: ""
  };

  var SAMPLE_EXP = {
    template: "side-l-emerald", accent: "", side: "", photo: null, ats: true,
    name: "Ravi Kumar", title: "Senior SDET — Playwright | TypeScript | AI Test Agents",
    email: "ravi.kumar@email.com", phone: "+91 98xxxxxx21", location: "Hyderabad, India",
    linkedin: "linkedin.com/in/ravikumar-sdet",
    summary: "SDET with 6+ years across UI, API and mobile test automation. Built Playwright + TypeScript frameworks from scratch for two product teams, cut regression time from 3 days to 4 hours with parallel CI runs, and introduced AI-assisted test generation and self-healing locators. Comfortable owning quality end to end — strategy, framework, pipeline and mentoring.",
    skills: "Playwright, TypeScript, Selenium, Java, API Testing, Playwright MCP, AI Test Agents, GitHub Actions, Docker, Page Object Model, JMeter, SQL, Agile/Scrum",
    exp: [
      { role: "Senior SDET", company: "FinEdge Technologies", period: "2023 — Present",
        points: "Built a Playwright + TypeScript framework covering 480+ specs across web and API layers\nIntroduced AI agent workflows (Playwright MCP) that draft specs from user stories — 40% faster authoring\nSharded suites on GitHub Actions: full regression in 22 minutes, gating every release\nMentor a team of 4 automation engineers; run fortnightly quality guild sessions" },
      { role: "QA Automation Engineer", company: "Brightcart (e-commerce)", period: "2020 — 2023",
        points: "Automated checkout, payments and order flows with Selenium + TestNG (Java)\nAdded API test layer with REST Assured, catching 30+ integration defects pre-release\nDrove flaky-test cleanup: suite pass rate improved from 78% to 97%" },
      { role: "Software Test Engineer", company: "Qualitree Services", period: "2018 — 2020",
        points: "Manual + exploratory testing for banking clients; wrote 1,200+ test cases\nSelected for the automation fast-track; delivered first Selenium suite in 3 months" }
    ],
    edu: [
      { degree: "B.Tech, Computer Science", school: "JNTU Hyderabad", period: "2014 — 2018", note: "First class with distinction" }
    ],
    projects: [
      { name: "Self-healing test framework (open source)", desc: "Playwright plugin that re-reads the accessibility tree on locator failure and proposes fixes as pull requests. 300+ GitHub stars." },
      { name: "API contract test suite", desc: "Schema-driven contract tests for 40 microservice endpoints, run on every merge." }
    ],
    certs: "Playwright Certified Professional (2025)\nISTQB Foundation Level\nAWS Cloud Practitioner",
    languages: "English, Telugu, Hindi",
    hobbies: "Tech blogging, cricket, chess"
  };

  var SAMPLE_FRESHER = {
    template: "band-sapphire", accent: "", side: "", photo: null, ats: true,
    name: "Ananya Sharma", title: "Aspiring QA Automation Engineer — Playwright | TypeScript",
    email: "ananya.sharma@email.com", phone: "+91 90xxxxxx45", location: "Pune, India",
    linkedin: "linkedin.com/in/ananyasharma-qa",
    summary: "Final-year Computer Science student with hands-on training in modern test automation. Completed a 45-day intensive on Playwright + TypeScript with AI test agents, and built a portfolio framework testing a live demo e-commerce app — UI, API and CI included. Looking for a QA/SDET trainee role where I can grow into a strong automation engineer.",
    skills: "Playwright, TypeScript, JavaScript, API Testing, HTML/CSS, Git & GitHub, GitHub Actions, Page Object Model, SQL basics, Java basics",
    exp: [
      { role: "QA Automation Trainee (course project)", company: "Learn with Palla — 45-day program", period: "2026",
        points: "Built a Playwright + TypeScript framework with 60+ specs for a demo shopping app\nCovered UI flows, API tests and data-driven scenarios with page objects\nSet up GitHub Actions CI running the suite on every push with HTML reports\nUsed AI agents via Playwright MCP to draft and review test scenarios" }
    ],
    edu: [
      { degree: "B.E. Computer Science (final year)", school: "Savitribai Phule Pune University", period: "2022 — 2026", note: "CGPA 8.4/10" },
      { degree: "Intermediate (MPC)", school: "Sri Chaitanya Junior College", period: "2020 — 2022", note: "94%" }
    ],
    projects: [
      { name: "E-commerce automation framework", desc: "Portfolio project: Playwright + TypeScript suite with page objects, fixtures, API layer and CI. github.com/ananya/pw-framework" },
      { name: "College event portal", desc: "Simple web app (HTML/CSS/JS + Firebase) used by 400 students; wrote its smoke test suite." }
    ],
    certs: "45-Day Playwright + TypeScript + AI program — Learn with Palla (2026)\nPostman API Fundamentals Student Expert",
    languages: "English, Hindi, Marathi",
    hobbies: "Competitive programming, sketching, badminton"
  };

  /* First visit shows a filled example (nicer than a blank page);
     ?sample=experienced|fresher forces one. Saved work always wins. */
  var qs = (location.search.match(/[?&]sample=(\w+)/) || [])[1];
  var state = qs === "experienced" ? JSON.parse(JSON.stringify(SAMPLE_EXP))
            : qs === "fresher"     ? JSON.parse(JSON.stringify(SAMPLE_FRESHER))
            : load() || JSON.parse(JSON.stringify(SAMPLE_EXP));

  function load() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function lines(s) {
    return String(s || "").split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function csv(s) {
    return String(s || "").split(/[,\n]+/).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function tpl() {
    var id = LEGACY[state.template] || state.template;
    for (var i = 0; i < TPLS.length; i++) if (TPLS[i].id === id) return TPLS[i];
    return TPLS[0];
  }

  /* ---- effective colours: template palette, unless customised ---- */
  function mixWithWhite(hex, f) { // f=0..1 amount of white
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
    if (!m) return "#e5e7eb";
    var n = parseInt(m[1], 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function ch(v) { return Math.round(v + (255 - v) * f); }
    return "#" + ((1 << 24) + (ch(r) << 16) + (ch(g) << 8) + ch(b)).toString(16).slice(1);
  }
  function colors() {
    var t = tpl();
    var acc = state.accent || t.pal.acc;
    return {
      acc: acc,
      soft: state.accent ? mixWithWhite(acc, .86) : t.pal.soft,
      side: state.side || t.pal.side
    };
  }

  /* =========================================================
     Form
     ========================================================= */
  var form = document.getElementById("rzForm");

  function bindSingles() {
    form.querySelectorAll("[data-k]").forEach(function (el) {
      el.value = state[el.getAttribute("data-k")] || "";
      el.addEventListener("input", function () {
        state[el.getAttribute("data-k")] = el.value;
        save(); renderPreview();
      });
    });
  }

  /* --- repeatable lists --- */
  function itemHTML(kind, i, it) {
    if (kind === "exp") return (
      '<div class="rz-2col">' +
        '<div><label>Job title</label><input class="input" data-f="role" value="' + esc(it.role) + '" /></div>' +
        '<div><label>Company</label><input class="input" data-f="company" value="' + esc(it.company) + '" /></div>' +
      '</div>' +
      '<div><label>Period (e.g. 2022 — Present)</label><input class="input" data-f="period" value="' + esc(it.period) + '" /></div>' +
      '<div><label>Highlights — one per line</label><textarea class="textarea" data-f="points">' + esc(it.points) + '</textarea></div>'
    );
    if (kind === "edu") return (
      '<div class="rz-2col">' +
        '<div><label>Degree / course</label><input class="input" data-f="degree" value="' + esc(it.degree) + '" /></div>' +
        '<div><label>School / college</label><input class="input" data-f="school" value="' + esc(it.school) + '" /></div>' +
      '</div>' +
      '<div class="rz-2col">' +
        '<div><label>Period</label><input class="input" data-f="period" value="' + esc(it.period) + '" /></div>' +
        '<div><label>Score / note</label><input class="input" data-f="note" value="' + esc(it.note) + '" /></div>' +
      '</div>'
    );
    return (
      '<div><label>Project name</label><input class="input" data-f="name" value="' + esc(it.name) + '" /></div>' +
      '<div><label>One-line description</label><textarea class="textarea" style="min-height:56px" data-f="desc">' + esc(it.desc) + '</textarea></div>'
    );
  }

  function renderList(kind) {
    var wrap = document.getElementById(kind + "List");
    wrap.innerHTML = "";
    state[kind].forEach(function (it, i) {
      var div = document.createElement("div");
      div.className = "rz-item";
      div.innerHTML = '<button type="button" class="rz-del" aria-label="Remove">✕</button>' + itemHTML(kind, i, it);
      div.querySelector(".rz-del").addEventListener("click", function () {
        state[kind].splice(i, 1); save(); renderList(kind); renderPreview();
      });
      div.querySelectorAll("[data-f]").forEach(function (el) {
        el.addEventListener("input", function () {
          state[kind][i][el.getAttribute("data-f")] = el.value; save(); renderPreview();
        });
      });
      wrap.appendChild(div);
    });
  }

  document.getElementById("addExp").addEventListener("click", function () {
    state.exp.push({ role: "", company: "", period: "", points: "" }); save(); renderList("exp");
  });
  document.getElementById("addEdu").addEventListener("click", function () {
    state.edu.push({ degree: "", school: "", period: "", note: "" }); save(); renderList("edu");
  });
  document.getElementById("addProj").addEventListener("click", function () {
    state.projects.push({ name: "", desc: "" }); save(); renderList("projects");
  });

  /* --- photo --- */
  var photoInput = document.getElementById("rzPhoto");
  var photoThumb = document.getElementById("rzPhotoThumb");
  var photoRemove = document.getElementById("rzPhotoRemove");

  photoInput.addEventListener("change", function () {
    var f = photoInput.files && photoInput.files[0];
    if (!f) return;
    var img = new Image();
    var rd = new FileReader();
    rd.onload = function () {
      img.onload = function () {
        var max = 400, w = img.width, h = img.height, k = Math.min(1, max / Math.max(w, h));
        var cv = document.createElement("canvas");
        cv.width = Math.round(w * k); cv.height = Math.round(h * k);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        state.photo = cv.toDataURL("image/jpeg", 0.85);
        save(); syncPhotoUI(); renderPreview();
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(f);
  });
  photoRemove.addEventListener("click", function () {
    state.photo = null; photoInput.value = ""; save(); syncPhotoUI(); renderPreview();
  });
  function syncPhotoUI() {
    photoThumb.style.display = state.photo ? "block" : "none";
    photoRemove.style.display = state.photo ? "inline-flex" : "none";
    if (state.photo) photoThumb.src = state.photo;
  }

  /* --- template picker: 60-card gallery + filters + colour bar --- */
  var tplRow = document.getElementById("tplRow");

  function miniExtras(mini) {
    if (mini === "mini-band")
      return '<i class="mm-bandbar"></i>';
    if (mini === "mini-side-l" || mini === "mini-side-r")
      return '<i class="mm-side"></i><i class="mm-s s1"></i><i class="mm-s s2"></i><i class="mm-s s3"></i>';
    if (mini === "mini-bandside")
      return '<i class="mm-bandbar"></i><i class="mm-side"></i><i class="mm-s s1"></i><i class="mm-s s2"></i><i class="mm-s s3"></i>';
    if (mini === "mini-topline")
      return '<i class="mm-topbar"></i>';
    if (mini === "mini-split")
      return '<i class="mm-r r1"></i><i class="mm-r r2"></i><i class="mm-headrule"></i>';
    if (mini === "mini-rail")
      return '<i class="mm-rb rb1"></i><i class="mm-rb rb2"></i>';
    return "";
  }

  // One card per LAYOUT (10 cards, easy to scan) — colours are chosen
  // with the swatches, so every layout still comes in every colour.
  LAYOUTS.forEach(function (L) {
    var P = null;
    for (var i = 0; i < PALETTES.length; i++) if (PALETTES[i].id === L.pals[0]) P = PALETTES[i];
    var b = document.createElement("button");
    b.type = "button"; b.className = "tpl-card"; b.setAttribute("data-lay", L.id);
    b.title = L.name;
    b.innerHTML =
      '<span class="tpl-mini ' + L.mini + '" style="--a:' + P.acc + ';--s:' + P.side + '" aria-hidden="true">' +
        miniExtras(L.mini) +
        '<i class="mm-name"></i><i class="mm-acc"></i>' +
        '<i class="mm-l l1"></i><i class="mm-l l2"></i><i class="mm-l l3"></i>' +
        '<i class="mm-acc2"></i><i class="mm-l l4"></i><i class="mm-l l5"></i>' +
      "</span>" +
      '<span class="tpl-name">' + esc(L.name) + "</span>";
    b.addEventListener("click", function () {
      // keep the current colour family when the new layout has it too
      var curPal = tpl().pal.id;
      var palId = L.pals.indexOf(curPal) >= 0 ? curPal : L.pals[0];
      state.template = L.id + "-" + palId;
      save(); syncTplUI(); syncColorUI(); renderPreview();
    });
    tplRow.appendChild(b);
  });
  function syncTplUI() {
    var layId = tpl().layout.id;
    tplRow.querySelectorAll(".tpl-card").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lay") === layId);
    });
  }

  /* --- colour bar: preset swatches + custom pickers --- */
  var cbAccent = document.getElementById("cbAccent");
  var cbSide = document.getElementById("cbSide");
  var cbReset = document.getElementById("cbReset");
  var cbSwatches = document.getElementById("cbSwatches");
  if (cbSwatches) {
    PALETTES.forEach(function (p) {
      var s = document.createElement("button");
      s.type = "button"; s.className = "rz-swatch"; s.title = p.name;
      s.style.background = p.acc;
      s.addEventListener("click", function () {
        state.accent = p.acc; state.side = p.side;
        save(); syncColorUI(); renderPreview();
      });
      cbSwatches.appendChild(s);
    });
  }
  if (cbAccent) cbAccent.addEventListener("input", function () {
    state.accent = cbAccent.value; save(); renderPreview();
  });
  if (cbSide) cbSide.addEventListener("input", function () {
    state.side = cbSide.value; save(); renderPreview();
  });
  if (cbReset) cbReset.addEventListener("click", function () {
    state.accent = ""; state.side = "";
    save(); syncColorUI(); renderPreview();
  });
  function syncColorUI() {
    var c = colors();
    if (cbAccent) cbAccent.value = c.acc;
    if (cbSide) cbSide.value = c.side;
  }

  /* --- toolbar --- */
  document.getElementById("btnSampleExp").addEventListener("click", function () { loadData(SAMPLE_EXP); });
  document.getElementById("btnSampleFre").addEventListener("click", function () { loadData(SAMPLE_FRESHER); });
  document.getElementById("btnClear").addEventListener("click", function () {
    if (confirm("Clear all resume data?")) loadData(blank);
  });
  document.getElementById("btnPdf").addEventListener("click", function () { window.print(); });
  document.getElementById("btnWord").addEventListener("click", downloadWord);

  var atsBox = document.getElementById("rzAts");
  atsBox.addEventListener("change", function () {
    state.ats = atsBox.checked; save(); renderPreview();
  });
  function syncAtsUI() { atsBox.checked = state.ats !== false; }

  function loadData(src) {
    state = JSON.parse(JSON.stringify(src));
    save();
    bindSingles(); renderList("exp"); renderList("edu"); renderList("projects");
    syncPhotoUI(); syncTplUI(); syncColorUI(); syncAtsUI(); renderPreview();
  }

  /* =========================================================
     Preview
     ========================================================= */
  var page = document.getElementById("rzPage");

  function sec(title, inner) {
    return inner ? '<section class="rz-sec"><h2>' + title + '</h2>' + inner + '</section>' : "";
  }

  function renderPreview() {
    var t = tpl(), L = t.layout;
    var ats = state.ats !== false;
    // ATS mode collapses sidebar layouts to a single column.
    var lay = (ats && L.group === "sidebar")
      ? (L.id === "bandside" ? "lay-band" : "lay-plain")
      : L.lay;
    page.className = "rz-page " + lay;
    var c = colors();
    page.style.setProperty("--acc", c.acc);
    page.style.setProperty("--accSoft", c.soft);
    page.style.setProperty("--sideBg", c.side);

    var contacts = "";
    if (state.email)    contacts += "<span><b>@</b>" + esc(state.email) + "</span>";
    if (state.phone)    contacts += "<span><b>✆</b>" + esc(state.phone) + "</span>";
    if (state.location) contacts += "<span><b>⌂</b>" + esc(state.location) + "</span>";
    if (state.linkedin) contacts += "<span><b>in</b>" + esc(state.linkedin) + "</span>";

    var head =
      '<header class="rz-head">' +
        (state.photo ? '<img class="rz-avatar" src="' + state.photo + '" alt="" />' : "") +
        '<div><div class="rz-name">' + (esc(state.name) || "Your Name") + "</div>" +
        (state.title ? '<div class="rz-role">' + esc(state.title) + "</div>" : "") +
        (contacts ? '<div class="rz-contacts">' + contacts + "</div>" : "") +
        "</div></header>";

    var expHtml = state.exp.map(function (e) {
      var pts = lines(e.points).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
      return '<div class="rz-entry"><div class="rz-entry-top"><b>' + esc(e.role) + '</b><span class="rz-when">' + esc(e.period) + '</span></div>' +
             '<div class="rz-org">' + esc(e.company) + "</div>" + (pts ? "<ul>" + pts + "</ul>" : "") + "</div>";
    }).join("");

    var eduHtml = state.edu.map(function (e) {
      return '<div class="rz-entry"><div class="rz-entry-top"><b>' + esc(e.degree) + '</b><span class="rz-when">' + esc(e.period) + '</span></div>' +
             '<div class="rz-org">' + esc(e.school) + "</div>" + (e.note ? "<p>" + esc(e.note) + "</p>" : "") + "</div>";
    }).join("");

    var projHtml = state.projects.map(function (p) {
      return '<div class="rz-entry"><div class="rz-entry-top"><b>' + esc(p.name) + "</b></div>" +
             (p.desc ? "<p>" + esc(p.desc) + "</p>" : "") + "</div>";
    }).join("");

    var skillList = csv(state.skills);
    var skillsHtml = "";
    if (skillList.length) {
      skillsHtml = ats
        ? "<p>" + skillList.map(esc).join(" · ") + "</p>"
        : '<div class="rz-chips">' + skillList.map(function (s) { return '<span class="rz-chip">' + esc(s) + "</span>"; }).join(" ") + "</div>";
    }

    var certsHtml = lines(state.certs).map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
    if (certsHtml) certsHtml = '<ul class="rz-list">' + certsHtml + "</ul>";

    var langHtml = state.languages ? "<p>" + esc(state.languages) + "</p>" : "";
    var hobHtml = state.hobbies ? "<p>" + esc(state.hobbies) + "</p>" : "";

    var mainCore =
      sec("Professional Summary", state.summary ? "<p>" + esc(state.summary) + "</p>" : "") +
      sec("Work Experience", expHtml) +
      sec("Projects", projHtml);

    var sideCore =
      sec("Skills", skillsHtml) +
      sec("Education", eduHtml) +
      sec("Certifications", certsHtml) +
      sec("Languages", langHtml) +
      sec("Interests", hobHtml);

    var hasSide = !ats && L.group === "sidebar";
    var body;
    if (hasSide) {
      body = '<div class="rz-body"><aside class="rz-side">' + sideCore + '</aside><div class="rz-main">' + mainCore + "</div></div>";
    } else {
      body = '<div class="rz-body"><div class="rz-main">' +
        sec("Professional Summary", state.summary ? "<p>" + esc(state.summary) + "</p>" : "") +
        sec("Skills", skillsHtml) +
        sec("Work Experience", expHtml) +
        sec("Projects", projHtml) +
        sec("Education", eduHtml) +
        sec("Certifications", certsHtml) +
        sec("Languages", langHtml) +
        sec("Interests", hobHtml) +
        "</div></div>";
    }

    page.innerHTML = head + body;
    requestAnimationFrame(fitPreview);
  }

  /* --- scale the A4 page to fit its column --- */
  var wrap = document.getElementById("rzWrap");
  var scaleBox = document.getElementById("rzScale");
  function fitPreview() {
    var w = wrap.clientWidth;
    var k = Math.min(1, w / 796);
    scaleBox.style.transform = "scale(" + k + ")";
    scaleBox.style.width = "796px";
    wrap.style.height = page.offsetHeight * k + "px";
  }
  window.addEventListener("resize", fitPreview);

  /* =========================================================
     Word export (.doc = HTML Word happily opens)
     ========================================================= */
  function downloadWord() {
    var acc = colors().acc;
    function wsec(title, inner) {
      return inner ? '<h2 style="font-size:13pt;color:' + acc + ';text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ' + acc + ';padding-bottom:2pt;margin:14pt 0 6pt">' + title + "</h2>" + inner : "";
    }
    var contacts = [state.email, state.phone, state.location, state.linkedin].filter(Boolean).map(esc).join(" &nbsp;|&nbsp; ");

    var expHtml = state.exp.map(function (e) {
      var pts = lines(e.points).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
      return '<p style="margin:8pt 0 0"><b>' + esc(e.role) + "</b> — " + esc(e.company) +
             ' <span style="color:#666">(' + esc(e.period) + ")</span></p>" + (pts ? '<ul style="margin:3pt 0">' + pts + "</ul>" : "");
    }).join("");

    var eduHtml = state.edu.map(function (e) {
      return '<p style="margin:6pt 0 0"><b>' + esc(e.degree) + "</b> — " + esc(e.school) +
             ' <span style="color:#666">(' + esc(e.period) + ")</span>" + (e.note ? "<br/>" + esc(e.note) : "") + "</p>";
    }).join("");

    var projHtml = state.projects.map(function (p) {
      return '<p style="margin:6pt 0 0"><b>' + esc(p.name) + "</b>" + (p.desc ? "<br/>" + esc(p.desc) : "") + "</p>";
    }).join("");

    var certsHtml = lines(state.certs).map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
    if (certsHtml) certsHtml = '<ul style="margin:3pt 0">' + certsHtml + "</ul>";

    var html =
      '<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>Resume</title></head>' +
      '<body style="font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1f2937;line-height:1.4">' +
      '<h1 style="font-size:22pt;margin:0;color:#111">' + (esc(state.name) || "Your Name") + "</h1>" +
      (state.title ? '<p style="margin:2pt 0;color:' + acc + ';font-weight:bold">' + esc(state.title) + "</p>" : "") +
      (contacts ? '<p style="margin:4pt 0;color:#555;font-size:10pt">' + contacts + "</p>" : "") +
      wsec("Professional Summary", state.summary ? "<p>" + esc(state.summary) + "</p>" : "") +
      wsec("Skills", csv(state.skills).length ? "<p>" + csv(state.skills).map(esc).join(" · ") + "</p>" : "") +
      wsec("Work Experience", expHtml) +
      wsec("Projects", projHtml) +
      wsec("Education", eduHtml) +
      wsec("Certifications", certsHtml) +
      wsec("Languages", state.languages ? "<p>" + esc(state.languages) + "</p>" : "") +
      wsec("Interests", state.hobbies ? "<p>" + esc(state.hobbies) + "</p>" : "") +
      "</body></html>";

    var blob = new Blob(["﻿" + html], { type: "application/msword" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = ((state.name || "resume").replace(/[^\w]+/g, "-") + "-resume.doc").toLowerCase();
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  /* =========================================================
     Wizard: fill in phases, finish with a ready-to-download resume
     ========================================================= */
  var STEP_LABELS = ["Basics", "Summary", "Skills", "Experience", "Projects & Edu", "Extras", "Finish"];
  // Each step is a route: resume.html#basics … #finish. Browser
  // back/forward moves between steps and refresh keeps your place.
  var ROUTES = ["basics", "summary", "skills", "experience", "projects", "extras", "finish"];
  var TOTAL = 6, cur = 1;
  var stepEls = form.querySelectorAll(".rz-step");
  var readyEl = document.getElementById("rzReady");
  var stepperEl = document.getElementById("rzStepper");
  var backBtn = document.getElementById("stepBack");
  var nextBtn = document.getElementById("stepNext");
  var infoEl = document.getElementById("stepInfo");

  STEP_LABELS.forEach(function (lbl, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "rz-schip";
    b.innerHTML = '<span class="n">' + (i + 1) + "</span>" + lbl;
    b.addEventListener("click", function () { showStep(i + 1, true); });
    stepperEl.appendChild(b);
  });

  function stepFromHash() {
    var h = (window.location.hash || "").replace(/^#\/?/, "").toLowerCase();
    var i = ROUTES.indexOf(h);
    return i >= 0 ? i + 1 : 1;
  }

  function showStep(n, fromUser) {
    cur = n;
    stepEls.forEach(function (s) { s.hidden = +s.getAttribute("data-step") !== n; });
    readyEl.hidden = n !== TOTAL + 1;
    backBtn.disabled = n === 1;
    nextBtn.hidden = n === TOTAL + 1;
    nextBtn.textContent = n === TOTAL ? "Finish ✓" : "Next →";
    infoEl.textContent = n === TOTAL + 1 ? "Done — download your resume" : "Step " + n + " of " + TOTAL;
    stepperEl.querySelectorAll(".rz-schip").forEach(function (b, i) {
      var on = i + 1 === n, done = i + 1 < n;
      b.classList.toggle("active", on);
      b.classList.toggle("done", done);
      var num = b.querySelector(".n");
      if (num) num.textContent = done ? "✓" : String(i + 1);
    });
    var bar = document.getElementById("rzProgressBar");
    if (bar) bar.style.width = Math.round(((n - 1) / TOTAL) * 100) + "%";
    if (fromUser) {
      var want = "#" + ROUTES[n - 1];
      if (window.location.hash !== want) window.location.hash = want;
      if (window.innerWidth < 1080) form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  window.addEventListener("hashchange", function () {
    var n = stepFromHash();
    if (n !== cur) showStep(n, false);
  });
  backBtn.addEventListener("click", function () { showStep(Math.max(1, cur - 1), true); });
  nextBtn.addEventListener("click", function () { showStep(Math.min(TOTAL + 1, cur + 1), true); });
  document.getElementById("btnPdf2").addEventListener("click", function () { window.print(); });
  document.getElementById("btnWord2").addEventListener("click", downloadWord);

  /* =========================================================
     Import from LinkedIn — the official data export.
     LinkedIn's API doesn't share experience/education with normal
     apps, but every member can download their own data as a ZIP
     (Settings & Privacy → Data privacy → Get a copy of your data).
     We read that ZIP (or its CSV files) fully in the browser —
     nothing is uploaded anywhere.
     ========================================================= */
  var liInput = document.getElementById("rzLiFile");
  var liMsg = document.getElementById("rzLiMsg");

  function liSay(msg, ok) {
    if (!liMsg) return;
    liMsg.textContent = msg;
    liMsg.className = "rz-limsg " + (ok ? "ok" : "err");
  }

  function parseCsv(text) {
    var rows = [], row = [], cur = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += ch;
      }
      else if (ch === '"') q = true;
      else if (ch === ",") { row.push(cur); cur = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (cur !== "" || row.length) { row.push(cur); rows.push(row); row = []; cur = ""; }
        if (ch === "\r" && text[i + 1] === "\n") i++;
      }
      else cur += ch;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }
  function csvObjects(text) {
    var rows = parseCsv(text);
    if (rows.length < 2) return [];
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    return rows.slice(1).map(function (r) {
      var o = {};
      head.forEach(function (h, i) { o[h] = (r[i] || "").trim(); });
      return o;
    });
  }

  function applyLinkedIn(files) { // files = { lowercased filename: text }
    var got = [];
    function file(re) {
      for (var k in files) if (re.test(k)) return files[k];
      return null;
    }

    var t = file(/(^|\/)profile\.csv$/);
    if (t) {
      var p = csvObjects(t)[0] || {};
      if (p["first name"] || p["last name"])
        state.name = ((p["first name"] || "") + " " + (p["last name"] || "")).trim();
      if (p.headline) state.title = p.headline;
      if (p.summary) state.summary = p.summary;
      if (p["geo location"]) state.location = p["geo location"];
      got.push("profile");
    }
    t = file(/positions\.csv$/);
    if (t) {
      var pos = csvObjects(t);
      if (pos.length) {
        state.exp = pos.map(function (r) {
          return {
            role: r.title || "", company: r["company name"] || "",
            period: (r["started on"] || "") + " — " + (r["finished on"] || "Present"),
            points: r.description || ""
          };
        });
        got.push(pos.length + " roles");
      }
    }
    t = file(/education\.csv$/);
    if (t) {
      var edu = csvObjects(t);
      if (edu.length) {
        state.edu = edu.map(function (r) {
          return {
            degree: r["degree name"] || "Course", school: r["school name"] || "",
            period: ((r["start date"] || "") + " — " + (r["end date"] || "")).replace(/^ — $/, ""),
            note: r.notes || ""
          };
        });
        got.push(edu.length + " education");
      }
    }
    t = file(/skills\.csv$/);
    if (t) {
      var sk = csvObjects(t).map(function (r) { return r.name; }).filter(Boolean);
      if (sk.length) { state.skills = sk.join(", "); got.push(sk.length + " skills"); }
    }
    t = file(/certifications\.csv$/);
    if (t) {
      var ce = csvObjects(t).map(function (r) {
        return [r.name, r.authority && "— " + r.authority,
                r["started on"] && "(" + r["started on"] + ")"].filter(Boolean).join(" ");
      }).filter(Boolean);
      if (ce.length) { state.certs = ce.join("\n"); got.push(ce.length + " certifications"); }
    }
    t = file(/email addresses\.csv$/);
    if (t) {
      var em = csvObjects(t);
      var prim = null;
      em.forEach(function (r) { if (!prim || /yes/i.test(r.primary || "")) prim = r["email address"] || prim; });
      if (prim) { state.email = prim; got.push("email"); }
    }
    t = file(/phonenumbers\.csv$/) || file(/phone numbers\.csv$/);
    if (t) {
      var ph = csvObjects(t)[0];
      if (ph && ph.number) { state.phone = ph.number; got.push("phone"); }
    }
    t = file(/languages\.csv$/);
    if (t) {
      var la = csvObjects(t).map(function (r) { return r.name; }).filter(Boolean);
      if (la.length) { state.languages = la.join(", "); got.push("languages"); }
    }
    t = file(/projects\.csv$/);
    if (t) {
      var pr = csvObjects(t);
      if (pr.length) {
        state.projects = pr.map(function (r) {
          return { name: r.title || "", desc: r.description || "" };
        });
        got.push(pr.length + " projects");
      }
    }

    if (!got.length) {
      liSay("No LinkedIn files recognised — upload the export ZIP, or its CSV files (Profile, Positions, Education, Skills…).", false);
      return;
    }
    save();
    bindSingles(); renderList("exp"); renderList("edu"); renderList("projects");
    renderPreview();
    liSay("✓ Imported: " + got.join(", ") + ". Now review each step and polish the wording.", true);
  }

  if (liInput) liInput.addEventListener("change", function () {
    var fl = liInput.files;
    if (!fl || !fl.length) return;
    liSay("Reading…", true);
    var texts = {}, pending = 0;

    function done() { if (--pending === 0) applyLinkedIn(texts); }

    for (var i = 0; i < fl.length; i++) (function (f) {
      if (/\.zip$/i.test(f.name)) {
        if (!window.JSZip) { liSay("ZIP reader didn't load — unzip the file and upload the CSVs instead.", false); return; }
        pending++;
        JSZip.loadAsync(f).then(function (zip) {
          var inner = 0;
          zip.forEach(function (path, entry) {
            if (/\.csv$/i.test(path)) {
              inner++; pending++;
              entry.async("string").then(function (txt) {
                texts[path.toLowerCase()] = txt; done();
              }).catch(done);
            }
          });
          if (!inner) liSay("That ZIP has no CSV files inside.", false);
          done();
        }).catch(function () { liSay("Couldn't read that ZIP file.", false); done(); });
      } else {
        pending++;
        var rd = new FileReader();
        rd.onload = function () { texts[f.name.toLowerCase()] = rd.result; done(); };
        rd.onerror = done;
        rd.readAsText(f);
      }
    })(fl[i]);

    if (!pending) liSay("Please choose the LinkedIn ZIP or its CSV files.", false);
    liInput.value = "";
  });

  /* =========================================================
     Sign in with LinkedIn (OpenID Connect via our worker).
     LinkedIn shares ONLY name, email and photo with apps — the
     ZIP import above is what fills the full work history.
     ========================================================= */
  var LI_API = "https://lwp-api.learnwithpalla.workers.dev";
  var liBtn = document.getElementById("rzLiSignin");

  if (liBtn) {
    // Show the button only when the worker has LinkedIn keys configured.
    fetch(LI_API + "/api/linkedin/enabled")
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.enabled) liBtn.style.display = "inline-flex"; })
      .catch(function () { /* API unreachable — keep hidden */ });
    liBtn.addEventListener("click", function () {
      window.location.href = LI_API + "/api/linkedin/start";
    });
  }

  // Returning from LinkedIn: profile arrives in the URL fragment.
  (function handleLinkedInReturn() {
    var m = window.location.hash.match(/#li=([\w-]+)/);
    var err = window.location.hash.match(/#lierr=(\w+)/);
    if (!m && !err) return;
    history.replaceState(null, "", window.location.pathname + window.location.search);
    if (err) {
      liSay("LinkedIn sign-in didn't complete — please try again, or use the ZIP upload.", false);
      return;
    }
    try {
      var b64 = m[1].replace(/-/g, "+").replace(/_/g, "/");
      var p = JSON.parse(decodeURIComponent(escape(atob(b64))));
      if (p.name) state.name = p.name;
      if (p.email) state.email = p.email;
      save(); bindSingles(); renderPreview();
      liSay("✓ Signed in as " + (p.name || p.email) +
        " — name, email & photo loaded. LinkedIn only shares those three; " +
        "upload your data-export ZIP above to fill experience, education and skills.", true);
      if (p.picture) {
        fetch(LI_API + "/api/linkedin/photo?url=" + encodeURIComponent(p.picture))
          .then(function (r) { if (!r.ok) throw 0; return r.blob(); })
          .then(function (b) {
            var rd = new FileReader();
            rd.onload = function () {
              state.photo = rd.result;
              save(); syncPhotoUI(); renderPreview();
            };
            rd.readAsDataURL(b);
          })
          .catch(function () { /* photo is optional — ignore */ });
      }
    } catch (e) { /* malformed fragment — ignore */ }
  })();

  /* ---------- init ---------- */
  bindSingles();
  renderList("exp"); renderList("edu"); renderList("projects");
  syncPhotoUI(); syncTplUI(); syncColorUI(); syncAtsUI(); renderPreview();
  showStep(stepFromHash(), false);
})();
