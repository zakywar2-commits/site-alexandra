// Broșura răsfoită: foile se întorc în jurul cotorului.
// Calculator: pagini duble („s” = câte foi sunt întoarse). Telefon: o pagină pe rând („k”).

const RATIO = 0.74; // lățime / înălțime pentru o pagină
const DUR = 900;

/** foșnet de hârtie, încet și de fiecare dată puțin altfel; pornește doar dacă îl alegi */
function paperSound() {
  let ctx: AudioContext | undefined;
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  return () => {
    ctx ??= new AudioContext();
    const len = rnd(0.3, 0.6);
    const peak = rnd(0.2, 0.6); // unde e foșnetul cel mai tare în timpul întoarcerii
    const grain = rnd(0.25, 0.6); // cât de „aspră” e hârtia
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
    const d = buf.getChannelData(0);
    // uneori foaia mai atinge o dată pagina la final
    const flick = Math.random() < 0.4 ? rnd(0.75, 0.92) : -1;
    for (let i = 0; i < d.length; i++) {
      const t = i / d.length;
      const shape = t < peak ? t / peak : (1 - t) / (1 - peak);
      let env = Math.pow(Math.max(0, shape), 1.4) * (1 - grain + grain * Math.random());
      if (flick > 0) env += 0.5 * Math.exp(-Math.pow((t - flick) * 28, 2));
      d[i] = (Math.random() * 2 - 1) * env;
    }
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rnd(0.85, 1.15);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    const f0 = rnd(1200, 2400);
    bp.frequency.setValueAtTime(f0, now);
    bp.frequency.linearRampToValueAtTime(f0 * rnd(1.4, 2.4), now + len);
    bp.Q.value = rnd(0.5, 1.1);
    const g = ctx.createGain();
    g.gain.value = rnd(0.06, 0.1);
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

  /** încarcă imaginile doar pentru foile din jurul celei deschise; restul așteaptă */
  const hydrate = (f: number) => {
    for (let i = Math.max(0, f - 2); i <= Math.min(L - 1, f + 2); i++) {
      leaves[i].querySelectorAll<HTMLImageElement | HTMLVideoElement>('[data-src]').forEach((el) => {
        if (el instanceof HTMLImageElement && el.dataset.srcset) el.srcset = el.dataset.srcset;
        el.src = el.dataset.src!;
        el.removeAttribute('data-src');
        if (el instanceof HTMLVideoElement) {
          if (el.dataset.poster) el.poster = el.dataset.poster;
          if (!reduce) { el.autoplay = true; el.play().catch(() => {}); }
        }
      });
    }
  };

  const flippedCount = () => (single ? Math.ceil(k / 2) : s);

  const render = (animate = true, turning = -1) => {
    const f = flippedCount();
    hydrate(f);
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
    book.dataset.s = String(f);
    // pe telefon se vede doar pagina curentă (cât se întoarce foaia, se văd amândouă fețele)
    const busy = turning >= 0 && animate && !reduce;
    faces.forEach((el) => (el.style.visibility = !single || busy || Number(el.dataset.page) === k ? '' : 'hidden'));
    const first = single ? k + 1 : Math.max(1, 2 * f);
    const last = single ? 0 : Math.min(N, 2 * f + 1);
    count.textContent = single || f === 0 || f === L ? `${f === L && !single ? N : first} / ${N}` : `${first}–${last} / ${N}`;
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
  margini(root, reduce);

  // venind de pe raft, broșura se deschide singură
  if (location.hash === '#deschide') {
    history.replaceState(null, '', location.pathname);
    setTimeout(() => go(1), reduce ? 0 : 650);
  }
}

/** poze blurate din proiecte pe marginile fundalului; câte una se schimbă la câteva secunde */
function margini(root: HTMLElement, reduce: boolean) {
  const box = root.querySelector<HTMLElement>('[data-margini]');
  if (!box) return;
  let pool: string[] = [];
  try { pool = JSON.parse(box.dataset.margini || '[]'); } catch {}
  if (pool.length < 2) return;
  const pick = (not: string[]) => {
    const free = pool.filter((p) => !not.includes(p));
    return (free.length ? free : pool)[Math.floor(Math.random() * (free.length || pool.length))];
  };
  type Tile = { el: HTMLElement; a: HTMLImageElement; b: HTMLImageElement; src: string };
  let tiles: Tile[] = [];
  const shown = () => tiles.map((t) => t.src);
  const show = (t: Tile, src: string) => {
    const next = t.a.classList.contains('on') ? t.b : t.a, prev = next === t.a ? t.b : t.a;
    t.src = src;
    next.onload = () => { next.classList.add('on'); prev.classList.remove('on'); };
    next.src = src;
  };
  const build = () => {
    box.replaceChildren();
    tiles = [];
    const W = box.clientWidth, H = box.clientHeight;
    const book = root.querySelector<HTMLElement>('[data-book]')!.getBoundingClientRect();
    const side = Math.max(0, (W - book.width) / 2);
    if (W < 760 || side < 90) return; // pe telefon cartea ocupă tot ecranul
    const per = H > 700 ? 3 : 2;
    for (const left of [true, false]) {
      for (let i = 0; i < per; i++) {
        const w = side * (0.8 + Math.random() * 0.5), h = w * (0.65 + Math.random() * 0.25);
        const x = left ? side * (Math.random() * 0.35) - w * 0.25 : W - side * (Math.random() * 0.35) - w * 0.75;
        const y = (H / per) * i + Math.random() * Math.max(0, H / per - h * 0.6) - h * 0.15;
        const el = document.createElement('div');
        el.className = 'tile';
        el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
        const a = document.createElement('img'), b = document.createElement('img');
        a.alt = b.alt = '';
        a.decoding = b.decoding = 'async';
        el.append(a, b);
        box.append(el);
        const t = { el, a, b, src: '' };
        tiles.push(t);
        show(t, pick(shown()));
      }
    }
  };
  build();
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = window.setTimeout(build, 400); });
  if (reduce) return;
  setInterval(() => {
    if (!tiles.length || document.hidden) return;
    const t = tiles[Math.floor(Math.random() * tiles.length)];
    show(t, pick(shown()));
  }, 3500);
}
