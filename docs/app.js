const y = document.getElementById('y');
if (y) y.textContent = new Date().getFullYear();
const btn = document.querySelector('.menu-btn');
const menu = document.getElementById('mobileMenu');
btn?.addEventListener('click', () => { const open = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', String(open)); });
// 次のステップ：/data/products.json を読み込み、products.html の #productsGrid と product.html を動的生成予定
