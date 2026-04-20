# 👾 Pixel Game - 復古闖關問答遊戲

這是一個利用 React + Vite 打造的 2000 年代街機像素風網頁遊戲。它不僅畫面具有濃厚的復古氛圍，還會動態產生關主圖片 (DiceBear API)，並藉由 Google Apps Script 作為後端，從 Google Sheets 隨機抽題並將玩家的闖關成績自動登記回傳。

---

## 🛠 後端建置：Google Sheets & Apps Script

要讓遊戲順利讀取題目與紀錄成績，請依照以下步驟建立您的資料庫：

### 步驟一：建立 Google Sheets 欄位
1. 建立一個全新的 Google 試算表。
2. 將下方第一個工作表改名為 **「題目」**，並在第一列設定以下 7 個欄位標題：
   - `題號`
   - `題目`
   - `A`
   - `B`
   - `C`
   - `D`
   - `解答` *(必須填入正確選項的英文字母，如 A、B、C 等)*
3. 建立第二個工作表（點選左下角「+」），改名為 **「回答」**，並在第一列設定以下 7 個欄位標題：
   - `ID`
   - `闖關次數`
   - `總分`
   - `最高分`
   - `第一次通關分數`
   - `花了幾次通關`
   - `最近遊玩時間`

### 步驟二：部署 Google Apps Script 
1. 在剛剛這份試算表中，點擊上方選單的 **「擴充功能」** -> **「Apps Script」**。
2. 清空原本的 `程式碼.gs`，將本專案目錄下的 `gas-backend.js` 檔案的所有內容，完整複製並貼上。
3. 點擊上方的「儲存」圖示（或使用快捷鍵 Ctrl+S / Cmd+S）。
4. 點擊右上角藍色按鈕 **「部署」** -> **「新增部署作業」**。
5. 點擊左側齒輪 ⚙️，選擇 **「網頁應用程式 (Web app)」**。
6. 將下方的「誰可以存取 (Who has access)」設定為 **「所有人 (Anyone)」**。
7. 點擊授權存取並登入您的 Google 帳號提供權限，最後您會得到一串 **「網頁應用程式網址 (Web app URL)」**，請務必將它複製儲存。

---

## 💻 前端開發環境設置

1. 將專案 Clone 到本地端後，於專案目錄下執行 `npm install`。
2. 複製一份 `.env.example` 並更名為 `.env`。
3. 編輯 `.env`，將其中的 `VITE_GOOGLE_APP_SCRIPT_URL` 改成您剛才複製的 GAS 網址。
4. 執行 `npm run dev` 啟動本地開發伺服器進行測試。

---

## 🚀 自動部署到 GitHub Pages

此專案已配置了 GitHub Actions (`.github/workflows/deploy.yml`) 來自動打包並部署到 GitHub Pages。

### 步驟 1: 調整 vite.config.js (已完成)
專案中的 `vite.config.js` 已加入了 `base: './'`，確保打包後的靜態檔案能夠正確在 Github Pages (非根目錄) 運行。

### 步驟 2: 設定 Repository Secrets
因為我們依賴環境變數（請參考 `.env.example`）來連接後端，所以在 GitHub 上必須設定這些參數：

1. 到你的 GitHub Repository 頁面，點擊上方的 **Settings** 標籤
2. 尋找左側選單，展開 **Secrets and variables** -> **Actions**
3. 點擊 **New repository secret**，將以下三個參數依序新增進去：
   - `VITE_GOOGLE_APP_SCRIPT_URL`：**(必填)** 填入你的 GAS 網址
   - `VITE_QUESTION_COUNT`：(選填，預設 10) 代表每次抽出的題目數
   - `VITE_PASS_THRESHOLD`：(選填，預設 6) 代表通過門檻分數

### 步驟 3: 開啟 GitHub Pages 權限
1. 在 **Settings** 頁面中，尋找左側選單的 **Pages**
2. 在 **Build and deployment** 區塊，將 Source 設定為 **GitHub Actions** 
*(這會讓 Github Pages 知道由 Action 部署上來的靜態檔案)*

### 步驟 4: 推送代碼
完成所有設定後，只要你將最新的修改推送到 `main` 或 `master` 分支，GitHub Action 就會自動觸發，編譯並把最新的版本部署上網！
