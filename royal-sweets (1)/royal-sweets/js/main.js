/* ===== Royal Sweets – main.js ===== */
(() => {
  'use strict';

  /* ---------- CONFIG (yahan se badlein) ---------- */
  const PHONE = '919672244908';          // WhatsApp number (country code ke saath, + ke bina)
  const SHOP  = 'Royal Sweets';

  // Products: price = per kg (approx). img: apni photo ka path daalein, jaise 'images/kaju-katli.jpg'
  const PRODUCTS = [
    // Kaju sweets
    { id:'k1', cat:'kaju',   name:'Kaju Katli',          desc:'Silver-leaf wali classic, muh mein ghul jaane wali.', price:1100, emoji:'🍬', tag:'Bestseller', img:'images/kaju-katli.webp' },
    { id:'k2', cat:'kaju',   name:'Kaju Pista Roll',     desc:'Kaju ke saath bhara hua pista ka shahi roll.',        price:1200, emoji:'🥮', tag:'Royal',      img:'images/kaju-pista-roll.webp' },
    { id:'k3', cat:'kaju',   name:'Kaju Anjeer Barfi',   desc:'Anjeer aur kaju ka healthy-tasty combo.',             price:1250, emoji:'🍯', tag:'New',        img:'images/kaju-anjeer-barfi.webp' },
    { id:'k4', cat:'kaju',   name:'Kaju Gulkand',        desc:'Gulkand ki mithaas aur kaju ki narmi.',               price:1150, emoji:'🌹', tag:'',           img:'images/kaju-gulkand.webp' },
    { id:'k5', cat:'kaju',   name:'Chocolate Kaju Katli',desc:'Choco-lovers ke liye kaju katli ka naya avatar.',     price:1150, emoji:'🍫', tag:'Kids Fav',   img:'images/chocolate-kaju-katli.webp' },
    { id:'k6', cat:'kaju',   name:'Kesar Kaju Kalash',   desc:'Kesar ki khushboo wale kaju ke kalash.',              price:1300, emoji:'🥜', tag:'Premium',    img:'images/kesar-kaju-kalash.webp' },
    // Mithai
    { id:'m1', cat:'mithai', name:'Gulab Jamun',         desc:'Garma-garam, chashni mein dooba hua desi ghee wala.', price:480,  emoji:'🍮', tag:'Bestseller', img:'images/gulab-jamun.webp' },
    { id:'m2', cat:'mithai', name:'Rasmalai',            desc:'Kesar-elaichi doodh mein tairte narm rasgulle.',      price:620,  emoji:'🥛', tag:'Fresh',      img:'images/rasmalai.webp' },
    { id:'m3', cat:'mithai', name:'Motichoor Ladoo',     desc:'Boondi ke motiyon se bane shuddh ghee ke ladoo.',     price:560,  emoji:'🟠', tag:'',           img:'images/motichoor-ladoo.webp' },
    { id:'m4', cat:'mithai', name:'Soan Papdi',          desc:'Resham jaisi parton wali, ilaichi ki khushboo.',      price:420,  emoji:'🍥', tag:'',           img:'images/soan-papdi.webp' },
    { id:'m5', cat:'mithai', name:'Jalebi',              desc:'Kurkuri, rasili aur ekdum taazi.',                    price:360,  emoji:'🌀', tag:'Hot',        img:'images/jalebi.webp' },
    { id:'m6', cat:'mithai', name:'Mawa Barfi',          desc:'Khoye ki asli barfi, upar se pista ki saja.',         price:640,  emoji:'🟨', tag:'',           img:'images/mawa-barfi.webp' },
    // Cakes
    { id:'c1', cat:'cake',   name:'Chocolate Truffle',   desc:'Rich dark chocolate ganache ke saath.',               price:850,  emoji:'🎂', tag:'Bestseller', img:'images/chocolate-truffle.webp' },
    { id:'c2', cat:'cake',   name:'Black Forest',        desc:'Cherry aur whipped cream ki classic jodi.',           price:750,  emoji:'🍰', tag:'',           img:'images/black-forest.webp' },
    { id:'c3', cat:'cake',   name:'Red Velvet',          desc:'Cream cheese frosting wala lal makhmali cake.',       price:950,  emoji:'❤️', tag:'Trending',   img:'images/red-velvet.webp' },
    { id:'c4', cat:'cake',   name:'Butterscotch',        desc:'Crunchy caramel nuts aur butterscotch cream.',        price:780,  emoji:'🧁', tag:'',           img:'images/butterscotch.webp' },
    { id:'c5', cat:'cake',   name:'Pineapple Cake',      desc:'Fresh pineapple pieces ke saath halka cake.',         price:720,  emoji:'🍍', tag:'',           img:'images/pineapple-cake.webp' },
    { id:'c6', cat:'cake',   name:'Rasmalai Cake',       desc:'Desi twist – rasmalai flavour ka fusion cake.',       price:1050, emoji:'🥧', tag:'Special',    img:'images/rasmalai-cake.webp' }
  ];

  const WEIGHTS = {
    kaju:   [250, 500, 1000],
    mithai: [250, 500, 1000],
    cake:   [500, 1000, 2000]
  };
  const GRAD = { kaju:'g-kaju', mithai:'g-mithai', cake:'g-cake' };

  /* ---------- helpers ---------- */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const wLabel = g => g >= 1000 ? (g / 1000) + ' kg' : g + ' g';
  const waLink = text => `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
  const safeGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const price = (p, g) => p.price * g / 1000;

  /* ---------- preloader ---------- */
  window.addEventListener('load', () => setTimeout(() => $('#preloader').classList.add('done'), 900));
  setTimeout(() => $('#preloader').classList.add('done'), 3500); // fallback

  $('#year').textContent = new Date().getFullYear();

  /* ---------- header / scroll ---------- */
  const header = $('#header'), toTop = $('#toTop'), prog = $('.scroll-progress');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 600);
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (h > 0 ? y / h * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => { burger.classList.toggle('open'); nav.classList.toggle('open'); });
  $$('#nav a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); nav.classList.remove('open'); }));

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- counters ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1800;
    const step = t => {
      const k = Math.min((t - t0) / dur, 1), v = Math.floor(end * (1 - Math.pow(1 - k, 3)));
      el.textContent = v + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    cio.unobserve(el);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- custom cursor ---------- */
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (fine) {
    document.body.classList.add('has-cursor');
    const dot = $('.cursor-dot'), ring = $('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, lastSpark = 0;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;
      const now = performance.now();
      if (now - lastSpark > 70) {           // golden spark trail
        lastSpark = now;
        const s = document.createElement('i');
        s.className = 'cursor-spark';
        s.style.left = mx + 'px'; s.style.top = my + 'px';
        s.style.setProperty('--x', (Math.random() * 40 - 20) + 'px');
        s.style.setProperty('--y', (Math.random() * 40 + 5) + 'px');
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 800);
      }
    });
    (function loop() {
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => {
      ring.classList.toggle('hover', !!e.target.closest('a,button,select,input,textarea,.card,.tile,.why-card,.step,.box'));
    });
    addEventListener('mousedown', () => ring.classList.add('down'));
    addEventListener('mouseup', () => ring.classList.remove('down'));
  }

  /* ---------- button ripple + magnetic ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('.btn');
    if (!b) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(s);
    setTimeout(() => s.remove(), 700);
  });
  if (fine) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .35 - 3}px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  /* ---------- hero sparkles canvas ---------- */
  (function sparkles() {
    const c = $('#sparkles'), ctx = c.getContext('2d');
    let W, H, ps = [];
    const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
    resize(); addEventListener('resize', resize);
    const make = () => ({ x: Math.random() * W, y: H + 10, r: Math.random() * 2.2 + .6, v: Math.random() * .6 + .25, a: Math.random() * .6 + .3, w: Math.random() * Math.PI * 2 });
    for (let i = 0; i < 70; i++) { const p = make(); p.y = Math.random() * H; ps.push(p); }
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p, i) => {
        p.y -= p.v; p.w += .02; p.x += Math.sin(p.w) * .4;
        if (p.y < -10) ps[i] = make();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(246,220,155,${p.a * (.6 + .4 * Math.sin(p.w * 2))})`;
        ctx.shadowColor = '#d4a24c'; ctx.shadowBlur = 8;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    })();
  })();

  /* ---------- hero parallax ---------- */
  const hv = $('.hero-visual');
  if (fine && hv) {
    $('.hero').addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
      $$('.float', hv).forEach((f, i) => f.style.translate = `${x * (14 + i * 6)}px ${y * (14 + i * 6)}px`);
      $('.plate', hv).style.translate = `${x * -18}px ${y * -18}px`;
    });
  }

  /* hamper photo tilt */
  $$('.hamper-photo').forEach(el => { if (!fine) return; el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`; }); el.addEventListener('mouseleave', () => el.style.transform = ''); });

  /* ---------- products ---------- */
  const grid = $('#productGrid');
  function render(filter = 'all') {
    const list = PRODUCTS.filter(p => filter === 'all' || p.cat === filter);
    grid.innerHTML = list.map((p, i) => {
      const w = WEIGHTS[p.cat];
      return `
      <article class="card" data-id="${p.id}" style="--i:${i * .06}s">
        <div class="card-visual ${GRAD[p.cat]}">
          ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
          ${p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">` : `<span class="emoji">${p.emoji}</span>`}
        </div>
        <div class="card-body">
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="row">
            <select class="wt" aria-label="Weight">${w.map((g, k) => `<option value="${g}" ${k === 1 ? 'selected' : ''}>${wLabel(g)}</option>`).join('')}</select>
            <span class="price">${inr(price(p, w[1]))}</span>
          </div>
          <div class="actions">
            <button class="btn btn-ghost add">+ Cart</button>
            <a class="btn btn-wa order" href="#" target="_blank" rel="noopener">Order</a>
          </div>
        </div>
      </article>`;
    }).join('');
    $$('.card', grid).forEach(tilt);
    $$('img', grid).forEach(im => im.addEventListener('error', () => im.replaceWith(Object.assign(document.createElement('span'), { className: 'emoji', textContent: '🍰' }))));
    $$('.card', grid).forEach(syncOrderLink);
  }

  function tilt(card) {
    if (!fine) return;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  }

  const prodOf = card => PRODUCTS.find(p => p.id === card.dataset.id);
  function syncOrderLink(card) {
    const p = prodOf(card), g = +$('.wt', card).value;
    $('.price', card).textContent = inr(price(p, g));
    $('.order', card).href = waLink(`Namaste ${SHOP}! Mujhe order karna hai:\n\n• ${p.name} – ${wLabel(g)} (${inr(price(p, g))})\n\nPlease confirm karein.`);
  }

  grid.addEventListener('change', e => { if (e.target.matches('.wt')) syncOrderLink(e.target.closest('.card')); });
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.add');
    if (!btn) return;
    const card = btn.closest('.card'), p = prodOf(card), g = +$('.wt', card).value;
    addToCart(p, g);
  });

  $('#tabs').addEventListener('click', e => {
    const t = e.target.closest('.tab');
    if (!t) return;
    $$('.tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    render(t.dataset.filter);
  });
  render();

  /* ---------- cart ---------- */
  let cart = safeGet('rs_cart', []);
  const drawer = $('#drawer'), overlay = $('#overlay'), itemsEl = $('#cartItems');
  const openCart = () => { drawer.classList.add('open'); overlay.classList.add('show'); };
  const closeCart = () => { drawer.classList.remove('open'); overlay.classList.remove('show'); };
  $('#openCart').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('show'), 1800);
  }

  function addToCart(p, g) {
    const hit = cart.find(i => i.id === p.id && i.g === g);
    hit ? hit.q++ : cart.push({ id: p.id, g, q: 1 });
    saveCart();
    const cb = $('#openCart'); cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump');
    toast(`${p.name} cart mein add ho gaya ✓`);
  }

  function saveCart() { safeSet('rs_cart', cart); renderCart(); }

  function renderCart() {
    const count = cart.reduce((s, i) => s + i.q, 0);
    $('#cartCount').textContent = count;
    let total = 0;
    if (!cart.length) {
      itemsEl.innerHTML = `<div class="empty"><span>🛒</span>Cart khaali hai.<br>Menu se kuch meetha chuniye!</div>`;
    } else {
      itemsEl.innerHTML = cart.map((it, idx) => {
        const p = PRODUCTS.find(x => x.id === it.id);
        if (!p) return '';
        const line = price(p, it.g) * it.q; total += line;
        return `<div class="ci">
          <div class="ci-e">${p.emoji}</div>
          <div class="ci-i"><b>${p.name}</b><small>${wLabel(it.g)} · ${inr(line)}</small></div>
          <div class="qty"><button data-a="minus" data-i="${idx}" aria-label="Kam">−</button><span>${it.q}</span><button data-a="plus" data-i="${idx}" aria-label="Zyada">+</button></div>
        </div>`;
      }).join('');
    }
    $('#cartTotal').textContent = inr(total);
  }

  itemsEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-a]');
    if (!b) return;
    const i = +b.dataset.i;
    if (b.dataset.a === 'plus') cart[i].q++;
    else { cart[i].q--; if (cart[i].q <= 0) cart.splice(i, 1); }
    saveCart();
  });

  $('#checkout').addEventListener('click', () => {
    if (!cart.length) { toast('Pehle cart mein kuch add kijiye'); return; }
    const name = $('#custName').value.trim(), addr = $('#custAddr').value.trim();
    let total = 0;
    const lines = cart.map(it => {
      const p = PRODUCTS.find(x => x.id === it.id), line = price(p, it.g) * it.q;
      total += line;
      return `• ${p.name} – ${wLabel(it.g)} × ${it.q} = ${inr(line)}`;
    });
    const msg = `Namaste ${SHOP}! Mujhe ye order karna hai:\n\n${lines.join('\n')}\n\nTotal (approx.): ${inr(total)}` +
      (name ? `\n\nNaam: ${name}` : '') + (addr ? `\nAddress: ${addr}` : '') + `\n\nPlease confirm karein. Dhanyavaad!`;
    window.open(waLink(msg), '_blank', 'noopener');
  });
  renderCart();

  /* ---------- custom cake form ---------- */
  const cakeForm = $('#cakeForm');
  if (cakeForm) {
    const di = cakeForm.elements.date;
    di.min = new Date().toISOString().split('T')[0];
    cakeForm.addEventListener('submit', e => {
      e.preventDefault();
      const f = cakeForm.elements;
      const msg = `Namaste ${SHOP}! Mujhe custom cake order karna hai:\n\n` +
        `Naam: ${f.name.value}\nFlavour: ${f.flavour.value}\nWeight: ${f.weight.value}\n${f.egg.value}\n` +
        `Delivery Date: ${f.date.value}\nCake par likhna hai: ${f.msg.value || '—'}\n\nPlease confirm karein.`;
      window.open(waLink(msg), '_blank', 'noopener');
    });
  }
})();
