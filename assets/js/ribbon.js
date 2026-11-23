/* ScrollRibbon: fita curva com texto que corre ao rolar, na seção .impact.
   Para remover: apague a tag <script src="assets/js/ribbon.js"> do index.html. */
(() => {
  const TEXT = 'SORRI(A) · CUIDADO · CARINHO · ';
  const section = document.querySelector('.impact');
  if (!section) return;
  const title = section.querySelector('.h2');
  const para = section.querySelector('.impact__head p');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  section.classList.add('has-ribbon'); // estilos em main.css (.has-ribbon), por causa do CSP

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'ribbon');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = `<defs><path id="ribbon-path"/></defs>
    <g class="ribbon__g"><use href="#ribbon-path" class="ribbon__band"/>
    <text class="ribbon__text"><textPath href="#ribbon-path"></textPath></text></g>`;
  section.prepend(svg);
  const path = svg.querySelector('#ribbon-path');
  const band = svg.querySelector('.ribbon__band');
  const text = svg.querySelector('text');
  const tp = svg.querySelector('textPath');
  const g = svg.querySelector('.ribbon__g');

  let w = 0, h = 0, pts = null, len = 0, unit = 0, desktop = true;
  let target = 0, cur = 0, raf = 0;

  const d = (k) => {
    const { S, M, E } = pts;
    const b = k * h * 0.035; // leve variação da curvatura com o scroll
    if (desktop) {
      return `M${S.x},${S.y} C${w * 0.42},${S.y - b} ${M.x},${h * 0.12 + b} ${M.x},${M.y} ` +
             `C${M.x},${h * 0.88 - b} ${w * 0.78},${E.y + b} ${E.x},${E.y}`;
    }
    // celular: título e texto empilhados, a fita cruza o vão entre eles em onda suave
    const a = 14 + b * 0.5;
    return `M${S.x},${M.y - a} C${w * 0.3},${M.y - a} ${w * 0.3},${M.y} ${M.x},${M.y} ` +
           `C${w * 0.7},${M.y} ${w * 0.7},${M.y + a} ${E.x},${M.y + a}`;
  };

  function layout() {
    const r = section.getBoundingClientRect();
    w = r.width; h = r.height;
    desktop = w >= 1024;
    // posições sem transform (a animação de entrada desloca os blocos)
    const box = (el) => {
      let x = 0, y = 0, n = el;
      while (n && n !== section) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { left: x, top: y, right: x + el.offsetWidth, bottom: y + el.offsetHeight };
    };
    const t = box(title), p = box(para);
    const stroke = Math.min(96, Math.max(56, w * 0.07)) * (desktop ? 1 : 0.82);
    const pad = stroke * 0.5 + 8;
    // ponto central: no meio do vão entre título e parágrafo
    const M = desktop
      ? { x: (t.right + p.left) / 2, y: (t.top + t.bottom) / 2 }
      : { x: w * 0.5, y: (t.bottom + p.top) / 2 };
    pts = { S: { x: -stroke, y: pad }, M, E: { x: w + stroke, y: h - pad } };
    band.style.strokeWidth = stroke;
    text.style.fontSize = `${stroke * 0.5}px`;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    path.setAttribute('d', d(0));
    len = path.getTotalLength();
    tp.textContent = TEXT;
    unit = text.getComputedTextLength() || 1;
    tp.textContent = TEXT.repeat(Math.ceil((len * 1.8) / unit) + 1);
    render(cur);
  }

  function render(k) {
    path.setAttribute('d', d(k));
    // texto anda meia volta da fita ao atravessar a seção
    tp.setAttribute('startOffset', -(unit + k * len * 0.5));
    g.style.transform = `rotate(${(k - 0.5) * 1.2}deg)`;
    g.style.transformOrigin = `${w / 2}px ${h / 2}px`;
  }

  function progress() {
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
  }

  function tick() {
    cur += (target - cur) * 0.1;
    render(cur);
    raf = Math.abs(target - cur) > 0.0005 ? requestAnimationFrame(tick) : 0;
  }

  function onScroll() {
    target = progress();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  const start = () => {
    cur = target = reduce ? 0.5 : progress();
    layout();
    if (reduce) return;
    window.addEventListener('scroll', onScroll, { passive: true });
  };
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
})();
