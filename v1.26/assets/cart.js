// Simple localStorage cart (demo)
const STORAGE_CART = "guan_cart";

function loadCart(){
  try { return JSON.parse(localStorage.getItem(STORAGE_CART) || "[]"); } catch { return []; }
}
function saveCart(items){
  localStorage.setItem(STORAGE_CART, JSON.stringify(items));
  window.dispatchEvent(new Event("guan_cart_updated"));
}
function cartCount(){
  return loadCart().reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
}
function formatMoney(n){
  try { return new Intl.NumberFormat("zh-HK", { style:"currency", currency:"HKD" }).format(n); }
  catch { return "$" + (Number(n)||0).toFixed(2); }
}

function ensureCartItem(item){
  const items = loadCart();
  const idx = items.findIndex(x => x.id === item.id);
  if (idx >= 0){
    items[idx].qty = (Number(items[idx].qty)||0) + (Number(item.qty)||1);
  } else {
    items.push({ id: item.id, name: item.name, price: Number(item.price)||0, qty: Number(item.qty)||1 });
  }
  saveCart(items);
}

function updateTopNav(){
  const countEl = document.getElementById("cartCount");
  if (countEl) countEl.textContent = String(cartCount());

  const memberEl = document.getElementById("navMember");
  // auth.js defines loadSession()
  try{
    const s = (typeof loadSession === "function") ? loadSession() : null;
    if (memberEl){
      const inAuth = location.pathname.includes("/auth/");
      const inCart = location.pathname.includes("/cart/");
      const inProduct = location.pathname.includes("/product/");
      // base path for pages under /product/ or /cart/ should go up one level
      const base = inAuth ? "." : ((inCart || inProduct) ? ".." : ".");
      const dashboardHref = inAuth ? "./dashboard.html" : `${base}/auth/dashboard.html`;
      const loginHref = inAuth ? "./login.html" : `${base}/auth/login.html`;
      if (s?.userId){
        memberEl.textContent = "會員中心";
        memberEl.href = dashboardHref;
      } else {
        memberEl.textContent = "會員登入";
        memberEl.href = loginHref;
      }
    }
  } catch {}
}

function bindCartPage(){
  const mount = document.getElementById("cartApp");
  if (!mount) return;

  const render = () => {
    const items = loadCart();
    const total = items.reduce((s,it)=> s + (Number(it.price)||0)*(Number(it.qty)||0), 0);

    if (!items.length){
      mount.innerHTML = `
        <div class="w-full border border-black/[.06] rounded-[14px] p-4 bg-[#F7F7F7] text-left">
          <div class="text-[#131D29] font-bold text-base">購物車目前是空的</div>
          <div class="text-[#767C83] text-sm mt-1">你可以先用「加入測試商品」驗證流程，之後再接上真正的商品/結帳。</div>
        </div>
      `;
      document.getElementById("cartTotal").textContent = formatMoney(0);
      return;
    }

    const rows = items.map(it => `
      <div class="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 border-b border-black/[.06] py-3">
        <div class="min-w-0 text-left">
          <div class="font-semibold text-[#131D29] truncate">${it.name}</div>
          <div class="text-xs text-[#767C83] mt-0.5">${formatMoney(it.price)} / 件</div>
        </div>
        <div class="flex items-center gap-2 flex-wrap justify-end">
          <button data-act="dec" data-id="${it.id}" class="w-9 h-9 rounded-full border border-black/[.12] hover:bg-[#F7F7F7]">−</button>
          <div class="w-8 text-center font-semibold text-[#131D29]">${it.qty}</div>
          <button data-act="inc" data-id="${it.id}" class="w-9 h-9 rounded-full border border-black/[.12] hover:bg-[#F7F7F7]">+</button>
          <button data-act="rm" data-id="${it.id}" class="ml-1 px-3 h-9 rounded-full border border-black/[.12] hover:bg-[#F7F7F7] text-sm">移除</button>
        </div>
      </div>
    `).join("");

    mount.innerHTML = `
      <div class="w-full border border-black/[.06] rounded-[14px] p-4 bg-white text-left">
        ${rows}
      </div>
    `;

    document.getElementById("cartTotal").textContent = formatMoney(total);

    mount.querySelectorAll("button[data-act]").forEach(btn => {
      btn.addEventListener("click", () => {
        const act = btn.getAttribute("data-act");
        const id = btn.getAttribute("data-id");
        const items2 = loadCart();
        const i = items2.findIndex(x => x.id === id);
        if (i < 0) return;

        if (act === "inc") items2[i].qty = (Number(items2[i].qty)||0) + 1;
        if (act === "dec") items2[i].qty = Math.max(1, (Number(items2[i].qty)||1) - 1);
        if (act === "rm") items2.splice(i, 1);

        saveCart(items2);
        render();
        updateTopNav();
      });
    });
  };

  // buttons
  document.getElementById("btnAddTest")?.addEventListener("click", () => {
    ensureCartItem({ id: "test-tea-1", name: "武夷山・岩茶・百瑞香（測試商品）", price: 610, qty: 1 });
    render(); updateTopNav();
  });
  document.getElementById("btnClearCart")?.addEventListener("click", () => {
    saveCart([]); render(); updateTopNav();
  });

  window.addEventListener("guan_cart_updated", () => { render(); updateTopNav(); });

  render();
}

document.addEventListener("DOMContentLoaded", () => {
  updateTopNav();
  bindCartPage();
});
window.addEventListener("storage", updateTopNav);
window.addEventListener("guan_cart_updated", updateTopNav);
