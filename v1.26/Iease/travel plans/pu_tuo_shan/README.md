# 普陀山 4 天 3 夜 朝聖之旅 網站

這是一個純前端靜態網頁專案，打開 `index.html` 即可瀏覽完整行程內容。

## 📁 文件結構

- `index.html`：主頁面
- `style.css`：樣式表
- `main.js`：互動功能
- `README.md`：專案說明

## ▶️ 使用方式

### 本機直接開啟

直接用瀏覽器開啟 `index.html` 即可。

### 部署到靜態網站平台

可直接上傳到 Cloudflare Pages、Netlify、GitHub Pages 等靜態網站服務。

## ✅ 本次修正

已修正 `index.html` 內錯誤的資源引用路徑：

- `css/style.css` → `style.css`
- `js/main.js` → `main.js`

修正後專案可在目前目錄結構下正常載入樣式與腳本。

## ⚠️ 備註

`main.js` 內包含 `downloadPDF()` 功能，但若要真正下載 PDF，仍需另外在頁面中引入 `html2pdf.js`。
