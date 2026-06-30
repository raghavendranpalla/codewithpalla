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
          // Add the batch students' Gmail addresses here, e.g.
          // "student1@gmail.com",
          // "student2@gmail.com",
        ],
        classUrl: "",  // optional live class link
        drive: "",     // optional whole Drive folder
        resources: [
          // type "video" → plays in-page on click; "pdf" → embedded viewer
          // + download; anything else → a plain link. Paste any normal
          // Google Drive share link; it's auto-converted to an embed and
          // the direct /view link is never shown on the page.
          { type: "video", label: "Day 1 — NodeJS & VS Installation (Part 1)", url: "https://drive.google.com/file/d/1f7TmoEMP4TpCr5e5xNU_gQL7E1cKqv0J/view?usp=sharing" }
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

  // Match a signed-in email to a batch by its `emails` allow-list.
  function findBatchByEmail(email) {
    if (!email) return null;
    var e = String(email).trim().toLowerCase();
    for (var i = 0; i < CONFIG.batches.length; i++) {
      var list = CONFIG.batches[i].emails || [];
      for (var j = 0; j < list.length; j++) {
        if (String(list[j]).trim().toLowerCase() === e) return CONFIG.batches[i];
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

  /* ---- Render the content for an unlocked batch ---- */
  function renderContent(batch, user) {
    if (!els.content) return;
    var html = "";
    html += '<div class="portal-batch-name">' + escapeHtml(batch.name) + "</div>";

    if (batch.classUrl) {
      html +=
        '<a class="btn btn-primary btn-lg portal-cta" target="_blank" rel="noopener" href="' +
        escapeAttr(batch.classUrl) + '">▶ Join the live class</a>';
    }

    if (batch.resources && batch.resources.length) {
      batch.resources.forEach(function (r) {
        var type = r.type || "link";
        if (type === "video") {
          html += '<div class="media-block">';
          if (r.label) html += '<h3 class="portal-sub">' + escapeHtml(r.label) + "</h3>";
          html += '<div class="video-embed video-cover" data-src="' + escapeAttr(drivePreview(r.url)) +
            '" role="button" tabindex="0" aria-label="Play ' + escapeAttr(r.label || "video") + '">';
          var thumb = driveThumb(r.url);
          if (thumb) html += '<img class="video-thumb" src="' + escapeAttr(thumb) + '" alt="" loading="lazy" referrerpolicy="no-referrer" />';
          html += '<span class="video-play"></span>';
          html += "</div></div>";
        } else if (type === "pdf") {
          html += '<div class="media-block">';
          if (r.label) html += '<h3 class="portal-sub">' + escapeHtml(r.label) + "</h3>";
          html += '<div class="pdf-embed"><iframe src="' + escapeAttr(drivePreview(r.url)) + '"></iframe></div>';
          html += '<a class="btn btn-ghost btn-sm portal-cta" target="_blank" rel="noopener" href="' +
            escapeAttr(r.url) + '">⬇ Open / download PDF</a>';
          html += "</div>";
        } else {
          html += '<a class="portal-link-item" target="_blank" rel="noopener" href="' +
            escapeAttr(r.url) + '">▸ ' + escapeHtml(r.label) + "</a>";
        }
      });
    }

    if (batch.drive) {
      html +=
        '<a class="btn btn-ghost btn-lg portal-cta" target="_blank" rel="noopener" href="' +
        escapeAttr(batch.drive) + '">📁 Open all recordings &amp; resources (Drive)</a>';
    }

    els.content.innerHTML = html;
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

    if (!isConfigured()) {
      show(els.notice);
    }

    if (!user) {
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
      renderContent(batch, user);
    } else {
      // Signed in but no batch unlocked yet
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
    var src = cover.getAttribute("data-src");
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
      var cover = e.target.closest && e.target.closest(".video-cover");
      if (cover) { e.preventDefault(); playVideo(cover); }
    });
    els.content.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        var cover = e.target.closest && e.target.closest(".video-cover");
        if (cover) { e.preventDefault(); playVideo(cover); }
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
