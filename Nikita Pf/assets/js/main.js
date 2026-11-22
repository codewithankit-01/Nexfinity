(function () {
  'use strict';

  var doc = document;
  var header = doc.getElementById('siteHeader');
  var menuToggle = doc.getElementById('menuToggle');
  var navBackdrop = doc.getElementById('navBackdrop');
  var navRoot = doc.getElementById('primaryNav');
  var pageRisers = doc.getElementById('pageRisers');
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('[data-nav]'));
  var menuOpen = false;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var year = doc.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  function setMenu(open) {
    if (!header || !menuToggle) return;
    menuOpen = open;
    header.classList.toggle('nav-open', open);
    doc.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      setMenu(!menuOpen);
    });
  }
  if (navBackdrop) navBackdrop.addEventListener('click', function () { setMenu(false); });
  if (navRoot) {
    navRoot.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
  }
  doc.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menuOpen) {
      setMenu(false);
      menuToggle.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 940 && menuOpen) setMenu(false);
  });

  var sections = navLinks.map(function (link) {
    return doc.getElementById(link.getAttribute('data-nav'));
  }).filter(Boolean);

  function updateHeader() {
    var marker = window.scrollY + 150;
    var ambient = doc.querySelector('.ambient-background');
    var perspectiveGrid = doc.querySelector('.hero-perspective-grid');
    var current = sections.length ? sections[0].id : '';
    sections.forEach(function (section) {
      if (section.offsetTop <= marker) current = section.id;
    });
    var scrollShift = Math.min(window.scrollY * 0.025, 55);
    if (ambient) {
      ambient.style.setProperty('--ambient-scroll-a', (-scrollShift * 0.35) + 'px');
      ambient.style.setProperty('--ambient-scroll-b', (scrollShift * 0.55) + 'px');
      ambient.style.setProperty('--ambient-scroll-c', (-scrollShift * 0.7) + 'px');
    }
    if (perspectiveGrid) perspectiveGrid.style.setProperty('--grid-scroll-y', (scrollShift * 0.22) + 'px');
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 18);
    if (pageRisers) {
      var surface = doc.elementFromPoint(window.innerWidth / 2, window.innerHeight * 0.52);
      var themedSection = surface && surface.closest('[data-riser-theme]');
      var lightSurface = themedSection && themedSection.getAttribute('data-riser-theme') === 'light';
      pageRisers.classList.toggle('is-light', Boolean(lightSurface));
      pageRisers.classList.toggle('is-dark', !lightSurface);
    }
    navLinks.forEach(function (link) {
      var active = link.getAttribute('data-nav') === current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateHeader();
      ticking = false;
    });
  }, { passive: true });
  updateHeader();

  var particleCanvas = doc.getElementById('particleCanvas');
  var particleContext = particleCanvas && particleCanvas.getContext ? particleCanvas.getContext('2d') : null;
  if (particleCanvas && particleContext) {
    var particles = [];
    var canvasWidth = 0;
    var canvasHeight = 0;
    var pixelRatio = 1;
    var animationFrame = 0;
    var finePointer = window.matchMedia('(pointer: fine) and (min-width: 760px)').matches;
    var pointer = { x: -1000, y: -1000 };
    var heroVisible = true;

    function renderParticles() {
      particleContext.clearRect(0, 0, canvasWidth, canvasHeight);
      var linkDistance = window.innerWidth < 680 ? 74 : 108;
      var linkDistanceSquared = linkDistance * linkDistance;

      for (var i = 0; i < particles.length; i += 1) {
        var particle = particles[i];
        for (var j = i + 1; j < particles.length; j += 1) {
          var other = particles[j];
          var dx = particle.x - other.x;
          var dy = particle.y - other.y;
          var distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < linkDistanceSquared) {
            var alpha = (1 - Math.sqrt(distanceSquared) / linkDistance) * 0.1;
            particleContext.beginPath();
            particleContext.moveTo(particle.x, particle.y);
            particleContext.lineTo(other.x, other.y);
            particleContext.strokeStyle = 'rgba(38, 54, 83, ' + alpha.toFixed(3) + ')';
            particleContext.lineWidth = 0.7;
            particleContext.stroke();
          }
        }
        particleContext.beginPath();
        particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        particleContext.fillStyle = 'rgba(38, 54, 83, ' + particle.opacity + ')';
        particleContext.fill();
      }
    }

    function resizeParticles() {
      var bounds = particleCanvas.getBoundingClientRect();
      canvasWidth = bounds.width;
      canvasHeight = bounds.height;
      if (!canvasWidth || !canvasHeight) return;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      particleCanvas.width = Math.round(canvasWidth * pixelRatio);
      particleCanvas.height = Math.round(canvasHeight * pixelRatio);
      particleCanvas.style.width = canvasWidth + 'px';
      particleCanvas.style.height = canvasHeight + 'px';
      particleContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      var mobile = canvasWidth < 680;
      var count = Math.round((canvasWidth * canvasHeight) / (mobile ? 30000 : 21000));
      count = Math.max(mobile ? 14 : 22, Math.min(mobile ? 26 : 58, count));
      particles = [];
      for (var i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
          radius: Math.random() * 1.1 + 0.55,
          opacity: (Math.random() * 0.1 + 0.08).toFixed(2),
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12
        });
      }
      renderParticles();
    }

    function animateParticles() {
      for (var i = 0; i < particles.length; i += 1) {
        var particle = particles[i];
        if (finePointer) {
          var dx = particle.x - pointer.x;
          var dy = particle.y - pointer.y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0 && distance < 135) {
            var nudge = (1 - distance / 135) * 0.003;
            particle.vx += (dx / distance) * nudge;
            particle.vy += (dy / distance) * nudge;
          }
        }
        particle.vx = Math.max(-0.15, Math.min(0.15, particle.vx));
        particle.vy = Math.max(-0.15, Math.min(0.15, particle.vy));
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -4) particle.x = canvasWidth + 4;
        else if (particle.x > canvasWidth + 4) particle.x = -4;
        if (particle.y < -4) particle.y = canvasHeight + 4;
        else if (particle.y > canvasHeight + 4) particle.y = -4;
      }
      renderParticles();
      animationFrame = window.requestAnimationFrame(animateParticles);
    }

    function startParticles() {
      if (reduceMotion || doc.hidden || !heroVisible || animationFrame) return;
      animationFrame = window.requestAnimationFrame(animateParticles);
    }

    function stopParticles() {
      if (!animationFrame) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    resizeParticles();
    startParticles();
    window.addEventListener('resize', resizeParticles, { passive: true });
    if ('IntersectionObserver' in window) {
      var heroVisibilityObserver = new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) startParticles();
        else stopParticles();
      });
      heroVisibilityObserver.observe(doc.getElementById('home'));
    }
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) stopParticles();
      else startParticles();
    });
    if (finePointer) {
      window.addEventListener('pointermove', function (event) {
        var bounds = particleCanvas.getBoundingClientRect();
        pointer.x = event.clientX - bounds.left;
        pointer.y = event.clientY - bounds.top;
      }, { passive: true });
      window.addEventListener('pointerout', function (event) {
        if (!event.relatedTarget) {
          pointer.x = -1000;
          pointer.y = -1000;
        }
      }, { passive: true });
    }
  }

  var codeOutput = doc.querySelector('[data-hero-code]');
  if (codeOutput) {
    var codeSample = [
      '<main class="studio">',
      '  <h1>Design + Code</h1>',
      '  <p>Make it matter.</p>',
      '</main>',
      '',
      '<style>',
      '  .studio { color: #0a84ff; }',
      '</style>'
    ].join('\n');
    if (reduceMotion) {
      codeOutput.textContent = codeSample;
    } else {
      var codePosition = 0;
      function typeCode() {
        if (codePosition >= codeSample.length) {
          window.setTimeout(function () {
            codePosition = 0;
            codeOutput.textContent = '';
            typeCode();
          }, 1400);
          return;
        }
        codePosition += 1;
        codeOutput.textContent = codeSample.slice(0, codePosition);
        window.setTimeout(typeCode, 27);
      }
      typeCode();
    }
  }

  var pointerEffects = window.matchMedia('(pointer: fine) and (min-width: 760px)').matches && !reduceMotion;
  if (pointerEffects) {
    Array.prototype.slice.call(doc.querySelectorAll('.service-card, .team-profile')).forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        card.style.setProperty('--pointer-x', x + 'px');
        card.style.setProperty('--pointer-y', y + 'px');
        if (card.classList.contains('service-card')) {
          var tiltX = (x / rect.width - 0.5) * 3.2;
          var tiltY = (0.5 - y / rect.height) * 3.2;
          card.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
          card.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
        }
      }, { passive: true });
      card.addEventListener('pointerleave', function () {
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      });
    });

    Array.prototype.slice.call(doc.querySelectorAll('.button-primary, .button-secondary, .button-white, .nav-cta')).forEach(function (button) {
      button.addEventListener('pointermove', function (event) {
        var rect = button.getBoundingClientRect();
        button.style.translate = (((event.clientX - rect.left) / rect.width - 0.5) * 3) + 'px '
          + (((event.clientY - rect.top) / rect.height - 0.5) * 3) + 'px';
      }, { passive: true });
      button.addEventListener('pointerleave', function () {
        button.style.translate = '';
      });
    });
  }

  var revealItems = Array.prototype.slice.call(doc.querySelectorAll('[data-reveal]'));
  Array.prototype.slice.call(doc.querySelectorAll('main section')).forEach(function (section) {
    Array.prototype.slice.call(section.querySelectorAll('[data-reveal]')).forEach(function (item, index) {
      item.style.setProperty('--reveal-delay', Math.min(index * 70, 280) + 'ms');
    });
  });
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  }

  var form = doc.getElementById('contactForm');
  if (form) {
    var status = doc.getElementById('formStatus');
    var fieldDefinitions = [
      {
        input: doc.getElementById('fName'),
        error: doc.getElementById('fNameError'),
        validate: function (value) { return value.trim().length >= 2 ? '' : 'Please enter your name (at least 2 characters).'; }
      },
      {
        input: doc.getElementById('fEmail'),
        error: doc.getElementById('fEmailError'),
        validate: function (value) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? '' : 'Please enter a valid email address.'; }
      },
      {
        input: doc.getElementById('fProject'),
        error: doc.getElementById('fProjectError'),
        validate: function (value) { return value ? '' : 'Please choose a project type.'; }
      },
      {
        input: doc.getElementById('fMessage'),
        error: doc.getElementById('fMessageError'),
        validate: function (value) { return value.trim().length >= 10 ? '' : 'Please add a few details (at least 10 characters).'; }
      }
    ];

    function validateField(field) {
      var message = field.validate(field.input.value);
      var wrapper = field.input.closest('.field');
      wrapper.classList.toggle('has-error', Boolean(message));
      field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
      field.error.textContent = message;
      return message;
    }

    fieldDefinitions.forEach(function (field) {
      field.input.addEventListener('input', function () {
        if (field.input.closest('.field').classList.contains('has-error')) validateField(field);
      });
      field.input.addEventListener('change', function () {
        if (field.input.closest('.field').classList.contains('has-error')) validateField(field);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var firstInvalid = null;
      fieldDefinitions.forEach(function (field) {
        if (validateField(field) && !firstInvalid) firstInvalid = field.input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var values = new FormData(form);
      var message = 'Hi WebWali, I would like to discuss a project.\n\n'
        + 'Name: ' + values.get('name').trim() + '\n'
        + 'Email: ' + values.get('email').trim() + '\n'
        + 'Project type: ' + values.get('project') + '\n\n'
        + 'Project details:\n' + values.get('message').trim();
      var whatsappUrl = 'https://wa.me/919521835235?text=' + encodeURIComponent(message);

      status.replaceChildren();
      status.appendChild(doc.createTextNode('Your message is ready. Review it and press Send in WhatsApp to contact us.'));
      var link = doc.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.appendChild(doc.createTextNode('Continue to WhatsApp'));
      var icon = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'icon');
      icon.setAttribute('aria-hidden', 'true');
      var use = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', '#i-up-right');
      icon.appendChild(use);
      link.appendChild(icon);
      status.appendChild(doc.createElement('br'));
      status.appendChild(link);
      status.hidden = false;
      status.focus();
    });
  }
})();
