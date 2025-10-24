const y = document.getElementById('y');
if (y) y.textContent = new Date().getFullYear();
const btn = document.querySelector('.menu-btn');
const menu = document.getElementById('mobileMenu');
btn?.addEventListener('click', () => { const open = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', String(open)); });
// 次のステップ：/data/wines.json を読み込み、wines.htmlの #winesGrid と wine.html を動的生成予定
