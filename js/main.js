/* ================================================
   SOUTHERN GROUP — Main JS
   ================================================ */

/* ── Header scroll state ── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ── Burger / drawer ── */
const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');

burger.addEventListener('click', () => {
  const open = drawer.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});

drawer.querySelectorAll('.nav__a:not(.drawer__grp-btn)').forEach(a => {
  a.addEventListener('click', () => {
    drawer.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

/* ── Smooth scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const hdrH = header ? header.getBoundingClientRect().height : 72;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - hdrH - 8,
      behavior: 'smooth'
    });
  });
});

/* ── Scroll-reveal (fade-up) ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.fade-up').forEach((el, i) => {
  // Stagger siblings inside the same parent
  const siblings = [...el.parentElement.querySelectorAll('.fade-up')];
  const idx = siblings.indexOf(el);
  el.style.transitionDelay = `${idx * 80}ms`;
  revealObserver.observe(el);
});

/* ── Counter animation ── */
function runCounter(el) {
  const target = parseInt(el.getAttribute('data-to'), 10);
  const duration = 1600;
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target).toLocaleString('en-IN');
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString('en-IN');
  };
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    runCounter(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-to]').forEach(el => {
  counterObserver.observe(el);
});

/* ── Active nav highlight ── */
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav .nav__a, .drawer .nav__a');

const activeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
    });
  });
}, { rootMargin: '-45% 0px -45% 0px' });

sections.forEach(s => activeObserver.observe(s));

/* ── Nav dropdown (desktop) ── */
const companyDrop    = document.getElementById('companyDrop');
const companyDropBtn = document.getElementById('companyDropBtn');

if (companyDrop && companyDropBtn) {
  companyDropBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = companyDrop.classList.toggle('open');
    companyDropBtn.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', function() {
    companyDrop.classList.remove('open');
    companyDropBtn.setAttribute('aria-expanded', false);
  });

  companyDrop.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      companyDrop.classList.remove('open');
      companyDropBtn.setAttribute('aria-expanded', false);
    }
  });
}

/* ── Drawer sub-menu (mobile) ── */
const drawerDropBtn = document.getElementById('drawerDropBtn');
const drawerSub     = document.getElementById('drawerSub');
if (drawerDropBtn && drawerSub) {
  drawerDropBtn.addEventListener('click', () => drawerSub.classList.toggle('open'));
}

/* ── Promoter bar animation (company pages) ── */
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.style.width = entry.target.getAttribute('data-width');
    barObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });
document.querySelectorAll('.promoter__bar-fill').forEach(el => barObserver.observe(el));

/* ── Contact form ── */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    // 1. Gather all form inputs
    const nameVal     = document.getElementById('f-name').value.trim();
    const emailVal    = document.getElementById('f-email').value.trim();
    const orgVal      = document.getElementById('f-org').value.trim() || 'N/A';
    const interestSel = document.getElementById('f-interest');
    const interestVal = interestSel.options[interestSel.selectedIndex] ? interestSel.options[interestSel.selectedIndex].text : 'General Enquiry';
    const msgVal      = document.getElementById('f-msg').value.trim();

    // 2. Validate required inputs
    if (!nameVal || !emailVal || !msgVal) {
      alert('Please fill out all required fields.');
      return;
    }

    // 3. Format message professionally
    const textMsg = `*Southern Group — New Website Enquiry*\n\n` +
                    `*Name:* ${nameVal}\n` +
                    `*Email:* ${emailVal}\n` +
                    `*Organisation:* ${orgVal}\n` +
                    `*Area of Interest:* ${interestVal}\n\n` +
                    `*Message:*\n${msgVal}`;

    // 4. Construct WhatsApp API link (+91 95666 47774)
    const waUrl = `https://wa.me/919566647774?text=${encodeURIComponent(textMsg)}`;

    // 5. Open WhatsApp in new tab
    window.open(waUrl, '_blank');

    // 6. Visual feedback
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Redirecting to WhatsApp...';
    btn.disabled = true;
    btn.style.background = '#2d7a5a';

    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      btn.style.background = '';
      form.reset();
    }, 3500);
  });
}
