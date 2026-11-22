/* ========================================================
   NEXFINITY — interactions & 3D scene
   ======================================================== */

(function () {
  "use strict";

  var doc = document;
  var body = doc.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var clamp01 = function (v) { return Math.max(0, Math.min(1, v)); };

  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------- Preloader ---------------- */

  body.classList.add("is-loading");

  var loader = $("#loader");
  var loaderCount = $("#loaderCount");
  var loaderFill = $("#loaderFill");
  var loaderDone = false;
  var progress = 0;
  var startTime = performance.now();
  var loadDuration = reduceMotion ? 500 : 1600;

  function paintLoader() {
    if (loaderCount) loaderCount.textContent = String(Math.floor(progress)).padStart(2, "0");
    if (loaderFill) loaderFill.style.width = progress + "%";
  }

  function finishLoader() {
    if (loaderDone) return;
    loaderDone = true;
    if (loader) {
      loader.classList.add("is-done");
      window.setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 1100);
    }
    body.classList.remove("is-loading");
    body.classList.add("is-loaded");
    window.setTimeout(initCounters, 500);
  }

  function stepLoader(now) {
    var p = Math.min(1, (now - startTime) / loadDuration);
    progress = (1 - Math.pow(1 - p, 3)) * 100;
    paintLoader();
    if (p < 1) {
      requestAnimationFrame(stepLoader);
    } else {
      progress = 100;
      paintLoader();
      window.setTimeout(finishLoader, 180);
    }
  }

  requestAnimationFrame(stepLoader);
  window.setTimeout(function () { if (!loaderDone) finishLoader(); }, 6000);

  /* ---------------- Navigation ---------------- */

  var nav = $("#nav");
  var burger = $("#burger");
  var menu = $("#menu");
  var progressBar = $("#progressBar");
  var hero = $(".hero");
  var heroCanvas = $("#scene");
  var heroHeight = hero ? hero.offsetHeight : 0;

  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    if (burger) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (menu) menu.setAttribute("aria-hidden", String(!open));
  }

  if (burger) {
    burger.addEventListener("click", function () {
      setMenu(!body.classList.contains("menu-open"));
    });
  }

  $$(".menu__links a, .menu__foot a").forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1080) setMenu(false);
    if (hero) heroHeight = hero.offsetHeight;
  });

  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle("is-scrolled", y > 30);

    if (progressBar) {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = "scaleX(" + (max > 0 ? clamp01(y / max) : 0) + ")";
    }

    if (heroCanvas) {
      var base = window.innerWidth < 860 ? 0.55 : 0.95;
      var fade = clamp01(1 - y / (heroHeight * 0.85));
      heroCanvas.style.opacity = (base * fade).toFixed(3);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------------- Scroll drawing cursors ---------------- */

  var desktopMotion = window.matchMedia(
    "(min-width: 861px) and (hover: hover) and (pointer: fine)"
  ).matches;

  if (desktopMotion && !reduceMotion) {
    var drawingCanvas = doc.createElement("canvas");
    var drawingContext = drawingCanvas.getContext("2d");
    var drawingAgents = [];
    var drawingScale = Math.min(window.devicePixelRatio || 1, 1.5);
    var lastDrawingBurst = 0;
    var drawingFrame = 0;
    var drawingTargets = $$(".hero__title .line, .eyebrow, .sec-title, .service, .project, .step, .mono-card, .contact__detail, .form");
    var drawingColors = [
      "rgba(217, 184, 120, 0.9)",
      "rgba(244, 227, 193, 0.82)",
      "rgba(173, 190, 225, 0.72)"
    ];

    drawingCanvas.className = "drawing-cursors";
    drawingCanvas.setAttribute("aria-hidden", "true");
    body.appendChild(drawingCanvas);

    function resizeDrawingCanvas() {
      drawingScale = Math.min(window.devicePixelRatio || 1, 1.5);
      drawingCanvas.width = Math.round(window.innerWidth * drawingScale);
      drawingCanvas.height = Math.round(window.innerHeight * drawingScale);
      drawingContext.setTransform(drawingScale, 0, 0, drawingScale, 0, 0);
    }

    function measureDrawingPath(points) {
      var length = 0;
      var segments = [];
      for (var i = 1; i < points.length; i++) {
        var dx = points[i].x - points[i - 1].x;
        var dy = points[i].y - points[i - 1].y;
        var segmentLength = Math.sqrt(dx * dx + dy * dy);
        segments.push(segmentLength);
        length += segmentLength;
      }
      return { length: length, segments: segments };
    }

    function makeDrawingAgent(target, now) {
      var rect = target.getBoundingClientRect();
      var inset = 3 + Math.random() * 5;
      var isUnderline = target.matches(".eyebrow, .sec-title, .hero__title .line");
      var points;

      if (isUnderline) {
        var y = Math.min(window.innerHeight - 8, rect.bottom + 3 + Math.random() * 4);
        points = [
          { x: rect.left + inset, y: y },
          { x: rect.left + rect.width * (0.32 + Math.random() * 0.18), y: y },
          { x: rect.left + rect.width * (0.68 + Math.random() * 0.12), y: y },
          { x: rect.right - inset, y: y }
        ];
      } else {
        var left = rect.left + inset;
        var top = rect.top + inset;
        var right = Math.max(left + 8, rect.right - inset);
        var bottom = Math.max(top + 8, rect.bottom - inset);
        var startCorner = Math.floor(Math.random() * 4);
        var corners = [
          { x: left, y: top },
          { x: right, y: top },
          { x: right, y: bottom },
          { x: left, y: bottom }
        ];
        points = [];
        for (var i = 0; i <= 4; i++) points.push(corners[(startCorner + i) % 4]);
      }

      var measured = measureDrawingPath(points);
      return {
        points: points,
        segments: measured.segments,
        length: measured.length,
        start: now + Math.random() * 120,
        duration: 580 + Math.random() * 280,
        color: drawingColors[Math.floor(Math.random() * drawingColors.length)]
      };
    }

    function drawAgent(agent, now) {
      var elapsed = now - agent.start;
      if (elapsed < 0) return true;

      var rawProgress = Math.min(1, elapsed / agent.duration);
      var progress = 1 - Math.pow(1 - rawProgress, 2);
      var remaining = agent.length * progress;
      var end = agent.points[0];
      var angle = 0;

      drawingContext.beginPath();
      drawingContext.moveTo(agent.points[0].x, agent.points[0].y);
      for (var i = 0; i < agent.segments.length; i++) {
        var from = agent.points[i];
        var to = agent.points[i + 1];
        var segmentLength = agent.segments[i];
        if (remaining <= 0) break;

        var portion = Math.min(1, remaining / segmentLength);
        end = {
          x: from.x + (to.x - from.x) * portion,
          y: from.y + (to.y - from.y) * portion
        };
        angle = Math.atan2(to.y - from.y, to.x - from.x);
        drawingContext.lineTo(end.x, end.y);
        remaining -= segmentLength;
        if (portion < 1) break;
      }

      var fade = rawProgress > 0.82 ? (1 - rawProgress) / 0.18 : 1;
      drawingContext.globalAlpha = Math.max(0, fade);
      drawingContext.strokeStyle = agent.color;
      drawingContext.lineWidth = 1;
      drawingContext.lineCap = "round";
      drawingContext.lineJoin = "round";
      drawingContext.shadowColor = agent.color;
      drawingContext.shadowBlur = 9;
      drawingContext.stroke();

      drawingContext.save();
      drawingContext.translate(end.x, end.y);
      drawingContext.rotate(angle);
      drawingContext.fillStyle = agent.color;
      drawingContext.shadowBlur = 10;
      drawingContext.beginPath();
      drawingContext.moveTo(0, 0);
      drawingContext.lineTo(0, 12);
      drawingContext.lineTo(3.2, 8.8);
      drawingContext.lineTo(6, 14);
      drawingContext.lineTo(8, 13);
      drawingContext.lineTo(5.2, 7.8);
      drawingContext.lineTo(10, 7.8);
      drawingContext.closePath();
      drawingContext.fill();
      drawingContext.restore();
      drawingContext.globalAlpha = 1;
      drawingContext.shadowBlur = 0;

      return rawProgress < 1;
    }

    function animateDrawingCursors() {
      drawingContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drawingAgents = drawingAgents.filter(function (agent) {
        return drawAgent(agent, performance.now());
      });

      if (drawingAgents.length) {
        drawingFrame = window.requestAnimationFrame(animateDrawingCursors);
      } else {
        drawingFrame = 0;
      }
    }

    function startDrawingBurst() {
      var now = performance.now();
      if (now - lastDrawingBurst < 175) return;
      lastDrawingBurst = now;

      var visibleTargets = drawingTargets.filter(function (target) {
        var rect = target.getBoundingClientRect();
        return rect.width > 24 && rect.height > 8 &&
          rect.bottom > 12 && rect.top < window.innerHeight - 12 &&
          rect.right > 0 && rect.left < window.innerWidth;
      });

      for (var i = visibleTargets.length - 1; i > 0; i--) {
        var swapIndex = Math.floor(Math.random() * (i + 1));
        var swap = visibleTargets[i];
        visibleTargets[i] = visibleTargets[swapIndex];
        visibleTargets[swapIndex] = swap;
      }

      visibleTargets.slice(0, 4).forEach(function (target) {
        drawingAgents.push(makeDrawingAgent(target, now));
      });
      if (drawingAgents.length > 12) drawingAgents.splice(0, drawingAgents.length - 12);
      if (drawingAgents.length && !drawingFrame) {
        drawingFrame = window.requestAnimationFrame(animateDrawingCursors);
      }
    }

    resizeDrawingCanvas();
    window.addEventListener("resize", resizeDrawingCanvas, { passive: true });
    window.addEventListener("scroll", startDrawingBurst, { passive: true });
  }

  /* ---------------- Scroll reveal ---------------- */

  var revealEls = $$("[data-reveal]");

  $$(".services__grid, .work__grid, .process__steps, .studio__points, .footer__top").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (child.hasAttribute && child.hasAttribute("data-reveal")) {
        child.style.setProperty("--reveal-delay", Math.min(i * 70, 280) + "ms");
      }
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------- Counters ---------------- */

  function initCounters() {
    var counters = $$("[data-count]");
    if (!counters.length) return;

    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (reduceMotion) {
        el.textContent = String(target);
        return;
      }
      var duration = 1900;
      var begin = performance.now();

      function frame(now) {
        var p = Math.min(1, (now - begin) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = String(target);
      }
      requestAnimationFrame(frame);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
      return;
    }

    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------------- Custom cursor ---------------- */

  if (finePointer && !reduceMotion) {
    var cursor = $(".cursor");
    var dot = $(".cursor__dot");
    var ring = $(".cursor__ring");

    if (cursor && dot && ring) {
      body.classList.add("has-cursor");
      var mx = window.innerWidth / 2;
      var my = window.innerHeight / 2;
      var rx = mx;
      var ry = my;

      window.addEventListener(
        "pointermove",
        function (e) {
          mx = e.clientX;
          my = e.clientY;
        },
        { passive: true }
      );

      (function cursorLoop() {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
        ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
        requestAnimationFrame(cursorLoop);
      })();

      var hoverables = "a, button, .service, .project, .mono-card, input, textarea, select";
      doc.addEventListener("pointerover", function (e) {
        if (e.target.closest && e.target.closest(hoverables)) cursor.classList.add("is-hover");
      });
      doc.addEventListener("pointerout", function (e) {
        if (e.target.closest && e.target.closest(hoverables)) cursor.classList.remove("is-hover");
      });
    }
  }

  /* ---------------- Spotlight + tilt + magnetic ---------------- */

  $$(".service").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - rect.left + "px");
      card.style.setProperty("--my", e.clientY - rect.top + "px");
    });
  });

  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach(function (card) {
      var target = card.classList.contains("mono-card") ? $(".mono-card__inner", card) : card;
      if (!target) return;
      var max = parseFloat(card.getAttribute("data-tilt-max")) || 6;
      var frame = null;

      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rotX = (0.5 - py) * max * 2;
        var rotY = (px - 0.5) * max * 2;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          target.style.transform = "rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg)";
        });
      });

      card.addEventListener("pointerleave", function () {
        if (frame) cancelAnimationFrame(frame);
        target.style.transform = "";
      });
    });

    $$("[data-magnetic]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width / 2) * 0.18;
        var y = (e.clientY - rect.top - rect.height / 2) * 0.22;
        el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ---------------- Testimonials ---------------- */

  var slider = $("[data-quotes]");
  if (slider) {
    var track = $("#quoteTrack");
    var slides = $$(".quote", track);
    var dots = $$(".quotes__dots button");
    var current = 0;
    var sliderTimer = null;

    function restartSlider() {
      if (sliderTimer) clearInterval(sliderTimer);
      if (reduceMotion) return;
      sliderTimer = setInterval(function () { goTo(current + 1); }, 7000);
    }

    function goTo(i, user) {
      if (!slides.length) return;
      current = ((i % slides.length) + slides.length) % slides.length;
      track.style.transform = "translateX(" + -current * 100 + "%)";
      dots.forEach(function (d, j) {
        d.setAttribute("aria-selected", String(j === current));
      });
      if (user) restartSlider();
    }

    var prevBtn = $("[data-quote-prev]");
    var nextBtn = $("[data-quote-next]");
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1, true); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1, true); });

    dots.forEach(function (d, i) {
      d.addEventListener("click", function () { goTo(i, true); });
    });

    slider.addEventListener("pointerenter", function () {
      if (sliderTimer) clearInterval(sliderTimer);
    });
    slider.addEventListener("pointerleave", restartSlider);

    var swipeStart = null;
    slider.addEventListener("pointerdown", function (e) { swipeStart = e.clientX; });
    slider.addEventListener("pointerup", function (e) {
      if (swipeStart === null) return;
      var dx = e.clientX - swipeStart;
      if (Math.abs(dx) > 55) goTo(current + (dx < 0 ? 1 : -1), true);
      swipeStart = null;
    });

    restartSlider();
  }

  /* ---------------- Contact form ---------------- */

  var form = $("#contactForm");
  if (form) {
    var successPanel = $("#formSuccess");
    var toastEl = $("#toast");
    var toastTimer = null;

    var showToast = function (msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add("is-show");
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () {
        toastEl.classList.remove("is-show");
      }, 5600);
    };

    var setError = function (name, msg) {
      var input = form.elements[name];
      if (!input) return;
      var field = input.closest(".field");
      if (!field) return;
      var errorEl = $(".field__error", field);
      if (msg) {
        field.classList.add("is-invalid");
        input.setAttribute("aria-invalid", "true");
        if (errorEl) errorEl.textContent = msg;
      } else {
        field.classList.remove("is-invalid");
        input.removeAttribute("aria-invalid");
        if (errorEl) errorEl.textContent = "";
      }
    };

    ["name", "email", "message"].forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener("input", function () { setError(name, ""); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var company = form.elements.company.value.trim();
      var budget = form.elements.budget.value;
      var message = form.elements.message.value.trim();
      var valid = true;

      if (name.length < 2) {
        setError("name", "Please enter your name.");
        valid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        setError("email", "Please enter a valid email address.");
        valid = false;
      }
      if (message.length < 10) {
        setError("message", "Tell us a little more (10+ characters).");
        valid = false;
      }

      if (!valid) {
        var firstInvalid = $(".is-invalid input, .is-invalid textarea", form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var subject = "New project brief — " + name + (company ? " / " + company : "");
      var lines = [
        "Name: " + name,
        "Email: " + email,
        company ? "Company: " + company : "",
        budget ? "Budget: " + budget : "",
        "",
        message
      ].filter(Boolean);

      var mailto = "mailto:hello@nexfinity.co?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));

      window.location.href = mailto;
      form.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
        successPanel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
      showToast("Opening your email app with the brief…");
    });
  }

  /* ---------------- Hero 3D scene ---------------- */

  function initScene() {
    var canvas = $("#scene");
    if (!canvas || typeof THREE === "undefined") return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
    } catch (err) {
      canvas.style.display = "none";
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 9.2);

    var root = new THREE.Group();
    scene.add(root);

    function makeDotTexture() {
      var c = doc.createElement("canvas");
      c.width = 64;
      c.height = 64;
      var ctx = c.getContext("2d");
      var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.32, "rgba(255,244,220,0.65)");
      g.addColorStop(1, "rgba(255,220,160,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      var tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    var dotTexture = makeDotTexture();
    var mobile = window.innerWidth < 860;
    var count = mobile ? 1500 : 3600;

    var positions = new Float32Array(count * 3);
    var colors = new Float32Array(count * 3);
    var radius = 2.32;
    var gold = new THREE.Color(0xd9b878);
    var ivory = new THREE.Color(0xfff3d8);
    var cool = new THREE.Color(0xb8c4de);
    var color = new THREE.Color();

    for (var i = 0; i < count; i++) {
      var y = 1 - (i / Math.max(1, count - 1)) * 2;
      var ringR = Math.sqrt(Math.max(0, 1 - y * y));
      var theta = i * Math.PI * (3 - Math.sqrt(5));
      var jitter = 0.9 + Math.random() * 0.2;
      var rad = radius * jitter;

      positions[i * 3] = Math.cos(theta) * ringR * rad;
      positions[i * 3 + 1] = y * rad;
      positions[i * 3 + 2] = Math.sin(theta) * ringR * rad;

      var mix = Math.random();
      if (mix > 0.9) color.copy(cool);
      else color.copy(gold).lerp(ivory, Math.random());

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    var sphereGeo = new THREE.BufferGeometry();
    sphereGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    sphereGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    var pointsMat = new THREE.PointsMaterial({
      size: mobile ? 0.05 : 0.038,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    var sphere = new THREE.Points(sphereGeo, pointsMat);
    root.add(sphere);

    var wireInner = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.62, 1)),
      new THREE.LineBasicMaterial({ color: 0xd9b878, transparent: true, opacity: 0.1, depthWrite: false })
    );
    root.add(wireInner);

    var wireOuter = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(3.0, 2)),
      new THREE.LineBasicMaterial({ color: 0xa48a5c, transparent: true, opacity: 0.032, depthWrite: false })
    );
    root.add(wireOuter);

    var satellites = [];
    var ringConfigs = [
      { radius: 2.86, rot: [1.2, 0.22, 0.08], opacity: 0.4, speed: 0.28, size: 0.024 },
      { radius: 3.1, rot: [-0.92, 0.86, -0.22], opacity: 0.26, speed: -0.2, size: 0.02 },
      { radius: 3.34, rot: [0.3, 1.35, 0.92], opacity: 0.17, speed: 0.16, size: 0.017 }
    ];

    ringConfigs.forEach(function (cfg) {
      var group = new THREE.Group();
      group.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);

      var torus = new THREE.Mesh(
        new THREE.TorusGeometry(cfg.radius, 0.0055, 6, 240),
        new THREE.MeshBasicMaterial({
          color: 0xd9b878,
          transparent: true,
          opacity: cfg.opacity,
          depthWrite: false
        })
      );
      group.add(torus);

      var sat = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.size, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfff1d4, transparent: true, opacity: 0.95 })
      );
      sat.position.set(cfg.radius, 0, 0);
      group.add(sat);

      satellites.push({ mesh: sat, radius: cfg.radius, speed: cfg.speed, phase: Math.random() * Math.PI * 2 });
      root.add(group);
    });

    var starCount = mobile ? 380 : 750;
    var starPositions = new Float32Array(starCount * 3);
    for (var s = 0; s < starCount; s++) {
      var thetaS = Math.random() * Math.PI * 2;
      var phiS = Math.acos(2 * Math.random() - 1);
      var dist = 6.5 + Math.random() * 9;
      starPositions[s * 3] = Math.sin(phiS) * Math.cos(thetaS) * dist;
      starPositions[s * 3 + 1] = Math.cos(phiS) * dist * 0.75;
      starPositions[s * 3 + 2] = Math.sin(phiS) * Math.sin(thetaS) * dist * 0.6;
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    var stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        size: 0.028,
        color: 0xcdd6e6,
        transparent: true,
        opacity: 0.42,
        map: dotTexture,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      })
    );
    scene.add(stars);

    function layout() {
      var w = canvas.clientWidth || 1;
      var h = canvas.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      if (window.innerWidth < 860) {
        root.position.set(0, 0.85, 0);
        root.scale.setScalar(0.76);
      } else if (window.innerWidth < 1180) {
        root.position.set(1.65, 0.15, 0);
        root.scale.setScalar(0.95);
      } else {
        root.position.set(2.3, 0.12, 0);
        root.scale.setScalar(1);
      }

      if (reduceMotion) renderer.render(scene, camera);

      onScroll();
    }

    layout();
    window.addEventListener("resize", layout, { passive: true });

    var pointer = { tx: 0, ty: 0, x: 0, y: 0 };
    if (finePointer && !reduceMotion) {
      window.addEventListener(
        "pointermove",
        function (e) {
          pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
          pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
        },
        { passive: true }
      );
    }

    var clock = new THREE.Clock();
    var heroEl = canvas.parentNode;

    function renderFrame() {
      var elapsed = clock.getElapsedTime();

      if (!doc.hidden) {
        var rect = heroEl.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          pointer.x += (pointer.tx - pointer.x) * 0.04;
          pointer.y += (pointer.ty - pointer.y) * 0.04;

          root.rotation.y = elapsed * 0.1 + pointer.x * 0.42;
          root.rotation.x = pointer.y * 0.26 + Math.sin(elapsed * 0.24) * 0.03;

          sphere.rotation.y = -elapsed * 0.042;
          sphere.scale.setScalar(1 + Math.sin(elapsed * 0.8) * 0.013);

          wireInner.rotation.y = elapsed * 0.06;
          wireInner.rotation.x = Math.sin(elapsed * 0.2) * 0.09;
          wireOuter.rotation.y = -elapsed * 0.028;
          wireOuter.rotation.z = Math.cos(elapsed * 0.12) * 0.05;

          stars.rotation.y = elapsed * 0.009;
          stars.rotation.x = Math.sin(elapsed * 0.05) * 0.02;

          satellites.forEach(function (sat) {
            var angle = elapsed * sat.speed + sat.phase;
            sat.mesh.position.set(Math.cos(angle) * sat.radius, Math.sin(angle) * sat.radius, 0);
          });

          renderer.render(scene, camera);
        }
      }

      requestAnimationFrame(renderFrame);
    }

    if (reduceMotion) {
      renderer.render(scene, camera);
    } else {
      requestAnimationFrame(renderFrame);
    }

    doc.addEventListener("visibilitychange", function () {
      if (!doc.hidden && !reduceMotion) clock.getDelta();
    });
  }

  initScene();
})();
