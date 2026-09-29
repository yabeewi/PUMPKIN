# Halloween Pumpkin Hunt — 離線版（10 顆特色南瓜）

純前端版本。學生 iPad 不需要安裝 App、不需要登入、不需要後端或資料庫。

## 本版修正

1. **學生端 3D 南瓜不再依賴 Three.js CDN**：改為專案內建 WebGL 繪製，現場斷網仍可顯示。
2. **新增 Service Worker 離線快取**：活動開始前有網路時開一次首頁，等「✅ 離線模式準備完成」即可。
3. **南瓜網址更耐錯**：`pumpkin.html` 現在支援 `code`、`p`、`id`、`pumpkin` 四種參數；數字 ID 也可作為相容格式。
4. **修正收藏判定**：同一顆南瓜重複掃描不會被誤判成新收藏。
5. **新增 `offline-test.html`**：老師可一次看到並逐一測試 10 顆南瓜網址。
6. **QR 工具產生雙參數網址**：正式 QR 會包含 `code` + `p`，降低單一參數解析失敗的風險。

## 預期輸入

- 學生：使用 iPad 相機掃描活動 QR Code。
- 正式 QR 例如：
  `https://你的網址/pumpkin.html?code=moon-a7f3&p=moon-a7f3`

## 預期輸出

- 掃描有效 QR 後顯示可左右拖曳旋轉的 3D 南瓜。
- 每顆南瓜有不同顏色、名字、配飾與個性。
- 自動加入 Safari `localStorage`。
- 同一顆 QR 重複掃描不重複計數。
- 10 顆全部找到後顯示完成畫面。

## 離線使用流程（重要）

### 活動開始前

1. 每台 iPad 先連上 Wi‑Fi／網路。
2. 用 Safari 開啟正式 HTTPS 遊戲首頁。
3. 等首頁顯示：**✅ 離線模式準備完成**。
4. 開 `offline-test.html` 測試至少 1～2 顆南瓜。
5. 關閉 Wi‑Fi，再重新掃測試 QR。
6. 仍能顯示 3D 南瓜，即代表該 iPad 已準備完成。

### 活動進行中

- 老師和學生不需要連在同一個網路。
- 學生所在區域即使沒有 Internet，也可以掃已部署網域的 QR。
- 前提是該台 iPad 在活動前已成功完成一次離線預載。

## HTTPS 限制

Service Worker 正式使用需要 **HTTPS**。

- 電腦測試 `http://localhost:8000` 可以使用 Service Worker。
- iPad 不建議用 `http://192.168.x.x:8000` 測真正離線模式，因為一般區網 HTTP 不屬於安全來源。
- 正式活動請部署到 GitHub Pages、Netlify、Cloudflare Pages 等 HTTPS 靜態網站。

## 10 顆目前有效 code

1. `moon-a7f3`
2. `mist-b29d`
3. `wink-c41h`
4. `crown-d52k`
5. `glow-e63m`
6. `bat-f74q`
7. `bow-g85u`
8. `sleep-h96x`
9. `rune-i07z`
10. `halo-j18v`

## 測試網址

啟動本機伺服器：

```bash
python -m http.server 8000
```

首頁：

```text
http://localhost:8000/
```

老師網址測試頁：

```text
http://localhost:8000/offline-test.html
```

第一顆南瓜：

```text
http://localhost:8000/pumpkin.html?code=moon-a7f3&p=moon-a7f3
```

## 教師 QR 工具

`qr-tool.html` 仍是活動前製作用工具。它使用 QRCode.js CDN，因此**產生／列印 QR 時需要網路**；QR 印好後，活動現場不需要再開此頁。
