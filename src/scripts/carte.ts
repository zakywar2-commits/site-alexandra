// Broșura răsfoită: foile se întorc în jurul cotorului.
// Calculator: pagini duble („s” = câte foi sunt întoarse). Telefon: o pagină pe rând („k”).

const RATIO = 0.74; // lățime / înălțime pentru o pagină
const DUR = 900;

/** foșnet scurt de hârtie, făcut din zgomot filtrat; pornește doar dacă îl alegi */
function paperSound() {
  let ctx: AudioContext | undefined;
  return () => {
    ctx ??= new AudioContext();
    const len = 0.42;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const t = i / d.length;
      const env = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 1.6) * (0.55 + 0.45 * Math.random());
      d[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1800, ctx.currentTime);
    bp.frequency.linearRampToValueAtTime(3800, ctx.currentTime + len);
    bp.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.value = 0.22;
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start();
  };
}

export function mountCarte(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const book = root.querySelector<HTMLElement>('[data-book]')!;
  const leaves = [...root.querySelectorAll<HTMLElement>('[data-leaf]')];
  const faces = [...root.querySelectorAll<HTMLElement>('[data-page]')];
  const skip = new Set(faces.filter((f) => f.hasAttribute('data-skip')).map((f) => Number(f.dataset.page)));
  const count = root.querySelector<HTMLElement>('[data-count]')!;
  const prevBtn = root.querySelector<HTMLButtonElement>('[data-prev]')!;
  const nextBtn = root.querySelector<HTMLButtonElement>('[data-next]')!;
  const corners = root.querySelector<HTMLElement>('[data-corners]')!;
  const soundBtn = root.querySelector<HTMLButtonElement>('[data-sound]')!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const L = leaves.length;
  const N = L * 2;
  const rustle = paperSound();
  let sound = false;
  let single = false;
  let pw = 400;
  let k = 0; // pagina curentă (telefon); pe calculator ținem doar s
  let s = 0;
  let spread = false;

  if (reduce) {
    book.style.transition = 'none';
    leaves.forEach((l) => (l.style.transition = 'none'));
  }

  const layout = () => {
    const W = stage.clientWidth, H = stage.clientHeight;
    single = W < 760;
    root.classList.toggle('single', single);
    const m = single ? 16 : 48;
    pw = single ? Math.min(W - m * 2, (H - 24) * RATIO) : Math.min((W - m * 2) / 2, (H - 40) * RATIO);
    pw = Math.floor(pw);
    root.style.setProperty('--pw', `${pw}px`);
    root.style.setProperty('--ph', `${Math.floor(pw / RATIO)}px`);
    if (single) k = Math.min(N - 1, s === 0 ? 0 : s === L ? N - 1 : 2 * s - 1);
    else s = Math.ceil(k / 2);
    render(false);
  };

  const flippedCount = () => (single ? Math.ceil(k / 2) : s);

  const render = (animate = true, turning = -1) => {
    const f = flippedCount();
    leaves.forEach((l, i) => {
      const on = i < f;
      l.classList.toggle('flipped', on);
      l.style.zIndex = String(i === turning ? L + 5 : on ? i + 1 : L - i);
    });
    if (turning >= 0 && animate && !reduce) {
      const l = leaves[turning];
      l.classList.remove('turning');
      void l.offsetWidth;
      l.classList.add('turning');
      if (sound) rustle();
      setTimeout(() => {
        l.classList.remove('turning');
        render(false);
      }, DUR);
    }
    let x: number;
    if (single) x = k % 2 === 0 ? -pw / 2 : pw / 2; // arătăm doar jumătatea cu pagina curentă
    else x = f === 0 ? -pw / 2 : f === L ? pw / 2 : 0; // închisă: coperta e centrată
    book.style.transform = `translateX(${x}px)`;
    // butoanele stau în colțurile paginilor vizibile: o pagină sau pagina dublă
    spread = !single && f > 0 && f < L;
    corners.style.setProperty('--cw', `${spread ? pw * 2 : pw}px`);
    const cur = single ? faces.find((el) => Number(el.dataset.page) === k) : f === 0 ? faces[0] : f === L ? faces[N - 1] : undefined;
    corners.classList.toggle('on-cover', !!cur && /k-(cover|home|back)/.test(cur.className));
    book.dataset.s = String(f);
    // pe telefon se vede doar pagina curentă (cât se întoarce foaia, se văd amândouă fețele)
    const busy = turning >= 0 && animate && !reduce;
    faces.forEach((el) => (el.style.visibility = !single || busy || Number(el.dataset.page) === k ? '' : 'hidden'));
    const first = single ? k + 1 : Math.max(1, 2 * f);
    const last = single ? 0 : Math.min(N, 2 * f + 1);
    count.textContent = single || f === 0 || f === L ? `${f === L && !single ? N : first} / ${N}` : `${first}–${last} / ${N}`;
    prevBtn.disabled = single ? k === 0 : f === 0;
    nextBtn.disabled = single ? k === N - 1 : f === L;
  };

  const go = (dir: 1 | -1) => {
    if (single) {
      let nk = k + dir;
      // pe telefon un desen pe două pagini se vede întreg pe prima; a doua e sărită
      while (nk > 0 && nk < N - 1 && skip.has(nk)) nk += dir;
      if (nk < 0 || nk > N - 1) return;
      const a = Math.ceil(k / 2), b = Math.ceil(nk / 2);
      const turning = b > a ? a : b < a ? b : -1;
      k = nk;
      render(true, turning);
    } else {
      const ns = s + dir;
      if (ns < 0 || ns > L) return;
      const turning = dir === 1 ? s : ns;
      s = ns;
      render(true, turning);
    }
  };

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
  soundBtn.addEventListener('click', () => {
    sound = !sound;
    soundBtn.setAttribute('aria-pressed', String(sound));
    soundBtn.querySelector('span')!.textContent = sound ? soundBtn.dataset.on! : soundBtn.dataset.off!;
    if (sound) rustle();
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
  });

  // click pe jumătatea stângă = înapoi, pe cea dreaptă = înainte; pe telefon și swipe
  let downX = 0, downY = 0, swiped = false;
  stage.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; swiped = false; });
  stage.addEventListener('pointerup', (e) => {
    const dx = e.clientX - downX, dy = e.clientY - downY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped = true; go(dx < 0 ? 1 : -1); }
  });
  stage.addEventListener('click', (e) => {
    if (swiped) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    go(x < (single ? 0.33 : 0.5) ? -1 : 1);
  });

  // pe pagina de start cartea se deschide singură când treci cu mouse-ul peste copertă
  if (root.hasAttribute('data-hover')) {
    book.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' && flippedCount() === 0) go(1);
    });
  }

  // butonul de pe pagina pe care e mouse-ul se închide la culoare
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = corners.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    const left = e.clientX < r.left + r.width / 2;
    corners.classList.toggle('hot-l', inside && (!spread || left));
    corners.classList.toggle('hot-r', inside && (!spread || !left));
  });
  stage.addEventListener('pointerleave', () => corners.classList.remove('hot-l', 'hot-r'));

  // scroll în carte = dai pagina
  let wheelAcc = 0, wheelLock = 0;
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const now = performance.now();
    if (now < wheelLock) return;
    wheelAcc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(wheelAcc) > 60) {
      go(wheelAcc > 0 ? 1 : -1);
      wheelAcc = 0;
      wheelLock = now + (reduce ? 250 : DUR - 150);
    }
  }, { passive: false });

  addEventListener('resize', layout);
  layout();

  // venind de pe raft, broșura se deschide singură
  if (location.hash === '#deschide') {
    history.replaceState(null, '', location.pathname);
    setTimeout(() => go(1), reduce ? 0 : 650);
  }
}
