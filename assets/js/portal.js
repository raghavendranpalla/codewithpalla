/* =========================================================
   Learn with Palla — Student Portal
   Google Sign-In (free) + per-batch access codes.

   HOW IT WORKS
   1. Anyone can sign in with their Google / Gmail account.
   2. After signing in, the student enters their BATCH CODE.
   3. The correct code unlocks ONLY that batch's content
      (live class link + recordings from your Google Drive).

   SECURITY NOTE (read once):
   This is a static site, so the batch codes live in this file
   and a determined technical user could read them. That's fine
   as a friendly gate. For REAL protection of recordings, share
   each Google Drive folder ONLY with that batch's Gmail
   addresses (or "Anyone with the link"); Drive then enforces
   access even if a portal link leaks.
   ========================================================= */
(function () {
  "use strict";

  /* =======================================================
     1) CONFIG — EDIT THIS SECTION
     ======================================================= */
  var CONFIG = {
    // --- Your Google OAuth Client ID (free to create) ---
    // Get it from Google Cloud Console (see SETUP steps Palla was given).
    // It looks like: 1234567890-abc123.apps.googleusercontent.com
    clientId: "302634236502-gkdpddkai6ved64502qohp1c95ilttcj.apps.googleusercontent.com",

    // --- Login notifications (optional, free) ---
    // Paste your Google Apps Script web-app URL here to get an email +
    // a Google Sheet log every time someone signs in. Leave blank to
    // turn notifications off. (Setup steps were provided separately.)
    notifyUrl: "",

    // --- Portal API (Cloudflare Worker + Neon Postgres) ---
    // Every sign-in is verified and logged there (email + IP), and the
    // server answers who this is: registered student / free trial /
    // blocked (same account on too many machines). Leave blank to turn
    // the API off — the portal then uses only the emails[] lists below.
    apiUrl: "https://lwp-api.learnwithpalla.workers.dev",

    // Unregistered Google accounts get a FREE TRIAL of the first N days.
    trialDays: 4,

    // --- Your batches ---
    // A student is matched to a batch by their Google email.
    // Put each student's Gmail in `emails`. When they sign in, if
    // their email is on the list they AUTOMATICALLY see this batch's
    // content (no code needed). `code` is an optional backup so you
    // can also let someone in by code if they're not on the list yet.
    //
    //   emails    = lowercase Gmail addresses of this batch's students
    //   classUrl  = live class link (Zoom / Meet) — optional
    //   drive     = Google Drive folder of all recordings — optional
    //   resources = the per-day links (videos, downloadable PDFs)
    batches: [
      {
        id: "jun26",
        name: "June 2026 Batch",
        code: "JUNE-2026",
        emails: [
          "raghavendranpalla@gmail.com",
          "bunnya42@gmail.com",
          "nalamatisyamsai@gmail.com",
          "subbupalla555@gmail.com",
          "suresh.kb78@gmail.com",
          "surendraneelam5@gmail.com",
          "kirankayala@gmail.com",
          "keerthi.vasanta@gmail.com",
          "ponnada.upendrasai@gmail.com",
          "sreecharansdet95@gmail.com",
          "lalitha.yarramsetty@gmail.com",
          "kranthikollapati369@gmail.com",
          "rojapavitra1308@gmail.com",
          "narsing.mrao@gmail.com",
          "vasanthigopisetti4912@gmail.com",
          "suresh.marripalem@gmail.com",
          "shankarpalla1@gmail.com",
          "korlatharunchandra@gmail.com",
          "emailsragunat@gmail.com",
        ],
        classUrl: "",  // optional live class link
        // Content is organised by day. Each day has a title, a short
        // description, and its resources. For videos, `vid` is the
        // ENCRYPTED Drive id (so the link is not visible in the DOM) and
        // `poster` is the thumbnail shown before play.
        days: [
          {
            title: "Day 1 — Node.js & VS Code Installation",
            description: "We set up the development environment you'll use for the whole course. You'll install Node.js (the JavaScript runtime that powers Playwright and your tooling) and verify it from the terminal, then install Visual Studio Code and configure it for automation work. Watch both parts in order — by the end you'll have a working setup ready to write your first test.",
            resources: [
              { type: "video", label: "Part 1 — Installing Node.js", poster: "assets/img/thumb-day1-part1.svg", vid: "XRFHdQMAISgGZ3dCc0ADCUIIbzswAzQaZGYDU3lHGkc6" },
              { type: "video", label: "Part 2 — Installing & configuring VS Code", poster: "assets/img/thumb-day1-part2.svg", vid: "XSREUiRZCDYZDBdbAVxGATxdRSI4Mx8UC0JmWFQFCB0F" },
              { type: "pdf", label: "Study & Practice Guide (PDF)", vid: "XSIUERsrMyQYNlUEV0VFCxgVYxotMAwuAFdmREVsQREq" }
            ]
          },
          {
            title: "Day 2 — JavaScript Comments & Variables",
            description: "Your first steps writing JavaScript. In Part 1 you'll learn how to write comments — single-line and multi-line — to document and organise your code. In Part 2 you'll learn variables: how to declare them with let and const, name them well, and store the data your tests will work with. Watch both parts in order.",
            resources: [
              { type: "video", label: "Part 1 — JavaScript Comments", poster: "assets/img/thumb-day2-part1.svg", vid: "XUcWY1gbUCYVPFFjA0JpKBkTdSVWMRxvP0VcVXVXCS44" },
              { type: "video", label: "Part 2 — JavaScript Variables", poster: "assets/img/thumb-day2-part2.svg", vid: "XQUzVgsLUlA9NVJLdHRDCAIDRwULBhM/B0lnAVNRLjU8" },
              { type: "pdf", label: "Study & Practice Guide (PDF)", vid: "XUIEQh4BFhM+MhJ9cktvXCEyQAkcLFUnKmtGB3VzDjk8" }
            ]
          },
          {
            title: "Day 3 — Data Types & Variable Scoping",
            description: "Two concepts every test you write will rely on. In Part 1 you'll learn JavaScript's data types — strings, numbers, booleans, undefined, null and objects — and how to check them with typeof. In Part 2 you'll learn variable scoping: global, function and block scope, and why let/const behave differently from var. Watch both parts in order.",
            resources: [
              { type: "video", label: "Part 1 — JavaScript Data Types", poster: "assets/img/thumb-day3-part1.svg", vid: "XT4KahpXPRYAIA5jZWMHWRwiWxgFUxckYWcEUx8bGE4z" },
              { type: "video", label: "Part 2 — Variable Scoping", poster: "assets/img/thumb-day3-part2.svg", vid: "XSVDViweJiZlZRVHUmhOVRVAdDwwVDExEBMHAUpAFj8H" },
              { type: "pdf", label: "Study & Practice Guide (PDF)", vid: "XTMvUAIeHT8/I0ADc0V1KxYdTFoCHCw/NmV3QmZhGSE+" }
            ]
          },
          {
            title: "Day 4 — Template Literals & Truthy/Falsy Values",
            description: "Two tools you'll use in almost every test. First, template literals — building strings with backticks and ${} interpolation, so your logs and locators read naturally instead of messy concatenation. Then truthy and falsy values: which values JavaScript treats as true or false inside a condition, the six falsy values to memorise, and how this powers clean if-checks in your automation code.",
            resources: [
              { type: "video", label: "Part 1 — Template Literals & Truthy/Falsy Values", poster: "assets/img/thumb-day4-part1.svg", vid: "XUcAFUMlDTYeI1NDb2JCByMIFTg3MAgYPBNAb3MDPxUD" },
              { type: "pdf", label: "Study & Practice Guide (PDF)", vid: "XRszQ188JQMVY1cHY0tPPgQZFicANS4SHw5mfFlZAREp" }
            ]
          },
          {
            title: "Test 1 — Days 2-4 Revision",
            description: "Your first test! 12 exam-style questions covering everything from Days 2-4: comments, variables, data types, variable scoping, template literals and truthy/falsy values. Answer every question, hit Submit, and you'll see your score instantly with the correct answers marked. Retake it as many times as you like — your best score is saved on this device.",
            resources: [
              {
                type: "quiz",
                label: "Test 1 — JavaScript Basics (12 questions)",
                quizId: "t1-js-basics",
                questions: [
                  { q: "Which of these is a correct single-line comment in JavaScript?",
                    opts: ["// this is a comment", "# this is a comment", "<!-- this is a comment -->", "** this is a comment **"], a: 0 },
                  { q: "What happens when this runs?  const city = \"Hyderabad\"; city = \"Delhi\";",
                    opts: ["It prints Delhi", "The value quietly stays Hyderabad", "city becomes undefined", "It throws: TypeError — assignment to constant variable"], a: 3 },
                  { q: "Which variable name is INVALID in JavaScript?",
                    opts: ["first_name", "1stPlace", "$total", "user2"], a: 1 },
                  { q: "Which keyword should you AVOID in new code because it ignores block scope?",
                    opts: ["var", "let", "const", "function"], a: 0 },
                  { q: "What does  typeof \"45\"  return?",
                    opts: ["\"number\"", "\"string\"", "\"object\"", "\"boolean\""], a: 1 },
                  { q: "What does  typeof null  return? (the famous JS quirk)",
                    opts: ["\"null\"", "\"undefined\"", "\"object\"", "\"boolean\""], a: 2 },
                  { q: "A variable that is declared but never given a value holds:",
                    opts: ["null", "0", "undefined", "\"\" (an empty string)"], a: 2 },
                  { q: "After  if (true) { let x = 5; }  what does  console.log(x)  do?",
                    opts: ["Prints 5", "Prints undefined", "Prints null", "ReferenceError — x is not defined"], a: 3 },
                  { q: "With  const name = \"Palla\"  — which line correctly builds \"Hi Palla\" using a template literal?",
                    opts: ["'Hi ${name}'  (single quotes)", "\"Hi ${name}\"  (double quotes)", "`Hi ${name}`  (backticks)", "`Hi {name}`  (backticks, but no $)"], a: 2 },
                  { q: "How many falsy values does JavaScript have (the list from class)?",
                    opts: ["4", "5", "6", "8"], a: 2 },
                  { q: "Which of these values is TRUTHY?",
                    opts: ["\"\" (empty string)", "0", "NaN", "[] (empty array)"], a: 3 },
                  { q: "What does this print?  if (NaN) { console.log(\"yes\"); } else { console.log(\"no\"); }",
                    opts: ["yes", "no", "It throws an error", "Nothing — the code is invalid"], a: 1 }
                ]
              }
            ]
          },
          {
            title: "Day 5 — Type Conversion & Maths with null/undefined",
            description: "How JavaScript changes one type into another — and the traps hiding inside. In Part 1 you'll learn type conversion: explicit conversion with Number(), String() and Boolean(), and the implicit coercion JavaScript does on its own. In Part 2 you'll see what happens when null and undefined land inside numeric expressions — null becomes 0, undefined becomes NaN — and why that difference matters when test data is missing. Watch both parts in order.",
            resources: [
              { type: "video", label: "Part 1 — Type Conversion", poster: "assets/img/thumb-day5-part1.svg", vid: "XRgveyxfNV0BNUJ/ZFhEIjQdcF8dCx1vJG1LQHF+DRMk" },
              { type: "video", label: "Part 2 — Numeric Expressions with null & undefined", poster: "assets/img/thumb-day5-part2.svg", vid: "XSUySS8tBVIwZER0XB9pOBhHci0WKDMTGWBbSlAPWRgh" },
              { type: "pdf", label: "Study & Practice Guide (PDF)", vid: "XQ4ecAwDDBMwNVdCRGZGWwUGSANYJigDCkJ1cwJxIh89" }
            ]
          },
          {
            title: "Day 6 — Arithmetic, Assignment & Comparison Operators",
            description: "The operators your tests will use every single day. Part 1 covers arithmetic: + - * / plus the two everyone forgets — % (remainder) and ** (exponent). Part 2 covers assignment: = and the compound shortcuts += -= *= /= %= that update a variable in place. Part 3 covers comparison: > < >= <= and the difference that matters most in JavaScript — loose == (converts types, \"5\" == 5 is true!) versus strict === (the one you should always use). Watch all three parts in order.",
            resources: [
              { type: "video", label: "Part 1 — Arithmetic Operators", poster: "assets/img/thumb-day6-part1.svg?v=2", vid: "XTASTwcsBlUJamsCCFBPB0QTElYNLwpnGUYBA3t0NAFB" },
              { type: "video", label: "Part 2 — Assignment Operators", poster: "assets/img/thumb-day6-part2.svg?v=2", vid: "XSczeSBCDxAEJnADBWMDAhw0dFYmV1APDG5UUlkFFR4f" },
              { type: "video", label: "Part 3 — Comparison Operators", poster: "assets/img/thumb-day6-part3.svg?v=2", vid: "XTAgEzE3IyhnKlpofkN5PUQEczoEFV1kAHF1AmhmCQ8R" },
              { type: "pdf", label: "Study & Practice Guide (PDF)", vid: "XRYeRyhWC1Q8JBdzB3B5JCIISl1XMSJmOlUHVR9HBT0R" }
            ]
          },
          {
            title: "Day 7 — Logical Operators, Ternary & the switch Statement",
            description: "Decision-making, levelled up. Part 1 covers the logical operators — && (AND: every condition must be true), || (OR: any one is enough) and ! (NOT) — how to combine multiple conditions inside a single if, and the ternary operator cond ? a : b, a whole if/else in one line. Part 2 covers the switch statement — the cleaner way to compare one value against many exact options, with case, break (don't fall through!) and default. Watch both parts in order.",
            resources: [
              { type: "video", label: "Part 1 — Logical Operators (&&, ||), Multi-condition if & Ternary", poster: "assets/img/thumb-day7-part1.svg", vid: "XTUmF1sAPCMQK3sKXX9OPxg6GUMVHVYVOkZ9Y0sFQTsz" },
              { type: "video", label: "Part 2 — The switch Statement", poster: "assets/img/thumb-day7-part2.svg", vid: "XSdEFS8ZFSdmGW5LewJVPA8/V1khFhIuB3tVfnoOJh4l" }
            ]
          }
        ]
      }
    ]
  };

  /* =======================================================
     2) LOGIC — usually no need to edit below
     ======================================================= */
  var LS_USER = "lwp_user";
  var LS_BATCH = "lwp_batch";
  var LS_LOG = "lwp_signins"; // local record of who signed in (this browser)
  var LS_ACCESS = "lwp_access"; // server verdict: student / trial / blocked
  var LS_DEVICE = "lwp_device"; // permanent random id for THIS browser/machine
  var LS_KICKED = "lwp_kicked"; // set when another device took the session

  var els = {
    notice:    document.getElementById("setupNotice"),
    signinBox: document.getElementById("signinBox"),
    gbtn:      document.getElementById("gbtn"),
    gateBox:   document.getElementById("gateBox"),
    contentBox:document.getElementById("contentBox"),
    who:       document.getElementById("who"),
    whoEmail:  document.getElementById("whoEmail"),
    avatar:    document.getElementById("avatar"),
    codeInput: document.getElementById("batchCode"),
    codeBtn:   document.getElementById("unlockBtn"),
    codeMsg:   document.getElementById("codeMsg"),
    content:   document.getElementById("batchContent"),
    signout:   document.getElementById("signoutBtn"),
    signout2:  document.getElementById("signoutBtn2")
  };

  function get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }
  function set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function del(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  // Decode a Google ID token (JWT) to read the verified profile.
  function decodeJwt(token) {
    try {
      var part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      var json = decodeURIComponent(
        atob(part).split("").map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        }).join("")
      );
      return JSON.parse(json);
    } catch (e) { return null; }
  }

  function isConfigured() {
    return CONFIG.clientId &&
      CONFIG.clientId.indexOf("PASTE_YOUR_GOOGLE_CLIENT_ID") === -1;
  }

  function findBatch(id) {
    for (var i = 0; i < CONFIG.batches.length; i++) {
      if (CONFIG.batches[i].id === id) return CONFIG.batches[i];
    }
    return null;
  }

  // Normalise an email for comparison. Gmail ignores dots and +tags and
  // treats googlemail.com as gmail.com — so all those variants match.
  function normEmail(email) {
    var e = String(email || "").trim().toLowerCase();
    var at = e.indexOf("@");
    if (at < 0) return e;
    var local = e.slice(0, at), domain = e.slice(at + 1);
    if (domain === "gmail.com" || domain === "googlemail.com") {
      local = local.split("+")[0].replace(/\./g, "");
      domain = "gmail.com";
    }
    return local + "@" + domain;
  }

  // Match a signed-in email to a batch by its `emails` allow-list.
  function findBatchByEmail(email) {
    if (!email) return null;
    var e = normEmail(email);
    for (var i = 0; i < CONFIG.batches.length; i++) {
      var list = CONFIG.batches[i].emails || [];
      for (var j = 0; j < list.length; j++) {
        if (normEmail(list[j]) === e) return CONFIG.batches[i];
      }
    }
    return null;
  }

  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  // Pull the file ID out of any Google Drive share link.
  function driveId(url) {
    if (!url) return "";
    var s = String(url);
    var m = s.match(/\/d\/([-\w]+)/) || s.match(/[?&]id=([-\w]+)/);
    if (m) return m[1];
    m = s.match(/([-\w]{25,})/);
    return m ? m[1] : "";
  }
  // Build the embeddable /preview URL (plays video / shows PDF in-page).
  function drivePreview(url) {
    var id = driveId(url);
    return id ? "https://drive.google.com/file/d/" + id + "/preview" : url;
  }
  // Poster thumbnail image for a Drive video.
  function driveThumb(url) {
    var id = driveId(url);
    return id ? "https://drive.google.com/thumbnail?id=" + id + "&sz=w1280" : "";
  }

  // Lightweight obfuscation so Drive IDs are NOT readable in View-Source /
  // the DOM. NOTE: this only raises the bar — a determined user with dev
  // tools can still reach the embed once it plays. Real protection is the
  // Drive file's sharing settings (restrict to the batch's emails).
  var OBF_KEY = "lwp!nodeVS#2026";
  function deob(token) {
    try {
      var bin = atob(token), out = "";
      for (var i = 0; i < bin.length; i++) {
        out += String.fromCharCode(bin.charCodeAt(i) ^ OBF_KEY.charCodeAt(i % OBF_KEY.length));
      }
      return out;
    } catch (e) { return ""; }
  }

  /* =======================================================
     Course player (Udemy-style): big player on the left,
     collapsible Day -> lessons curriculum on the right.
     `course.lessons` is a FLAT list of every resource so a
     sidebar click maps straight to a lesson by index.
     ======================================================= */
  var course = { lessons: [], current: -1 };

  function mkLesson(r, dayTitle, dayDesc) {
    return {
      type: r.type || "video",
      label: r.label || "",
      vid: r.vid || "",
      url: r.url || "",
      poster: r.poster || "",
      quizId: r.quizId || "",
      questions: r.questions || null,
      dayTitle: dayTitle,
      dayDesc: dayDesc
    };
  }

  // Small round icon shown next to each lesson in the sidebar.
  function lessonIcon(type) {
    if (type === "pdf") {
      return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 2h8l4 4v16H6z" opacity=".9"/></svg>';
    }
    if (type === "quiz") {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 12.5l2 2 4-5"/></svg>';
    }
    if (type && type !== "video") {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  }

  /* ---- Render the content for an unlocked batch ---- */
  function renderContent(batch, user) {
    if (!els.content) return;
    els.contentBox.classList.add("is-course");

    // 1) Flatten every resource into course.lessons, grouped by day.
    course.lessons = [];
    var groups = [];   // { title, desc, items: [{lesson, idx}] }
    if (batch.days && batch.days.length) {
      batch.days.forEach(function (d, di) {
        var title = d.title || ("Day " + (di + 1));
        var g = { title: title, items: [] };
        (d.resources || []).forEach(function (r) {
          var idx = course.lessons.length;
          course.lessons.push(mkLesson(r, title, d.description || ""));
          g.items.push({ idx: idx });
        });
        groups.push(g);
      });
    } else if (batch.resources && batch.resources.length) {
      var g0 = { title: batch.name, items: [] };
      batch.resources.forEach(function (r) {
        var idx = course.lessons.length;
        course.lessons.push(mkLesson(r, batch.name, ""));
        g0.items.push({ idx: idx });
      });
      groups.push(g0);
    }

    var total = course.lessons.length;

    // 2) Build the two-column layout.
    var html = '<div class="portal-batch-name">' + escapeHtml(batch.name) + "</div>";

    if (batch.classUrl) {
      html +=
        '<a class="btn btn-primary portal-cta course-live" target="_blank" rel="noopener" href="' +
        escapeAttr(batch.classUrl) + '">▶ Join the live class</a>';
    }

    if (!total) {
      html += '<p class="day-desc">Your recordings will appear here soon.</p>';
      els.content.innerHTML = html;
      return;
    }

    html += '<div class="course-layout">';

    // --- Main column: player + info panel ---
    html += '<div class="course-main">' +
      '<div class="course-player video-embed" id="coursePlayer"></div>' +
      '<div class="course-info" id="courseInfo"></div>' +
    '</div>';

    // --- Sidebar: curriculum ---
    html += '<aside class="course-sidebar">' +
      '<div class="cur-head"><span class="cur-head-title">Course content</span>' +
      '<span class="cur-head-meta">' + total + (total === 1 ? " lesson" : " lessons") + '</span></div>' +
      '<div class="cur-scroll">';

    groups.forEach(function (g, gi) {
      var open = gi === 0;
      var n = g.items.length;
      html += '<section class="cur-day' + (open ? " open" : "") + '">' +
        '<button class="cur-day-head" type="button" aria-expanded="' + open + '">' +
          '<span class="cur-day-name">' + escapeHtml(g.title) + '</span>' +
          '<span class="cur-day-sub">' + n + (n === 1 ? " lesson" : " lessons") +
          '<span class="cur-chev" aria-hidden="true"></span></span>' +
        '</button>' +
        '<div class="cur-lessons">';
      g.items.forEach(function (it) {
        var L = course.lessons[it.idx];
        html += '<button class="cur-lesson" type="button" data-idx="' + it.idx + '">' +
          '<span class="cur-lesson-ico">' + lessonIcon(L.type) + '</span>' +
          '<span class="cur-lesson-text">' + escapeHtml(L.label || ("Lesson " + (it.idx + 1))) + '</span>' +
        '</button>';
      });
      html += '</div></section>';
    });

    html += '</div></aside></div>';

    els.content.innerHTML = html;

    // 3) Load the first lesson into the player (poster only — no autoplay).
    selectLesson(0, false);
  }

  /* ---- Load a lesson (by flat index) into the main player ---- */
  function selectLesson(idx, autoplay) {
    var L = course.lessons[idx];
    if (!L) return;

    // Plain links just open in a new tab; keep the current player as-is.
    if (L.type && L.type !== "video" && L.type !== "pdf" && L.type !== "quiz") {
      if (L.url) window.open(L.url, "_blank", "noopener");
      return;
    }

    course.current = idx;
    var player = document.getElementById("coursePlayer");
    var info = document.getElementById("courseInfo");
    if (!player) return;

    if (L.type === "pdf") {
      player.className = "course-player video-embed";
      player.removeAttribute("data-venc");
      player.removeAttribute("data-src");
      player.removeAttribute("role");
      player.removeAttribute("tabindex");
      // Prefer the encrypted token (like videos); fall back to a plain url.
      var pdfSrc = L.vid
        ? "https://drive.google.com/file/d/" + deob(L.vid) + "/preview"
        : drivePreview(L.url);
      player.innerHTML = '<iframe src="' + escapeAttr(pdfSrc) +
        '" allowfullscreen></iframe>';
    } else if (L.type === "quiz") {
      // Exam-style test: rendered in place of the player, graded on submit.
      player.className = "course-player quiz-mode";
      player.removeAttribute("data-venc");
      player.removeAttribute("data-src");
      player.removeAttribute("role");
      player.removeAttribute("tabindex");
      player.innerHTML = buildQuiz(L);
    } else {
      // Video: show branded poster + play button; build embed only on play.
      player.className = "course-player video-embed video-cover";
      if (L.vid) { player.setAttribute("data-venc", L.vid); player.removeAttribute("data-src"); }
      else { player.setAttribute("data-src", drivePreview(L.url)); player.removeAttribute("data-venc"); }
      player.setAttribute("role", "button");
      player.setAttribute("tabindex", "0");
      player.setAttribute("aria-label", "Play " + (L.label || "video"));
      var thumb = L.poster || driveThumb(L.url);
      player.innerHTML =
        (thumb ? '<img class="video-thumb" src="' + escapeAttr(thumb) + '" alt="" referrerpolicy="no-referrer" />' : "") +
        '<span class="video-play"></span>';
      if (autoplay) playVideo(player);
    }

    // Info panel below the player.
    if (info) {
      info.innerHTML =
        '<div class="course-day-tag">' + escapeHtml(L.dayTitle) + '</div>' +
        '<h1 class="course-lesson-title">' + escapeHtml(L.label || "Lesson") + '</h1>' +
        (L.dayDesc ? '<p class="course-desc">' + escapeHtml(L.dayDesc) + '</p>' : "") +
        (L.type === "pdf" && (L.vid || L.url)
          ? '<a class="btn btn-primary course-download" style="margin-top:14px" href="' +
            escapeAttr(L.vid
              ? "https://drive.google.com/uc?export=download&id=" + deob(L.vid)
              : L.url) +
            (L.vid ? '" target="_blank" rel="noopener"' : '" download') +
            '>&#8595; Download the PDF guide</a>'
          : "");
    }

    // Highlight the active lesson + make sure its day is expanded.
    var btns = els.content.querySelectorAll(".cur-lesson");
    var active = null;
    for (var i = 0; i < btns.length; i++) {
      var on = parseInt(btns[i].getAttribute("data-idx"), 10) === idx;
      btns[i].classList.toggle("active", on);
      if (on) active = btns[i];
    }
    if (active) {
      var day = active.closest(".cur-day");
      if (day && !day.classList.contains("open")) {
        day.classList.add("open");
        var head = day.querySelector(".cur-day-head");
        if (head) head.setAttribute("aria-expanded", "true");
      }
    }
  }

  /* =======================================================
     Quiz (exam-style test): all questions at once, graded on
     submit; best score per quiz is kept in localStorage.
     ======================================================= */
  var LS_QUIZ = "lwp_quiz_scores";

  function quizStats(quizId) {
    var all = get(LS_QUIZ) || {};
    return all[quizId] || null;
  }
  function saveQuizScore(quizId, score, total) {
    var all = get(LS_QUIZ) || {};
    var prev = all[quizId] || {};
    all[quizId] = { last: score, best: Math.max(score, prev.best || 0), total: total };
    set(LS_QUIZ, all);
  }

  function buildQuiz(L) {
    var qs = L.questions || [];
    var stats = quizStats(L.quizId);
    var html = '<div class="quiz-wrap">' +
      '<div class="quiz-head">' +
        '<span class="quiz-title">' + escapeHtml(L.label || "Test") + '</span>' +
        '<span class="quiz-meta">' + qs.length + " questions · no time limit" +
        (stats ? " · your best: " + stats.best + "/" + stats.total : "") + '</span>' +
      '</div>' +
      '<div id="quizResult" class="quiz-result" hidden></div>';
    qs.forEach(function (q, qi) {
      html += '<fieldset class="quiz-q" data-q="' + qi + '">' +
        '<legend>' + (qi + 1) + ". " + escapeHtml(q.q) + '</legend>';
      q.opts.forEach(function (opt, oi) {
        html += '<label class="quiz-opt"><input type="radio" name="q' + qi +
          '" value="' + oi + '"><span>' + escapeHtml(opt) + '</span></label>';
      });
      html += '<div class="quiz-fb" hidden></div></fieldset>';
    });
    html += '<div class="quiz-actions">' +
      '<button id="quizSubmit" class="btn btn-primary" type="button">Submit test</button>' +
      '</div></div>';
    return html;
  }

  function gradeQuiz() {
    var L = course.lessons[course.current];
    if (!L || L.type !== "quiz") return;
    var box = document.getElementById("coursePlayer");
    var result = document.getElementById("quizResult");
    if (!box || !result) return;
    var qs = L.questions || [];

    // Exam rule: every question must be answered before submitting.
    var missing = [];
    qs.forEach(function (q, qi) {
      if (!box.querySelector('input[name="q' + qi + '"]:checked')) missing.push(qi + 1);
    });
    if (missing.length) {
      result.hidden = false;
      result.className = "quiz-result warn";
      result.textContent = "Please answer every question before submitting. Missing: " +
        missing.join(", ");
      return;
    }

    var score = 0;
    qs.forEach(function (q, qi) {
      var picked = parseInt(box.querySelector('input[name="q' + qi + '"]:checked').value, 10);
      var fs = box.querySelector('.quiz-q[data-q="' + qi + '"]');
      var fb = fs.querySelector(".quiz-fb");
      var ok = picked === q.a;
      if (ok) score++;
      fs.classList.add(ok ? "is-right" : "is-wrong");
      fb.hidden = false;
      fb.textContent = ok ? "✓ Correct" : "✗ Correct answer: " + q.opts[q.a];
      var inputs = fs.querySelectorAll("input");
      for (var i = 0; i < inputs.length; i++) inputs[i].disabled = true;
    });

    var pct = Math.round((score / qs.length) * 100);
    saveQuizScore(L.quizId, score, qs.length);
    result.hidden = false;
    result.className = "quiz-result " + (pct >= 70 ? "pass" : "fail");
    result.innerHTML = "<strong>Your score: " + score + " / " + qs.length +
      " (" + pct + "%)</strong> — " +
      (pct >= 70
        ? "great job! You have these topics down."
        : "revise the Day 2-4 videos and study guides, then retake the test.");
    var btn = document.getElementById("quizSubmit");
    if (btn) { btn.id = "quizRetake"; btn.textContent = "Retake test"; }
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---- Expand / collapse a day in the sidebar ---- */
  function toggleDay(head) {
    var sec = head.closest(".cur-day");
    if (!sec) return;
    var open = sec.classList.toggle("open");
    head.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }

  /* ---- State machine: decide what to show ---- */
  function render() {
    var user = get(LS_USER);
    var batchId = get(LS_BATCH);
    var wrap = els.contentBox ? els.contentBox.closest(".portal-wrap") : null;

    if (!isConfigured()) {
      show(els.notice);
    }

    // Only the unlocked course view uses the wide two-column layout.
    function narrow() {
      if (wrap) wrap.classList.remove("portal-wrap-wide");
      if (els.contentBox) els.contentBox.classList.remove("is-course");
      document.body.classList.remove("course-mode");
    }

    if (!user) {
      narrow();
      // Not signed in
      show(els.signinBox);
      hide(els.gateBox);
      hide(els.contentBox);
      // Explain why, if another device just took over this account.
      if (get(LS_KICKED) && els.signinBox && !document.getElementById("kickedNote")) {
        var note = document.createElement("div");
        note.id = "kickedNote";
        note.className = "setup-notice";
        note.textContent = "⚠️ You were signed out because this account " +
          "was just logged in on another device. Only one device can be " +
          "logged in at a time — sign in again to use this one.";
        els.signinBox.insertBefore(note, els.signinBox.firstChild);
      }
      return;
    }

    // Signed in — show profile bits
    if (els.who) els.who.textContent = (user.name || user.email || "Signed in");
    if (els.whoEmail) els.whoEmail.textContent = (user.email || "your account");
    if (els.avatar && user.picture) {
      els.avatar.src = user.picture;
      els.avatar.hidden = false;
    }

    var access = get(LS_ACCESS);

    // Live video enabled for this account — listen for incoming calls.
    if (liveEnabled()) startLivePolling();

    // Server said blocked (same account on too many machines, or a
    // manual admin block) — this overrides everything else.
    if (access && access.status === "blocked") {
      narrow();
      hide(els.signinBox);
      hide(els.gateBox);
      show(els.contentBox);
      renderBlocked(access);
      return;
    }

    // Email match takes priority; then a code-unlocked batch; then the
    // server verdict (covers students added in the DB but not this file).
    var batch = findBatchByEmail(user.email) || (batchId ? findBatch(batchId) : null);
    if (!batch && access && access.status === "student" && access.batchId) {
      batch = findBatch(access.batchId);
    }
    if (batch) {
      // Unlocked
      hide(els.signinBox);
      hide(els.gateBox);
      show(els.contentBox);
      if (wrap) wrap.classList.add("portal-wrap-wide");
      document.body.classList.add("course-mode");
      renderContent(batch, user);
      addAdminButton();
      addLiveButton();
      addMediaWarmup();
    } else if (access && access.status === "student" && access.batchId) {
      // Enrolled in a batch whose content isn't published on the site
      // yet (batch created from the admin panel) — friendly holding page.
      narrow();
      hide(els.signinBox);
      hide(els.gateBox);
      show(els.contentBox);
      els.content.innerHTML =
        '<div class="portal-icon">🎓</div>' +
        '<h1>You are <span class="grad">enrolled</span></h1>' +
        '<p class="lead">Welcome! Your batch is set up and its recordings ' +
        "will appear right here as classes begin. Check back soon.</p>";
      addAdminButton();
      addLiveButton();
      addMediaWarmup();
    } else if (access && access.status === "trial") {
      // Not registered in any batch — FREE TRIAL of the first few days.
      hide(els.signinBox);
      hide(els.gateBox);
      show(els.contentBox);
      if (wrap) wrap.classList.add("portal-wrap-wide");
      document.body.classList.add("course-mode");
      renderTrial(user);
    } else {
      // Signed in but no batch unlocked yet
      narrow();
      hide(els.signinBox);
      show(els.gateBox);
      hide(els.contentBox);
    }
  }

  /* ---- FREE TRIAL: unregistered accounts see the first N days ---- */
  function trialBatch() {
    var src = CONFIG.batches[0];
    var days = [];
    for (var i = 0; i < src.days.length && days.length < CONFIG.trialDays; i++) {
      // Only real course days count toward the trial (tests are skipped).
      if (/^Day\s/i.test(src.days[i].title || "")) days.push(src.days[i]);
    }
    return { id: "trial", name: "Free Trial — Days 1 to " + days.length, days: days };
  }

  function renderTrial(user) {
    renderContent(trialBatch(), user);
    var banner = document.createElement("div");
    banner.className = "trial-banner";
    banner.innerHTML =
      '🎁 <strong>You are on a FREE TRIAL</strong> — the first ' +
      CONFIG.trialDays + " days of the course are unlocked for you. " +
      'To join the batch and unlock everything, <a target="_blank" rel="noopener" ' +
      'href="https://wa.me/919581341999?text=' +
      encodeURIComponent("Hi Palla, I finished trying the free trial on the portal (" +
        (user.email || "") + ") and I want to join the batch.") +
      '">message Palla on WhatsApp</a>.';
    els.content.insertBefore(banner, els.content.firstChild);
  }

  /* =======================================================
     ADMIN PANEL — visible ONLY to the admin role. Every call
     is re-checked on the server via the X-Admin-Token header,
     so hiding/showing here is cosmetic, not the security.
     ======================================================= */
  function isAdmin() {
    var a = get(LS_ACCESS) || {};
    return !!(a.admin && a.adminToken);
  }

  function addAdminButton() {
    if (!isAdmin() || document.getElementById("adminOpen")) return;
    var btn = document.createElement("button");
    btn.id = "adminOpen";
    btn.className = "btn btn-ghost admin-open-btn";
    btn.type = "button";
    btn.textContent = "⚙ Admin panel";
    btn.addEventListener("click", renderAdmin);
    els.content.insertBefore(btn, els.content.firstChild);
  }

  function adminApi(path, opts) {
    var a = get(LS_ACCESS) || {};
    opts = opts || {};
    opts.headers = opts.headers || {};
    opts.headers["X-Admin-Token"] = a.adminToken || "";
    if (opts.body) opts.headers["Content-Type"] = "application/json";
    return fetch(CONFIG.apiUrl + path, opts).then(function (r) { return r.json(); });
  }

  function fmtWhen(v) {
    if (!v) return "—";
    var d = new Date(v);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined,
      { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  var adminBatches = []; // filled by renderAdmin; used by the action handlers

  function batchOptions() {
    var h = "";
    adminBatches.forEach(function (b) {
      h += '<option value="' + escapeAttr(b.id) + '">' + escapeHtml(b.name) + "</option>";
    });
    return h;
  }
  function batchName(id) {
    for (var i = 0; i < adminBatches.length; i++) {
      if (adminBatches[i].id === id) return adminBatches[i].name;
    }
    return id;
  }

  function renderAdmin() {
    if (!isAdmin()) { render(); return; }
    els.contentBox.classList.remove("is-course");
    els.content.innerHTML =
      '<div class="portal-batch-name">⚙ Admin — Students &amp; Trial Users</div>' +
      '<p class="day-desc">Loading…</p>';
    adminApi("/api/admin/users").then(function (d) {
      if (!d || !d.students) {
        els.content.innerHTML +=
          '<p class="day-desc">Could not load (session expired?). Sign out and back in.</p>';
        return;
      }
      adminBatches = d.batches || [];
      var html =
        '<div class="admin-wrap">' +
        '<div class="portal-batch-name">⚙ Admin — Students &amp; Trial Users</div>' +
        '<button id="adminBack" class="btn btn-ghost admin-open-btn" type="button">← Back to course</button>';

      // Toolbar: add any email to a specific batch + create a new batch.
      html += '<div class="admin-toolbar">' +
        '<input id="adminNewEmail" type="email" autocomplete="off" placeholder="student@gmail.com" />' +
        '<select id="adminNewBatch">' + batchOptions() + "</select>" +
        '<button id="adminAddBtn" class="btn btn-primary admin-act" type="button">Add to batch</button>' +
        '<button id="adminNewBatchBtn" class="btn btn-ghost admin-act" type="button">＋ New batch</button>' +
        "</div>" +
        '<p class="day-desc">Adding an email that already exists moves that student to the chosen batch.</p>';

      html += '<h2 class="admin-h">Students (' + d.students.length + ")</h2>" +
        '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>' +
        "<th>Email</th><th>Batch</th><th>Role</th><th>Status</th>" +
        "<th>Live video</th>" +
        "<th>Machines (30d)</th><th>Last login</th><th></th>" +
        "</tr></thead><tbody>";
      d.students.forEach(function (s) {
        html += "<tr><td>" + escapeHtml(s.email) + "</td>" +
          "<td>" + escapeHtml(s.batch_id) + "</td>" +
          "<td>" + escapeHtml(s.role || "student") + "</td>" +
          "<td>" + escapeHtml(s.status) + "</td>" +
          '<td><button class="btn btn-ghost admin-act' + (s.live_enabled ? " live-on" : "") +
            '" data-act="live" data-on="' + (s.live_enabled ? 1 : 0) +
            '" data-email="' + escapeAttr(s.email) + '">' +
            (s.live_enabled ? "Live: ON" : "Live: off") + "</button>" +
          (s.live_enabled
            ? ' <button class="btn btn-ghost admin-act" data-act="call" data-kind="audio" data-email="' +
              escapeAttr(s.email) + '">📞 Audio</button>' +
              ' <button class="btn btn-ghost admin-act" data-act="call" data-kind="video" data-email="' +
              escapeAttr(s.email) + '">🎥 Video</button>'
            : "") + "</td>" +
          "<td>" + (s.machines || 0) + " / " + s.machine_limit + "</td>" +
          "<td>" + fmtWhen(s.last_login) + "</td>" +
          "<td>" + (s.role === "admin" ? "" :
            '<button class="btn btn-ghost admin-act" data-act="unblock" data-email="' +
            escapeAttr(s.email) + '">Unblock</button> ' +
            '<button class="btn btn-ghost admin-act admin-danger" data-act="remove" data-email="' +
            escapeAttr(s.email) + '">Remove</button>') +
          "</td></tr>";
      });
      html += "</tbody></table></div>";

      html += '<h2 class="admin-h">Trial users (' + d.trials.length + ")</h2>" +
        '<div class="admin-table-wrap"><table class="admin-table"><thead><tr>' +
        "<th>Email</th><th>First seen</th><th>Last seen</th><th>Sign-ins</th><th></th>" +
        "</tr></thead><tbody>";
      if (!d.trials.length) {
        html += '<tr><td colspan="5">No trial users yet.</td></tr>';
      }
      d.trials.forEach(function (t) {
        html += "<tr><td>" + escapeHtml(t.email) + "</td>" +
          "<td>" + fmtWhen(t.first_seen) + "</td>" +
          "<td>" + fmtWhen(t.last_seen) + "</td>" +
          "<td>" + t.visits + "</td>" +
          '<td><select class="admin-batch-sel">' + batchOptions() + "</select> " +
          '<button class="btn btn-ghost admin-act" data-act="upgrade" data-email="' +
          escapeAttr(t.email) + '">Upgrade</button></td></tr>';
      });
      html += "</tbody></table></div>" +
        '<p class="day-desc">Upgrade adds the email to the batch (full course in ~5 min, ' +
        "no re-login needed). Remove sends a student back to the free trial. " +
        "Unblock forgets all recorded machines. Remember Drive sharing is separate.</p></div>";

      els.content.innerHTML = html;

      document.getElementById("adminBack").addEventListener("click", function () { render(); });
      document.getElementById("adminAddBtn").addEventListener("click", addStudent);
      document.getElementById("adminNewBatchBtn").addEventListener("click", createBatch);
      var acts = els.content.querySelectorAll(".admin-act[data-act]");
      for (var i = 0; i < acts.length; i++) {
        acts[i].addEventListener("click", onAdminAction);
      }
    }).catch(function () {
      els.content.innerHTML =
        '<p class="day-desc">Could not reach the admin API. Try again in a minute.</p>';
    });
  }

  function adminPost(path, payload, btn) {
    if (btn) btn.disabled = true;
    adminApi(path, { method: "POST", body: JSON.stringify(payload) })
      .then(function (r) {
        if (r && r.ok) { renderAdmin(); }
        else { alert("Failed: " + ((r && r.error) || "unknown error")); if (btn) btn.disabled = false; }
      }).catch(function () {
        alert("Network error — try again.");
        if (btn) btn.disabled = false;
      });
  }

  function onAdminAction(e) {
    var btn = e.currentTarget;
    var act = btn.getAttribute("data-act");
    var email = btn.getAttribute("data-email");
    if (act === "live") {
      adminPost("/api/admin/live/enable",
        { email: email, enabled: btn.getAttribute("data-on") !== "1" }, btn);
      return;
    }
    if (act === "call") {
      startAdminCall(email, btn.getAttribute("data-kind") === "audio" ? "audio" : "video");
      return;
    }
    var payload = { email: email };
    if (act === "upgrade") {
      var sel = btn.parentNode.querySelector(".admin-batch-sel");
      payload.batchId = sel ? sel.value : (adminBatches[0] && adminBatches[0].id);
    }
    var msgs = {
      upgrade: "Add " + email + " to " + batchName(payload.batchId) +
        "?\n\nThey get that batch's course within ~5 minutes. Remember to " +
        "also share the Drive files with them.",
      remove: "Remove " + email + " from their batch?\n\nThey fall back to " +
        "the FREE TRIAL (first days only).",
      unblock: "Forget all recorded machines for " + email +
        "? Use this when an honest student got blocked."
    };
    if (!window.confirm(msgs[act])) return;
    adminPost("/api/admin/" + act, payload, btn);
  }

  /* ---- Toolbar: add ANY email to a chosen batch ---- */
  function addStudent() {
    var emailEl = document.getElementById("adminNewEmail");
    var batchEl = document.getElementById("adminNewBatch");
    var email = (emailEl && emailEl.value || "").trim();
    var batchId = batchEl ? batchEl.value : "";
    if (email.indexOf("@") < 0) { alert("Please type a valid email address."); return; }
    if (!window.confirm("Add " + email + " to " + batchName(batchId) +
        "?\n\nRemember to also share the Drive files with them.")) return;
    adminPost("/api/admin/upgrade", { email: email, batchId: batchId },
      document.getElementById("adminAddBtn"));
  }

  /* ---- Toolbar: create a new batch ---- */
  function createBatch() {
    var id = window.prompt(
      "New batch ID — short, lowercase letters/numbers/dashes.\nExample: aug26");
    if (!id) return;
    var name = window.prompt(
      "Batch display name.\nExample: August 2026 Batch");
    if (!name) return;
    adminPost("/api/admin/batch",
      { id: id.trim().toLowerCase(), name: name.trim() },
      document.getElementById("adminNewBatchBtn"));
  }

  /* =======================================================
     LIVE VIDEO — Palla rings a student from the admin panel;
     their portal (any view, as long as the tab is open) shows
     a full-screen incoming-call card. Accepting opens the
     meeting link (Google Meet / Zoom) in a new tab. Enabled
     per student via the admin panel's "Live" toggle; the
     server only answers polls from the account's one live
     session device.
     ======================================================= */
  var live = {
    timer: null, lastCall: null, dismissed: {},
    beepTimer: null, titleTimer: null, baseTitle: "", actx: null,
    adminTimer: null
  };

  // The call itself is a browser-to-browser WebRTC connection — when the
  // student taps Accept their camera/mic switch on automatically and the
  // video plays right here in the portal (no Meet/Zoom, no new tab). The
  // Worker only relays the offer/answer SDP; media never touches it.
  var rtc = { pc: null, local: null, callId: null, role: "", kind: "video", watchTimer: null };
  var RTC_CONFIG = {
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
      // Free public TURN relay — fallback when both sides sit behind
      // strict mobile NATs and no direct path can form.
      { urls: ["turn:openrelay.metered.ca:80", "turn:openrelay.metered.ca:443",
               "turn:openrelay.metered.ca:443?transport=tcp"],
        username: "openrelayproject", credential: "openrelayproject" }
    ]
  };

  function getMedia(kind) {
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: kind === "video" ? { facingMode: "user" } : false
    });
  }

  // Vanilla ICE: wait (max 3 s) until the SDP has its candidates embedded,
  // so one single offer/answer exchange is enough — no trickle endpoint.
  function waitIce(pc) {
    return new Promise(function (resolve) {
      if (pc.iceGatheringState === "complete") return resolve();
      var to = setTimeout(resolve, 3000);
      pc.addEventListener("icegatheringstatechange", function () {
        if (pc.iceGatheringState === "complete") { clearTimeout(to); resolve(); }
      });
    });
  }

  function newPeer() {
    var pc = new RTCPeerConnection(RTC_CONFIG);
    rtc.local.getTracks().forEach(function (t) { pc.addTrack(t, rtc.local); });
    pc.ontrack = function (ev) {
      var v = document.getElementById("callRemote");
      if (v && ev.streams && ev.streams[0] && v.srcObject !== ev.streams[0]) {
        v.srcObject = ev.streams[0];
      }
    };
    pc.onconnectionstatechange = function () {
      if (pc !== rtc.pc) return;
      var st = pc.connectionState;
      if (st === "connected") setCallStatus("");
      else if (st === "disconnected") setCallStatus("Reconnecting…");
      else if (st === "failed") {
        setCallStatus("Connection lost.");
        setTimeout(function () { if (pc === rtc.pc) endCall(true); }, 1500);
      }
    };
    return pc;
  }

  function setCallStatus(msg) {
    var el = document.getElementById("callStatus");
    if (el) { el.textContent = msg; el.hidden = !msg; }
  }

  function toggleTracks(tracks) {
    var on = false;
    tracks.forEach(function (t) { t.enabled = !t.enabled; on = t.enabled; });
    return on;
  }

  /* ---- The in-portal call screen (both sides use it) ---- */
  function buildCallUI(kind, withName) {
    var old = document.getElementById("lwpCall");
    if (old) old.remove();
    var audio = kind === "audio";
    var ov = document.createElement("div");
    ov.className = "call-overlay";
    ov.id = "lwpCall";
    ov.innerHTML =
      '<video id="callRemote" autoplay playsinline' + (audio ? ' class="call-hidden"' : "") + "></video>" +
      (audio
        ? '<div class="call-audio-face"><div><div class="ring-ico">📞</div>' +
          '<div class="ring-title">' + escapeHtml(withName) + "</div>" +
          '<div class="ring-sub">Audio call</div></div></div>'
        : "") +
      '<video id="callLocal" autoplay playsinline muted' + (audio ? ' class="call-hidden"' : "") + "></video>" +
      '<div class="call-status" id="callStatus">Connecting…</div>' +
      '<div class="call-controls">' +
        '<button id="callMute" class="call-btn" type="button" title="Mute / unmute microphone">🎙</button>' +
        (audio ? "" : '<button id="callCam" class="call-btn" type="button" title="Camera on / off">🎥</button>') +
        '<button id="callHang" class="call-btn call-hang" type="button" title="End call">📵</button>' +
      "</div>";
    document.body.appendChild(ov);
    var lv = document.getElementById("callLocal");
    if (lv) lv.srcObject = rtc.local;
    document.getElementById("callHang").addEventListener("click", function () { endCall(true); });
    document.getElementById("callMute").addEventListener("click", function () {
      var on = toggleTracks(rtc.local ? rtc.local.getAudioTracks() : []);
      this.classList.toggle("call-off", !on);
    });
    var cam = document.getElementById("callCam");
    if (cam) {
      cam.addEventListener("click", function () {
        var on = toggleTracks(rtc.local ? rtc.local.getVideoTracks() : []);
        this.classList.toggle("call-off", !on);
      });
    }
  }

  // Watch the call row so either side notices the other hanging up even
  // if the peer connection dies silently.
  function startCallWatch() {
    stopCallWatch();
    rtc.watchTimer = setInterval(function () {
      if (!rtc.pc) { stopCallWatch(); return; }
      if (rtc.role === "admin") {
        adminApi("/api/admin/live/status?id=" + encodeURIComponent(rtc.callId))
          .then(function (d) {
            var st = d && d.status;
            if (st !== "ringing" && st !== "answered") endCall(false);
          }).catch(function () {});
      } else {
        var user = get(LS_USER);
        if (!user) return;
        fetch(CONFIG.apiUrl + "/api/live/poll?email=" + encodeURIComponent(user.email) +
              "&device=" + encodeURIComponent(deviceId()))
          .then(function (r) { return r.json(); })
          .then(function (d) {
            var c = d && d.call;
            if (!c || c.id !== rtc.callId || c.status !== "answered") endCall(false);
          }).catch(function () {});
      }
    }, 3000);
  }
  function stopCallWatch() {
    if (rtc.watchTimer) { clearInterval(rtc.watchTimer); rtc.watchTimer = null; }
  }

  function endCall(tellServer) {
    stopCallWatch();
    if (tellServer && rtc.callId) {
      if (rtc.role === "admin") {
        adminApi("/api/admin/live/end", {
          method: "POST", body: JSON.stringify({ id: rtc.callId })
        }).catch(function () {});
      } else {
        liveRespond(rtc.callId, "end");
      }
    }
    if (rtc.pc) { try { rtc.pc.close(); } catch (e) {} }
    if (rtc.local) rtc.local.getTracks().forEach(function (t) { t.stop(); });
    rtc.pc = null; rtc.local = null; rtc.callId = null; rtc.role = "";
    var ov = document.getElementById("lwpCall");
    if (ov) ov.remove();
    hideAdminRinging();
  }

  function liveEnabled() {
    var a = get(LS_ACCESS) || {};
    return !!a.live;
  }

  /* ---- Student: poll for an incoming / ongoing call ---- */
  function startLivePolling() {
    if (live.timer || !CONFIG.apiUrl) return;
    live.timer = setInterval(livePoll, 10 * 1000);
    livePoll();
  }

  function livePoll() {
    if (rtc.pc) return; // in a call — startCallWatch handles the polling
    var user = get(LS_USER);
    if (!user || !liveEnabled() || document.visibilityState === "hidden") return;
    fetch(CONFIG.apiUrl + "/api/live/poll?email=" + encodeURIComponent(user.email) +
          "&device=" + encodeURIComponent(deviceId()))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var call = d && d.call;
        updateLivePanel(call);
        if (call && call.status === "ringing" && !live.dismissed[call.id]) {
          showRing(call);
        } else if (!call || call.status !== "ringing") {
          hideRing(); // admin cancelled or call went stale
        }
      })
      .catch(function () { /* offline — try again next tick */ });
  }

  function liveRespond(id, action, answerDesc) {
    var user = get(LS_USER);
    if (!user || !CONFIG.apiUrl) return Promise.resolve();
    return fetch(CONFIG.apiUrl + "/api/live/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email, device: deviceId(), id: id, action: action,
        answer: answerDesc ? { type: answerDesc.type, sdp: answerDesc.sdp } : undefined
      })
    }).catch(function () {});
  }

  /* ---- Student: full-screen incoming-call card ---- */
  function showRing(call) {
    if (document.getElementById("lwpRing")) return;
    var audio = call.kind === "audio";
    var ov = document.createElement("div");
    ov.className = "ring-overlay";
    ov.id = "lwpRing";
    ov.innerHTML =
      '<div class="ring-card">' +
        '<div class="ring-ico">' + (audio ? "📞" : "🎥") + "</div>" +
        '<div class="ring-title">Palla is calling you</div>' +
        '<div class="ring-sub">' + (audio
          ? "Audio call — accepting turns on your microphone and connects right here."
          : "Live video call — accepting turns on your camera and microphone and connects right here.") + "</div>" +
        '<div class="ring-actions">' +
          '<button class="btn btn-primary" id="ringAccept" type="button">✔ Accept</button>' +
          '<button class="btn btn-ghost ring-decline" id="ringDecline" type="button">✖ Decline</button>' +
        "</div></div>";
    document.body.appendChild(ov);
    document.getElementById("ringAccept").addEventListener("click", function () {
      live.dismissed[call.id] = true;
      acceptCall(call);
    });
    document.getElementById("ringDecline").addEventListener("click", function () {
      live.dismissed[call.id] = true;
      liveRespond(call.id, "decline");
      hideRing();
    });
    ringBeep();
    live.beepTimer = setInterval(ringBeep, 1400);
    live.baseTitle = document.title;
    live.titleTimer = setInterval(function () {
      document.title =
        document.title === "📞 Incoming call…" ? live.baseTitle : "📞 Incoming call…";
    }, 900);
  }

  /* ---- Student: accept → camera/mic on → connect in-page ---- */
  function acceptCall(call) {
    var kind = call.kind === "audio" ? "audio" : "video";
    hideRing();
    if (!call.offer || !window.RTCPeerConnection || !navigator.mediaDevices) {
      liveRespond(call.id, "decline");
      alert("Sorry, live calls are not supported in this browser. Please use Chrome, Edge or Safari.");
      return;
    }
    getMedia(kind).then(function (stream) {
      rtc.local = stream;
      rtc.callId = call.id;
      rtc.role = "student";
      rtc.kind = kind;
      buildCallUI(kind, "Palla");
      var pc = rtc.pc = newPeer();
      return pc.setRemoteDescription(call.offer)
        .then(function () { return pc.createAnswer(); })
        .then(function (ans) { return pc.setLocalDescription(ans); })
        .then(function () { return waitIce(pc); })
        .then(function () {
          return liveRespond(call.id, "answer", pc.localDescription);
        })
        .then(function () { startCallWatch(); });
    }).catch(function () {
      endCall(false);
      liveRespond(call.id, "decline");
      alert("Could not start your " + (kind === "video" ? "camera" : "microphone") +
        ".\n\nPlease ALLOW camera & microphone for learnwithpalla.com when the " +
        "browser asks (or enable it in the browser's site settings), then wait " +
        "for Palla to call again.");
    });
  }

  function hideRing() {
    var ov = document.getElementById("lwpRing");
    if (ov) ov.remove();
    if (live.beepTimer) { clearInterval(live.beepTimer); live.beepTimer = null; }
    if (live.titleTimer) {
      clearInterval(live.titleTimer);
      live.titleTimer = null;
      document.title = live.baseTitle || document.title;
    }
  }

  // Short ring tone. Browsers may refuse audio before the user has
  // interacted with the page — then the ring is visual only.
  function ringBeep() {
    try {
      if (!live.actx) live.actx = new (window.AudioContext || window.webkitAudioContext)();
      if (live.actx.state === "suspended") live.actx.resume().catch(function () {});
      var t = live.actx.currentTime;
      [880, 660].forEach(function (freq, i) {
        var o = live.actx.createOscillator(), g = live.actx.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        var at = t + i * 0.28;
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.15, at + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.24);
        o.connect(g); g.connect(live.actx.destination);
        o.start(at); o.stop(at + 0.26);
      });
    } catch (e) { /* no audio — visual ring only */ }
  }

  /* ---- One-time camera/mic warm-up for live-enabled students ----
     Asking once right after login means every later call connects with
     a single Accept tap and no permission popup. The stream is stopped
     immediately — this only records the browser permission. ---- */
  var LS_MEDIA_OK = "lwp_media_ok";

  function addMediaWarmup() {
    if (!liveEnabled() || get(LS_MEDIA_OK) || document.getElementById("mediaWarmup")) return;
    var box = document.createElement("div");
    box.id = "mediaWarmup";
    box.className = "trial-banner";
    box.innerHTML =
      '🎥 <strong>Live calls are enabled for your account.</strong> ' +
      "Allow your camera &amp; microphone once now, so Palla's calls connect " +
      "instantly when you accept. " +
      '<button id="mediaWarmupBtn" class="btn btn-primary media-ready-btn" type="button">Enable camera &amp; mic</button>';
    els.content.insertBefore(box, els.content.firstChild);
    document.getElementById("mediaWarmupBtn").addEventListener("click", function () {
      var btn = this;
      btn.disabled = true;
      getMedia("video").then(function (stream) {
        stream.getTracks().forEach(function (t) { t.stop(); }); // permission saved; camera off
        set(LS_MEDIA_OK, 1);
        box.innerHTML = "✅ <strong>You're ready for live calls.</strong> " +
          "When Palla calls, this page rings — just tap Accept.";
      }).catch(function () {
        btn.disabled = false;
        alert("Camera/microphone was not allowed.\n\nWhen the browser asks, tap " +
          "ALLOW — or enable Camera and Microphone for learnwithpalla.com in " +
          "your browser's site settings, then try again.");
      });
    });
  }

  /* ---- Student: the 🎥 Live video tab ---- */
  function addLiveButton() {
    if (!liveEnabled() || document.getElementById("liveOpen")) return;
    var btn = document.createElement("button");
    btn.id = "liveOpen";
    btn.type = "button";
    btn.className = "btn btn-ghost admin-open-btn";
    btn.textContent = "🎥 Live video";
    btn.addEventListener("click", renderLivePanel);
    els.content.insertBefore(btn, els.content.firstChild);
  }

  function renderLivePanel() {
    els.contentBox.classList.remove("is-course");
    els.content.innerHTML =
      '<div class="portal-batch-name">🎥 Live video sessions</div>' +
      '<button id="liveBack" class="btn btn-ghost admin-open-btn" type="button">← Back to course</button>' +
      '<div class="live-status" id="liveStatus">Checking…</div>' +
      '<p class="day-desc">When Palla starts an audio or video call for you, the portal ' +
      "rings with an Accept button — just keep this site open in a tab. Accepting turns " +
      "on your camera and microphone automatically and the call happens right here on " +
      "this page (the first time, your browser will ask you to ALLOW the camera — " +
      "tap Allow). Only Palla can start a call.</p>";
    document.getElementById("liveBack").addEventListener("click", function () { render(); });
    updateLivePanel(live.lastCall);
    livePoll();
  }

  function updateLivePanel(call) {
    live.lastCall = call || null;
    var box = document.getElementById("liveStatus");
    if (!box) return;
    if (rtc.pc) {
      box.textContent = "🟢 You are in a live call.";
    } else if (call && call.status === "ringing") {
      box.textContent = "📞 Incoming call…";
    } else {
      box.textContent = "No live session right now. It will ring here when one starts.";
    }
  }

  /* ---- Admin: ring a student (kind = 'audio' | 'video') ----
     Flow: camera/mic on → WebRTC offer built → call row created (the
     student's portal starts ringing) → poll for their answer SDP →
     connected, in-page. ---- */
  function startAdminCall(email, kind) {
    if (rtc.pc) { alert("You are already in a call — end it first."); return; }
    if (!window.RTCPeerConnection || !navigator.mediaDevices) {
      alert("Live calls need a modern browser (Chrome / Edge / Safari).");
      return;
    }
    getMedia(kind).then(function (stream) {
      rtc.local = stream;
      rtc.role = "admin";
      rtc.kind = kind;
      var pc = rtc.pc = newPeer();
      return pc.createOffer()
        .then(function (o) { return pc.setLocalDescription(o); })
        .then(function () { return waitIce(pc); })
        .then(function () {
          return adminApi("/api/admin/live/call", {
            method: "POST",
            body: JSON.stringify({
              email: email, kind: kind,
              offer: { type: pc.localDescription.type, sdp: pc.localDescription.sdp }
            })
          });
        })
        .then(function (r) {
          if (!(r && r.ok)) {
            endCall(false);
            alert("Failed: " + ((r && r.error) || "unknown error"));
            return;
          }
          rtc.callId = r.id;
          showAdminRinging(email, r.id, kind);
        });
    }).catch(function () {
      endCall(false);
      alert("Could not start your " + (kind === "video" ? "camera/microphone" : "microphone") +
        " — allow it for this site in the browser and try again.");
    });
  }

  function showAdminRinging(email, id, kind) {
    hideAdminRinging();
    var ov = document.createElement("div");
    ov.className = "ring-overlay";
    ov.id = "adminRing";
    ov.innerHTML =
      '<div class="ring-card">' +
        '<div class="ring-ico">' + (kind === "audio" ? "📞" : "🎥") + "</div>" +
        '<div class="ring-title">' + (kind === "audio" ? "Audio call to " : "Video call to ") +
          escapeHtml(email) + "</div>" +
        '<div class="ring-sub" id="adminRingStatus">Ringing on their portal… ' +
          "(they must have the portal open in a browser tab to see it)</div>" +
        '<div class="ring-actions">' +
          '<button class="btn btn-ghost ring-decline" id="adminRingEnd" type="button">Cancel call</button>' +
        "</div></div>";
    document.body.appendChild(ov);
    document.getElementById("adminRingEnd").addEventListener("click", function () {
      endCall(true); // also removes this dialog + releases camera/mic
    });
    // This poll doubles as the heartbeat that keeps the student ringing,
    // and it delivers their WebRTC answer once they accept.
    live.adminTimer = setInterval(function () {
      adminApi("/api/admin/live/status?id=" + encodeURIComponent(id)).then(function (d) {
        var st = d && d.status;
        var box = document.getElementById("adminRingStatus");
        if (st === "answered" && d.answer && rtc.pc &&
            rtc.pc.signalingState === "have-local-offer") {
          clearInterval(live.adminTimer); live.adminTimer = null;
          var pc = rtc.pc;
          pc.setRemoteDescription(d.answer).then(function () {
            var dlg = document.getElementById("adminRing");
            if (dlg) dlg.remove();
            buildCallUI(kind, email);
            startCallWatch();
          }).catch(function () {
            endCall(true);
            alert("Call setup failed — please try again.");
          });
        } else if (st === "declined") {
          if (box) box.textContent = "🔴 They declined the call.";
          clearInterval(live.adminTimer); live.adminTimer = null;
          setTimeout(function () { endCall(false); }, 2000);
        } else if (st === "ended" || st === "gone") {
          clearInterval(live.adminTimer); live.adminTimer = null;
          endCall(false);
        }
      }).catch(function () {});
    }, 2500);
  }

  function hideAdminRinging() {
    var ov = document.getElementById("adminRing");
    if (ov) ov.remove();
    if (live.adminTimer) { clearInterval(live.adminTimer); live.adminTimer = null; }
  }

  /* ---- BLOCKED: same account used on too many machines ---- */
  function renderBlocked(access) {
    els.contentBox.classList.remove("is-course");
    els.content.innerHTML =
      '<div class="portal-icon">⛔</div>' +
      '<h1>Account <span class="grad">blocked</span></h1>' +
      '<p class="lead">This account was logged in on more than ' +
      (access.limit || 5) + " machines, so access has been paused. " +
      "Please contact the admin to restore it.</p>" +
      '<a class="btn btn-wa portal-cta" target="_blank" rel="noopener" ' +
      'href="https://wa.me/919581341999?text=' +
      encodeURIComponent("Hi Palla, the portal says my account is blocked (logged in on too many machines). Please help me restore access.") +
      '">Contact admin on WhatsApp</a>';
  }

  /* ---- Called by Google after a successful sign-in ---- */
  function onCredential(response) {
    var profile = decodeJwt(response.credential);
    if (!profile || !profile.email) {
      alert("Sorry, sign-in failed. Please try again.");
      return;
    }
    var user = {
      email: profile.email,
      name: profile.name || "",
      picture: profile.picture || "",
      at: profile.iat || 0
    };
    set(LS_USER, user);
    del(LS_KICKED); // fresh sign-in — this device is the session now

    // Keep a local record of sign-ins (this browser only).
    var log = get(LS_LOG) || [];
    log.push({ email: user.email, name: user.name, ts: profile.iat || 0 });
    set(LS_LOG, log);

    notifyLogin(user);

    // Ask the server who this is (student / trial / blocked) — it also
    // records the sign-in (email + IP). Then refresh once so the nav
    // (avatar + Log out) and content update everywhere. This only runs
    // on a fresh sign-in, so no loop.
    checkAccess(response.credential, function () {
      window.location.reload();
    });
  }

  /* ---- Portal API (Cloudflare Worker + Neon database) ---- */
  // One random id per browser, created once and kept forever — this is
  // how the server counts "machines" for the 5-machine limit (IPs change
  // too often to be fair: mobile data, router restarts…).
  function deviceId() {
    var id = get(LS_DEVICE);
    if (id) return id;
    if (window.crypto && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = "d-" + Date.now().toString(36) + "-" +
        Math.random().toString(36).slice(2, 10) +
        Math.random().toString(36).slice(2, 10);
    }
    set(LS_DEVICE, id);
    return id;
  }

  // On sign-in: verify the Google token server-side, log email + IP,
  // and store the verdict. A slow or down API never blocks sign-in —
  // after 6s we carry on and the portal falls back to the local lists.
  function checkAccess(credential, done) {
    if (!CONFIG.apiUrl) { del(LS_ACCESS); done(); return; }
    var finished = false;
    function finish() { if (!finished) { finished = true; done(); } }
    setTimeout(finish, 6000);
    fetch(CONFIG.apiUrl + "/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: credential, deviceId: deviceId() })
    }).then(function (r) { return r.json(); }).then(function (a) {
      if (a && a.status) set(LS_ACCESS, a); else del(LS_ACCESS);
      finish();
    }).catch(function () { del(LS_ACCESS); finish(); });
  }

  // Silent recheck on every visit (and every few minutes) so a login on
  // another device signs this one out, a block applies everywhere, and
  // an unblock / new registration is picked up without re-signing in.
  function recheckAccess(user) {
    if (!CONFIG.apiUrl || !user || !user.email) return;
    fetch(CONFIG.apiUrl + "/api/status?email=" + encodeURIComponent(user.email) +
          "&device=" + encodeURIComponent(deviceId()))
      .then(function (r) { return r.json(); })
      .then(function (a) {
        if (!a || !a.status) return;
        if (a.status === "signed_out") {
          // Someone logged in to this account on ANOTHER device — only
          // one live session is allowed, so this one signs out.
          del(LS_USER);
          del(LS_BATCH);
          del(LS_ACCESS);
          set(LS_KICKED, 1);
          render();
          return;
        }
        var old = get(LS_ACCESS) || {};
        if (old.status !== a.status || old.batchId !== a.batchId ||
            !!old.live !== !!a.live) {
          // Keep the admin token — /api/status doesn't re-issue it.
          if (old.admin) { a.admin = old.admin; a.adminToken = old.adminToken; }
          set(LS_ACCESS, a);
          render();
        }
      })
      .catch(function () { /* offline — keep the last verdict */ });
  }

  /* ---- Notify the admin (email + Sheet) via Google Apps Script ---- */
  function notifyLogin(user) {
    if (!CONFIG.notifyUrl) return;
    var batch = findBatchByEmail(user.email);
    var payload = JSON.stringify({
      email: user.email,
      name: user.name || "",
      batch: batch ? batch.name : "(no batch)",
      page: location.href
    });
    try {
      // sendBeacon survives the page reload below; fetch is a fallback.
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
        navigator.sendBeacon(CONFIG.notifyUrl, blob);
      } else {
        fetch(CONFIG.notifyUrl, {
          method: "POST",
          mode: "no-cors",
          keepalive: true,
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: payload
        });
      }
    } catch (e) { /* ignore — notification is best-effort */ }
  }

  /* ---- Batch code unlock ---- */
  function tryUnlock() {
    var entered = (els.codeInput && els.codeInput.value || "").trim().toUpperCase();
    if (!entered) {
      setCodeMsg("Please enter your batch code.", "err");
      return;
    }
    var match = null;
    for (var i = 0; i < CONFIG.batches.length; i++) {
      if (String(CONFIG.batches[i].code).toUpperCase() === entered) {
        match = CONFIG.batches[i];
        break;
      }
    }
    if (!match) {
      setCodeMsg("That code didn't match any batch. Check with Palla on WhatsApp.", "err");
      return;
    }
    set(LS_BATCH, match.id);
    setCodeMsg("", "");
    render();
  }

  function setCodeMsg(msg, kind) {
    if (!els.codeMsg) return;
    els.codeMsg.textContent = msg;
    els.codeMsg.className = "form-status " + (msg ? "show " : "") + (kind || "");
  }

  /* ---- Sign out ---- */
  function signOut() {
    del(LS_USER);
    del(LS_BATCH);
    del(LS_ACCESS);
    del(LS_KICKED);
    if (window.google && google.accounts && google.accounts.id) {
      try { google.accounts.id.disableAutoSelect(); } catch (e) {}
    }
    render();
  }

  /* ---- Wire up buttons ---- */
  if (els.codeBtn) els.codeBtn.addEventListener("click", tryUnlock);
  if (els.codeInput) {
    els.codeInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); tryUnlock(); }
    });
  }
  if (els.signout) els.signout.addEventListener("click", signOut);
  if (els.signout2) els.signout2.addEventListener("click", signOut);

  /* ---- Click a video thumbnail to load + play it in place ---- */
  function playVideo(cover) {
    // Build the embed URL only now (on click). Prefer the encrypted token.
    var enc = cover.getAttribute("data-venc");
    var src = enc
      ? "https://drive.google.com/file/d/" + deob(enc) + "/preview"
      : cover.getAttribute("data-src");
    if (!src) return;
    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.setAttribute("allow", "autoplay; encrypted-media; fullscreen");
    iframe.setAttribute("allowfullscreen", "");
    cover.innerHTML = "";
    cover.appendChild(iframe);
    cover.classList.remove("video-cover");
  }
  if (els.content) {
    els.content.addEventListener("click", function (e) {
      if (!e.target.closest) return;
      // Sidebar: pick a lesson (loads + plays it in the main player).
      var lessonBtn = e.target.closest(".cur-lesson");
      if (lessonBtn) {
        e.preventDefault();
        // Show the lesson's thumbnail + play button; it plays on click.
        selectLesson(parseInt(lessonBtn.getAttribute("data-idx"), 10), false);
        // On narrow screens the player is above the list — bring it into view.
        if (window.innerWidth < 900) {
          var p = document.getElementById("coursePlayer");
          if (p) p.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }
      // Sidebar: expand / collapse a day.
      var dayHead = e.target.closest(".cur-day-head");
      if (dayHead) { e.preventDefault(); toggleDay(dayHead); return; }
      // Quiz: grade on submit, rebuild on retake.
      if (e.target.closest("#quizSubmit")) { e.preventDefault(); gradeQuiz(); return; }
      if (e.target.closest("#quizRetake")) {
        e.preventDefault();
        selectLesson(course.current, false);
        return;
      }
      // Big poster in the main player.
      var cover = e.target.closest(".video-cover");
      if (cover) { e.preventDefault(); playVideo(cover); }
    });
    els.content.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        var cover = e.target.closest && e.target.closest(".video-cover");
        // Buttons (lessons / day headers) fire their own click on Enter/Space.
        if (cover && !e.target.closest(".cur-lesson,.cur-day-head")) {
          e.preventDefault();
          playVideo(cover);
        }
      }
    });
  }

  /* ---- Initialize Google Identity Services when it loads ---- */
  window.onGoogleLibraryLoad = function () {
    if (!isConfigured()) return; // can't init without a real client id
    try {
      google.accounts.id.initialize({
        client_id: CONFIG.clientId,
        callback: onCredential,
        auto_select: false
      });
      if (els.gbtn) {
        google.accounts.id.renderButton(els.gbtn, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "signin_with",
          logo_alignment: "left"
        });
      }
    } catch (e) {
      console.error("Google sign-in init failed:", e);
    }
  };

  // First paint (restores a previous session from localStorage).
  render();
  // ...then quietly re-verify with the server (one-live-session +
  // block / unblock updates) — on load and every 5 minutes after.
  recheckAccess(get(LS_USER));
  setInterval(function () { recheckAccess(get(LS_USER)); }, 5 * 60 * 1000);
})();
