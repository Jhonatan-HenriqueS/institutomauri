# LP — Instituto Mauri · Odontologia Especializada

Site estático (HTML + CSS + JS). A pasta `site/` já é o que vai para o ar. Sem build obrigatório.

## Antes de publicar
1. **Domínio**: trocar `{{DOMINIO}}` (sem `https://`) em `index.html`, `politica-de-privacidade.html`, `termos-de-uso.html`, `404.html`, `robots.txt` e `sitemap.xml`.
   ```bash
   cd ~/HING/InstitutoMauri/site
   grep -rl "{{DOMINIO}}" . | xargs sed -i 's/{{DOMINIO}}/institutomauri.com.br/g'
   ```
2. **GA4 (opcional)**: colocar o ID no atributo `data-ga` da tag `<html>` das páginas, ex.: `<html lang="pt-BR" data-ga="G-XXXXXXX">`.
   Sem ID, o aviso de cookies não aparece e nada do Google Analytics carrega. Evento de conversão: `whatsapp_click` (parâmetro `cta_local`).

## Teste — GitHub Pages
Repositório `institutomauri`, branch `main`, pasta raiz = conteúdo de `site/`. O arquivo `.nojekyll` já está incluso.

## Produção — Cloudflare Pages
Projeto ligado ao repositório, sem comando de build, diretório de saída `/` (ou `site`). O `_headers` aplica CSP, HSTS e cache.

## Testar local
```bash
cd ~/HING/InstitutoMauri/site && python3 -m http.server 8093
```

## Estrutura
- `assets/css/main.css` — tokens da paleta (fundo #F5F3EE, navy, azul, dourado) e todas as seções
- `assets/js/main.js` — Lenis (scroll suave) + GSAP/ScrollTrigger (entradas), carrossel de fotos, avaliações, FAQ, cookies + GA4
- `assets/js/vendor/` — GSAP 3.13.0, ScrollTrigger, Lenis 1.3.11 (locais, sem CDN)
- `assets/img/` — WebP + AVIF responsivos; vídeo do Sobre em WebM + MP4
- `../tools/` — scripts que geram imagens (`process.mjs`), logo (`vectorize.mjs`) e ícones (`icons.mjs`)

## Seções e referências
1. Capa — seed.com (Dr. Marcelo no lugar do produto)
2. Frase de impacto — seed.com (faixa de benefícios)
3. Sobre — seed.com (card de vidro sobre vídeo)
4. Tratamentos — seed.com (grade de produtos): 5 principais + secundários
5. Fotos dos dentes — gsap.com/showcase
6. Avaliações — padrão HING (LP Anaru), avaliações reais do Google
7. FAQ — woday.app (mascote trocado pela logo)
8. Endereço — padrão HING (LP Anaru), mapa já aberto
9. CTA final
10. Rodapé — woday.app (mascote trocado por "MAURI" com a paleta da logo)
