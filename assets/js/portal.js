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
              { type: "video", label: "Part 2 — Installing & configuring VS Code", poster: "assets/img/thumb-day1-part2.svg", vid: "XSREUiRZCDYZDBdbAVxGATxdRSI4Mx8UC0JmWFQFCB0F" }
            ]
          },
          {
            title: "Day 2 — JavaScript Comments & Variables",
            description: "Your first steps writing JavaScript. In Part 1 you'll learn how to write comments — single-line and multi-line — to document and organise your code. In Part 2 you'll learn variables: how to declare them with let and const, name them well, and store the data your tests will work with. Watch both parts in order.",
            resources: [
              { type: "video", label: "Part 1 — JavaScript Comments", poster: "assets/img/thumb-day2-part1.svg", vid: "XUcWY1gbUCYVPFFjA0JpKBkTdSVWMRxvP0VcVXVXCS44" },
              { type: "video", label: "Part 2 — JavaScript Variables", poster: "assets/img/thumb-day2-part2.svg", vid: "XQUzVgsLUlA9NVJLdHRDCAIDRwULBhM/B0lnAVNRLjU8" }
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
      dayTitle: dayTitle,
      dayDesc: dayDesc
    };
  }

  // Small round icon shown next to each lesson in the sidebar.
  function lessonIcon(type) {
    if (type === "pdf") {
      return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 2h8l4 4v16H6z" opacity=".9"/></svg>';
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
    if (L.type && L.type !== "video" && L.type !== "pdf") {
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
      player.innerHTML = '<iframe src="' + escapeAttr(drivePreview(L.url)) +
        '" allowfullscreen></iframe>';
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
        (L.dayDesc ? '<p class="course-desc">' + escapeHtml(L.dayDesc) + '</p>' : "");
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
    }

    if (!user) {
      narrow();
      // Not signed in
      show(els.signinBox);
      hide(els.gateBox);
      hide(els.contentBox);
      return;
    }

    // Signed in — show profile bits
    if (els.who) els.who.textContent = (user.name || user.email || "Signed in");
    if (els.whoEmail) els.whoEmail.textContent = (user.email || "your account");
    if (els.avatar && user.picture) {
      els.avatar.src = user.picture;
      els.avatar.hidden = false;
    }

    // Email match takes priority; fall back to a code-unlocked batch.
    var batch = findBatchByEmail(user.email) || (batchId ? findBatch(batchId) : null);
    if (batch) {
      // Unlocked
      hide(els.signinBox);
      hide(els.gateBox);
      show(els.contentBox);
      if (wrap) wrap.classList.add("portal-wrap-wide");
      renderContent(batch, user);
    } else {
      // Signed in but no batch unlocked yet
      narrow();
      hide(els.signinBox);
      show(els.gateBox);
      hide(els.contentBox);
    }
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

    // Keep a local record of sign-ins (this browser only).
    var log = get(LS_LOG) || [];
    log.push({ email: user.email, name: user.name, ts: profile.iat || 0 });
    set(LS_LOG, log);

    notifyLogin(user);

    // Refresh once so the nav (avatar + Log out) and content update
    // everywhere. This only runs on a fresh sign-in, so no loop.
    window.location.reload();
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
        selectLesson(parseInt(lessonBtn.getAttribute("data-idx"), 10), true);
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
})();
