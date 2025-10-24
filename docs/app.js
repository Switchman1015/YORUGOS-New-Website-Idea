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

// 共通: クエリ取得
function getParam(name){ return new URLSearchParams(location.search).get(name); }
async function fetchJSON(path){
  try{ const r = await fetch(path, {cache:'no-store'}); if(!r.ok) throw new Error(r.statusText); return await r.json(); }
  catch(e){ console.warn('JSON読み込みエラー', e); return null; }
}

// 一覧の動的描画（products.html）
async function renderProductsList(){
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  const data = await fetchJSON('./data/products.json');
  if(!data){ grid.innerHTML = '<p class="muted">データを読み込めませんでした。</p>'; return; }
  const items = data.items || [];
  if(items.length === 0){ grid.innerHTML = '<p class="muted">商品がありません。</p>'; return; }
  grid.innerHTML = items.map(p => {
    const img = (p.images && p.images[0]) || '';
    const cat = p.category === 'food' ? '食材' : (p.category === 'other' ? 'その他' : 'ワイン');
    const sub = [p.producer, p.region, p.style || p.vintage_or_spec].filter(Boolean).join('｜');
    return `
      <article class="card span-4" role="article">
        <a href="./product.html?id=${encodeURIComponent(p.id)}" style="display:block">
          <div class="skeleton" style="aspect-ratio:4/3; border-radius:10px; overflow:hidden">${img ? `<img src="${img}" alt="${p.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : ''}</div>
          <div style="margin-top:10px">
            <div class="muted" style="font-size:12px">${cat}</div>
            <h3 class="balance" style="margin:6px 0 2px; font-size:16px; font-weight:700">${p.name}</h3>
            <p class="muted pretty" style="margin:0; font-size:13px">${sub}</p>
          </div>
        </a>
      </article>`;
  }).join('');
}

// 詳細の動的描画（product.html）
async function renderProductDetail(){
  const titleEl = document.getElementById('prodName');
  if(!titleEl) return;
  const id = getParam('id');
  const data = await fetchJSON('./data/products.json');
  if(!data){ titleEl.textContent = '商品データを読み込めませんでした'; return; }
  const item = (data.items || []).find(i => i.id === id) || (data.items || [])[0];
  if(!item){ titleEl.textContent = '商品が見つかりませんでした'; return; }

  // 画像
  const imgEl = document.getElementById('prodImage');
  const fig = document.getElementById('prodFigure');
  const img = (item.images && item.images[0]) || '';
  if(img){ imgEl.src = img; imgEl.alt = item.name; }
  else{ fig.classList.add('skeleton'); }

  // テキスト
  titleEl.textContent = item.name;
  const cat = item.category === 'food' ? '食材' : (item.category === 'other' ? 'その他' : 'ワイン');
  const metaBits = [cat, item.producer, item.country, item.region, (item.variety_or_ingredient||[]).join('・'), item.style, item.vintage_or_spec, item.volume_or_weight].filter(Boolean);
  document.getElementById('prodMeta').textContent = metaBits.join('｜');
  document.getElementById('prodNotes').textContent = item.notes || '';
  const pairing = (item.pairing_or_usage||[]).join('、 ');
  document.getElementById('prodPairing').textContent = pairing ? `ペアリング/使い方：${pairing}` : '';
}

// 初期化
window.addEventListener('DOMContentLoaded', () => {
  renderProductsList();
  renderProductDetail();
});
const y = document.getElementById('y');
if (y) y.textContent = new Date().getFullYear();
const btn = document.querySelector('.menu-btn');
const menu = document.getElementById('mobileMenu');
btn?.addEventListener('click', () => { const open = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', String(open)); });
// 次のステップ：/data/products.json を読み込み、products.html の #productsGrid と product.html を動的生成予定
