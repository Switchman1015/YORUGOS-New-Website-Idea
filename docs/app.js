// 年表示
const y = document.getElementById('y');
if (y) y.textContent = new Date().getFullYear();

// モバイルメニュー開閉
const btn = document.querySelector('.menu-btn');
const menu = document.getElementById('mobileMenu');
btn?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(open));
});

// 将来：/data/*.json で各枠を埋める予定
// fetch('/data/portfolio.json').then(r=>r.json()).then(renderPortfolio)
