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

// 将来ここに：
// - fetch('/data/regions.json') で #travel のカードを描画
// - 画像の遅延読み込み/最適化
// - ルーティングや診断ウィジェットの読込 などを追加予定