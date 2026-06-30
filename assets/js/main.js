/* =========================================================
   Learn with Palla — interactions
   Pure vanilla JS, no dependencies. Core CTAs (WhatsApp links)
   are real <a href> in the HTML, so the site works even if JS fails.
   ========================================================= */
(function () {
  "use strict";

  /* ---- Sticky header shadow ---- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Contact lead form (Formspree) ----
     Replace the form's action= with your Formspree endpoint:
     https://formspree.io/f/XXXXXXXX  (see README).
     Until then the form gracefully falls back to a WhatsApp handoff. */
  var form = document.getElementById("leadForm");
  if (form) {
    var statusEl = document.getElementById("formStatus");
    var btn = form.querySelector("[type=submit]");
    var WA_NUMBER = "919581341999";

    function setStatus(msg, kind) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = "form-status show " + (kind || "ok");
    }

    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      var configured = action.indexOf("formspree.io/f/") !== -1 &&
        action.indexOf("XXXXXXXX") === -1 && action.indexOf("your_form_id") === -1;

      // If Formspree isn't configured yet, hand the lead off to WhatsApp.
      if (!configured) {
        e.preventDefault();
        // Read via form.elements so field names can't collide with built-in
        // HTMLFormElement properties (e.g. `form.name` reflects the form's own
        // name attribute, not the <input name="name">).
        var field = function (n) {
          var el = form.elements.namedItem(n);
          return (el && el.value) || "";
        };
        var name = field("name");
        var email = field("email");
        var phone = field("phone");
        var course = field("course");
        var message = field("message");
        var text =
          "Hi Palla, I'd like to enroll in your course.%0A%0A" +
          "Name: " + encodeURIComponent(name) + "%0A" +
          "Email: " + encodeURIComponent(email) + "%0A" +
          "Phone: " + encodeURIComponent(phone) + "%0A" +
          "Course: " + encodeURIComponent(course) + "%0A" +
          "Message: " + encodeURIComponent(message);
        setStatus("Opening WhatsApp so you can send this directly to Palla…", "ok");
        window.open("https://wa.me/" + WA_NUMBER + "?text=" + text, "_blank", "noopener");
        return;
      }

      // Formspree AJAX submit
      e.preventDefault();
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…"; }
      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          setStatus("✓ Thanks! Your message is in. Palla will get back to you shortly.", "ok");
        } else {
          setStatus("Something went wrong. Please message on WhatsApp instead.", "err");
        }
      }).catch(function () {
        setStatus("Network issue. Please try WhatsApp instead.", "err");
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || "Send message"; }
      });
    });
  }

  /* ---- Curriculum track tabs (Playwright / Selenium) ---- */
  var trackTabs = document.querySelectorAll(".track-tab");
  if (trackTabs.length) {
    var selectTrack = function (name) {
      trackTabs.forEach(function (t) {
        t.setAttribute("aria-selected", t.getAttribute("data-track") === name ? "true" : "false");
      });
      document.querySelectorAll(".track-panel").forEach(function (p) {
        p.hidden = p.getAttribute("data-track") !== name;
      });
    };
    trackTabs.forEach(function (t) {
      t.addEventListener("click", function () {
        var name = t.getAttribute("data-track");
        selectTrack(name);
        if (window.history && history.replaceState) {
          history.replaceState(null, "", "#" + name);
        }
      });
    });
    var initial = (window.location.hash || "").replace("#", "");
    selectTrack(initial === "selenium" ? "selenium" : "playwright");
  }

  /* ---- Nav auth state: show avatar + Log out when signed in ----
     The portal saves the signed-in profile to localStorage("lwp_user").
     On every page, if a user is signed in we replace the nav
     "Sign in" button with their Google profile picture + Log out. */
  (function navAuth() {
    var user = null;
    try { user = JSON.parse(localStorage.getItem("lwp_user")); } catch (e) {}
    if (!user || !user.email) return; // not signed in — keep Sign in button

    function logOut() {
      try {
        localStorage.removeItem("lwp_user");
        localStorage.removeItem("lwp_batch");
      } catch (e) {}
      if (window.google && google.accounts && google.accounts.id) {
        try { google.accounts.id.disableAutoSelect(); } catch (e) {}
      }
      // Go to home after logging out from any page.
      window.location.href = "index.html";
    }

    /* --- Nav: replace the Sign in button --- */
    var navBtn = document.querySelector(".nav-links .btn-google");
    if (navBtn) {
      var wrap = document.createElement("div");
      wrap.className = "nav-user";

      var link = document.createElement("a");
      link.href = "portal.html";
      link.className = "nav-user-link";
      link.title = user.email;

      if (user.picture) {
        var img = document.createElement("img");
        img.className = "nav-ava";
        img.src = user.picture;
        img.alt = "";
        img.referrerPolicy = "no-referrer";
        link.appendChild(img);
      } else {
        var fb = document.createElement("span");
        fb.className = "nav-ava nav-ava-fallback";
        fb.textContent = (user.name || user.email || "?").charAt(0).toUpperCase();
        link.appendChild(fb);
      }
      var nm = document.createElement("span");
      nm.className = "nav-user-name";
      nm.textContent = user.name || user.email;
      link.appendChild(nm);

      var out = document.createElement("button");
      out.type = "button";
      out.className = "btn btn-sm btn-ghost nav-logout";
      out.textContent = "Log out";
      out.addEventListener("click", logOut);

      wrap.appendChild(link);
      wrap.appendChild(out);
      navBtn.replaceWith(wrap);
    }

    /* --- Mobile header icon: show the avatar when signed in --- */
    var mob = document.getElementById("mobileAuth");
    if (mob) {
      mob.innerHTML = "";
      mob.classList.add("is-user");
      mob.title = user.email;
      if (user.picture) {
        var mimg = document.createElement("img");
        mimg.src = user.picture;
        mimg.alt = "";
        mimg.referrerPolicy = "no-referrer";
        mob.appendChild(mimg);
      } else {
        var mfb = document.createElement("span");
        mfb.className = "nav-ava-fallback";
        mfb.textContent = (user.name || user.email || "?").charAt(0).toUpperCase();
        mob.appendChild(mfb);
      }
    }

    /* --- Homepage hero: swap "Already enrolled? Sign in" for a welcome --- */
    var heroLogin = document.querySelector(".hero-login");
    if (heroLogin) {
      heroLogin.innerHTML = "";
      var hi = document.createElement("span");
      hi.textContent = "Welcome back, " + (user.name || user.email) + "!";
      var go = document.createElement("a");
      go.className = "btn btn-sm btn-primary";
      go.href = "portal.html";
      go.textContent = "Open your portal →";
      heroLogin.appendChild(hi);
      heroLogin.appendChild(go);
    }
  })();
})();
