/* =========================================================
   Learn with Palla — free resume builder
   Vanilla JS. State lives in memory + localStorage("lwp_resume").
   Exports: PDF via print dialog, Word via HTML .doc blob.
   ========================================================= */
(function () {
  "use strict";

  var LS_KEY = "lwp_resume";

  /* ---------- Templates ---------- */
  var TPLS = [
    { id: "emerald", name: "Emerald Pro",   lay: "lay-side-l", dot: "#059669", dot2: "#0f172a" },
    { id: "ocean",   name: "Ocean Blue",    lay: "lay-band",   dot: "#2563eb", dot2: "#1e3a8a" },
    { id: "teal",    name: "Teal Fresh",    lay: "lay-side-l", dot: "#0d9488", dot2: "#134e4a" },
    { id: "violet",  name: "Royal Violet",  lay: "lay-side-r", dot: "#7c3aed", dot2: "#2e1065" },
    { id: "sunset",  name: "Sunset Bold",   lay: "lay-band",   dot: "#ea580c", dot2: "#431407" },
    { id: "crimson", name: "Crimson Serif", lay: "lay-plain",  dot: "#dc2626", dot2: "#450a0a" },
    { id: "gold",    name: "Golden Slate",  lay: "lay-band",   dot: "#d97706", dot2: "#292524" },
    { id: "ink",     name: "Minimal Ink",   lay: "lay-plain",  dot: "#111827", dot2: "#9ca3af" }
  ];

  /* ---------- State ---------- */
  var blank = {
    template: "emerald", photo: null, ats: true,
    name: "", title: "", email: "", phone: "", location: "", linkedin: "",
    summary: "", skills: "",
    exp: [], edu: [], projects: [],
    certs: "", languages: "", hobbies: ""
  };

  var SAMPLE_EXP = {
    template: "emerald", photo: null, ats: true,
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
    template: "ocean", photo: null, ats: true,
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
    for (var i = 0; i < TPLS.length; i++) if (TPLS[i].id === state.template) return TPLS[i];
    return TPLS[0];
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

  /* --- template picker --- */
  var tplRow = document.getElementById("tplRow");
  TPLS.forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "tpl-btn"; b.setAttribute("data-tpl", t.id);
    b.innerHTML = '<span class="tpl-dot" style="background:' + t.dot + '"></span>' +
                  '<span class="tpl-dot" style="background:' + t.dot2 + '"></span>' + esc(t.name);
    b.addEventListener("click", function () {
      state.template = t.id; save(); syncTplUI(); renderPreview();
    });
    tplRow.appendChild(b);
  });
  function syncTplUI() {
    tplRow.querySelectorAll(".tpl-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tpl") === state.template);
    });
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
    syncPhotoUI(); syncTplUI(); syncAtsUI(); renderPreview();
  }

  /* =========================================================
     Preview
     ========================================================= */
  var page = document.getElementById("rzPage");

  function sec(title, inner) {
    return inner ? '<section class="rz-sec"><h2>' + title + '</h2>' + inner + '</section>' : "";
  }

  function renderPreview() {
    var t = tpl();
    var ats = state.ats !== false;
    page.className = "rz-page tpl-" + t.id + " " + (ats && t.lay !== "lay-band" ? "lay-plain" : t.lay);

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

    var hasSide = !ats && (t.lay === "lay-side-l" || t.lay === "lay-side-r");
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
    var t = tpl();
    var acc = t.dot;
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

  /* ---------- init ---------- */
  bindSingles();
  renderList("exp"); renderList("edu"); renderList("projects");
  syncPhotoUI(); syncTplUI(); syncAtsUI(); renderPreview();
})();
