/* Marca o <html> antes da pintura para as animações de entrada não piscarem */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  d.classList.add('js-anim');
  // Se o GSAP não carregar, mostra tudo
  setTimeout(function () { if (typeof window.gsap === 'undefined') d.classList.remove('js-anim'); }, 3000);
})();
