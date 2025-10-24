// app.js v8
(function(){
  if (window.__YORUGOS_APP_INITIALIZED__) return;
  window.__YORUGOS_APP_INITIALIZED__ = true;

  // 年表示
  const yearEl = document.getElementById('y');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // モバイルメニュー
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('mobileMenu');
  btn?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  // Util
  const getParam = (name) => new URLSearchParams(location.search).get(name);
  const fetchJSON = async (path) => {
    const tryPaths = [path, path.startsWith('./') ? path.replace('./', '/') : path];
    for (const p of tryPaths){
      try{
        const r = await fetch(p, {cache:'no-store'});
        if (r.ok) return await r.json();
      }catch(e){/* next */}
    }
    console.warn('JSON読み込みエラー:', path);
    return null;
  };
  const kanaNormalize = (s) => s
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0)-0xFEE0)) // 全角→半角
    .replace(/[\u30A1-\u30F6]/g, ch => String.fromCharCode(ch.charCodeAt(0)-0x60))     // カナ→かな
    .toLowerCase();

  // ---------- 一覧の動的描画 + 検索 ----------
  const renderProductsList = async () => {
    const grid = document.getElementById('productsGrid');
    if(!grid) return;

    const data = await fetchJSON('./data/products.json');
    if(!data){ grid.innerHTML = '<p class="muted">データを読み込めませんでした。</p>'; return; }

    const all = data.items || [];
    const qEl = document.getElementById('q');
    const catEl = document.getElementById('cat');
    const ctyEl = document.getElementById('cty');
    const styEl = document.getElementById('sty');
    const prcEl = document.getElementById('prc');
    const resultsCount = document.getElementById('resultsCount');
    const resetBtn = document.getElementById('resetBtn');

    const matchText = (item, q) => {
      if (!q) return true;
      const hay = [
        item.name, item.producer, item.country, item.region, item.style,
        item.vintage_or_spec, (item.variety_or_ingredient||[]).join(' ')
      ].filter(Boolean).join(' ');
      return kanaNormalize(hay).includes(kanaNormalize(q));
    };
    const matchCat = (item, v) => v==='すべて' || !v
      ? true
      : (v==='ワイン' ? item.category==='wine'
        : v==='食材' ? item.category==='food'
        : item.category==='other');
    const matchCty = (item, v) => v==='すべて' || !v ? true : item.country===v;
    const matchSty = (item, v) => v==='すべて' || !v ? true : (item.style===v || (v==='—' && !item.style));
    const matchPrc = (item, v) => {
      if (v==='すべて' || !v) return true;
      // デモ：price_range文字列の前方一致で簡易判定
      return (item.price_range||'').startsWith(v.replace('〜',''));
    };

    const draw = (list) => {
      if (resultsCount) resultsCount.textContent = `${list.length}件`;
      if (list.length === 0){
        grid.innerHTML = '<p class="muted">条件に合う商品が見つかりませんでした。</p>';
        return;
      }
      grid.innerHTML = list.map(p => {
        const img = (p.images && p.images[0]) || '';
        const cat = p.category === 'food' ? '食材' : (p.category === 'other' ? 'その他' : 'ワイン');
        const sub = [p.producer, p.region, p.style || p.vintage_or_spec].filter(Boolean).join('｜');
        return `
          <article class="card span-4" role="article">
            <a href="./product.html?id=${encodeURIComponent(p.id)}" style="display:block">
              <div class="skeleton" style="aspect-ratio:4/3; border-radius:10px; overflow:hidden">
                ${img ? `<img src="${img}" alt="${p.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : ''}
              </div>
              <div style="margin-top:10px">
                <div class="muted" style="font-size:12px">${cat}</div>
                <h3 class="balance" style="margin:6px 0 2px; font-size:16px; font-weight:700">${p.name}</h3>
                <p class="muted pretty" style="margin:0; font-size:13px">${sub}</p>
              </div>
            </a>
          </article>`;
      }).join('');
    };

    const apply = () => {
      const q = qEl?.value?.trim() || '';
      const cat = catEl?.value || 'すべて';
      const cty = ctyEl?.value || 'すべて';
      const sty = styEl?.value || 'すべて';
      const prc = prcEl?.value || 'すべて';
      const filtered = all.filter(it =>
        matchText(it, q) && matchCat(it, cat) && matchCty(it, cty) && matchSty(it, sty) && matchPrc(it, prc)
      );
      draw(filtered);
    };

    // イベント（入力で即時反映・検索ボタン不要）
    qEl?.addEventListener('input', debounce(apply, 160));
    [catEl, ctyEl, styEl, prcEl].forEach(el => el?.addEventListener('change', apply));
    resetBtn?.addEventListener('click', () => {
      if (qEl) qEl.value = '';
      if (catEl) catEl.value = 'すべて';
      if (ctyEl) ctyEl.value = 'すべて';
      if (styEl) styEl.value = 'すべて';
      if (prcEl) prcEl.value = 'すべて';
      apply();
    });

    // 初回描画
    draw(all);
  };

  // ---------- 新着3件（index.html） ----------
  const renderNewArrivals = async () => {
    const grid = document.getElementById('newArrivalsGrid');
    if(!grid) return;
    const data = await fetchJSON('./data/products.json');
    if(!data){ grid.innerHTML = '<p class="muted">データを読み込めませんでした。</p>'; return; }
    const items = (data.items||[]).slice(-3).reverse(); // 最後に追加された3件を想定
    grid.innerHTML = items.map(p => {
      const img = (p.images && p.images[0]) || '';
      const sub = [p.producer, p.region].filter(Boolean).join('｜');
      return `
        <article class="card span-4" role="article">
          <a href="./product.html?id=${encodeURIComponent(p.id)}" style="display:block">
            <div class="skeleton" style="aspect-ratio:4/3; border-radius:10px; overflow:hidden">
              ${img ? `<img src="${img}" alt="${p.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : ''}
            </div>
            <div style="margin-top:10px">
              <h3 class="balance" style="margin:6px 0 2px; font-size:16px; font-weight:700">${p.name}</h3>
              <p class="muted pretty" style="margin:0; font-size:13px">${sub}</p>
            </div>
          </a>
        </article>`;
    }).join('');
  };

  // ---------- 詳細 ----------
  const renderProductDetail = async () => {
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
    if(img){ imgEl.src = img; imgEl.alt = item.name; } else { fig.classList.add('skeleton'); }

    // テキスト
    titleEl.textContent = item.name;
    const cat = item.category === 'food' ? '食材' : (item.category === 'other' ? 'その他' : 'ワイン');
    const metaBits = [cat, item.producer, item.country, item.region, (item.variety_or_ingredient||[]).join('・'), item.style, item.vintage_or_spec, item.volume_or_weight].filter(Boolean);
    const metaEl = document.getElementById('prodMeta'); if (metaEl) metaEl.textContent = metaBits.join('｜');
    const notesEl = document.getElementById('prodNotes'); if (notesEl) notesEl.textContent = item.notes || '';
    const pairing = (item.pairing_or_usage||[]).join('、 ');
    const pairingEl = document.getElementById('prodPairing'); if (pairingEl) pairingEl.textContent = pairing ? `ペアリング/使い方：${pairing}` : '';
  };

  // debounce
  function debounce(fn, wait){
    let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); };
  }

  // init
  window.addEventListener('DOMContentLoaded', () => {
    renderProductsList();
    renderProductDetail();
    renderNewArrivals();
  });
})();
