# wander-map-backend

[![badge](https://img.shields.io/badge/API%20Documentation-OK-brightgreen)](https://hackmd.io/@FPgogo/H1l8ogI-Y/https%3A%2F%2Fhackmd.io%2FGMJP6yXKQXCXAT4gDXsJPQ)
[![badge](https://img.shields.io/badge/Database%20Structure-OK-brightgreen)](https://dbdiagram.io/d/61386313825b5b0146f81dd5)

> _Wondering where to go? [Wandermap](https://wandermap.netlify.app)!_

## 專案簡介

提供戶外行程路線地點的檢視以及記錄心得行程的開放論壇平台。其中又以 [健行筆記](https://hiking.biji.co/) 與 [臺灣山林悠遊網](https://recreation.forest.gov.tw/) 的部份頁面作為功能與頁面的參考。再以地圖搜尋為特色，主打此功能增加差異性，改善使用者體驗。

提供一個開放的交流平台。使用者可以檢視閱覽路線及地點詳細的資訊，並且分享自己的行程記錄。

### Pages

[🛤Demo](https://wandermap.netlify.app)

[📙 WANDER MAP 說明書 | HackMD](https://hackmd.io/eD_eEfrGTy6BN5RsBHkjaw?view)

[📜 API 文件 | HackMD](https://hackmd.io/GMJP6yXKQXCXAT4gDXsJPQ?view)

[📊 資料庫關聯圖 | dbdiagram](https://dbdiagram.io/d/61386313825b5b0146f81dd5)

[📚 功能架構圖 | Figma](https://www.figma.com/file/DYDg1Xje14r4k0zkGqD0tC/WanderMap-%E5%8A%9F%E8%83%BD%E6%9E%B6%E6%A7%8B%E5%9C%96?node-id=0%3A1)

[📖 User flow | whimsical](https://whimsical.com/user-flow-KZZHcksrFpVsZERH85MLYc)

:octocat: [前端 repository](https://github.com/flow-open-money-come/wander-map-frontend)

:octocat: [後端 repository](https://github.com/flow-open-money-come/wander-map-backend)

## 主要功能

作為 wandermap 的後端專案。使用 express 作為 web 框架、MySQL 儲存資料。

### 使用者 API

使用者註冊登入後，會得到 member 身分。即有權限可以對心得、步道做按讚、收藏的動作。而管理員 (admin) 可以改動其他會員的權限、查看所有使用者資料。會員身分改為停權 (suspended) 後，能做的操作與未註冊者無異。

使用者底下有自己的 todo list，只有本人和管理員看得到、能做 CRUD。提供使用者在行前準備時，能有自己的清單可以清點裝備與提醒事項。

### 步道 API

只有管理員能新增、更新、刪除步道。一般使用者只能查詢、收藏步道、針對步道做評論。

資料來源為 [林務局開放資料](https://recreation.forest.gov.tw/Service/OpenData)。取得所有步道時，提供以海拔高度、步道長度、難度、地點、關鍵字篩選後的搜尋結果。也提供 cursor、offset/limit 兩種分頁功能，在回傳的 http header 帶有 x-total-count 表示此搜尋條件下的資料總筆數，使前端能自製分頁。

### 心得 API

管理員可以做所有操作。會員可以對自己的心得做所有 CRUD 操作，也能對其他心得按讚留言。

發布文章時可填寫 tags 欄位，在取得所有心得時可針對特定 tag 做搜尋。提供 cursor、offset/limit 兩種分頁功能，在回傳的 http header 帶有 x-total-count 表示此搜尋條件下的資料總筆數，使前端能自製分頁。

### JWT & Session/Cookie

登入成功時時產生 JWT token，方便前端 react app 取得使用者資料，減少與伺服器連線次數。過期時間較短，預設為 1 小時。

同時將產生 refresh token，以 cookie 形式儲存在瀏覽器。作為 JWT token 過期時，使用者不需再次登入即可取得新 JWT 的機制。有設定 httpOnly 等屬性以提高安全性。過期時間較長，預設為 1 個月。

### API 測試

> 測試連結：https://api.wandermap.tw/api/v1/test

利用 swagger 產生符合 OpenAPI 規範的文件，並建立測試頁面。方便開發者快速了解、測試 API。

### log

收到 request、發出 SQL query 與遇到錯誤時，將訊息寫入 `/logs` 路徑下，提供開發者除錯。

## 如何執行

### 環境建置

1. 把 `.env.example` 改名成 `.env`。打開檔案填入等號後面的值。
2. `$ npm install`：安裝所需套件。
3. `$ npm run build`：在 database 建立所需的 table，並帶入 tags、trails 兩張 table 的資料。

### 開發

* `$ npm run start`：運行應用程式。

* `$ npm run dev`：測試用，程式碼變動時會自動重啟應用程式。

### 部署

由於 refresh token 是以 `SameSite=None; Secure` 的 cookie 傳送，所以正式運行服務需要申請 SSL 憑證。

獲得 SSL 的未加密私鑰與憑證後，將檔案路徑設定在 `.env` 的 `SSL_KEY`、`SSL_CERTIFICATE`。之後 `$ npm run dev`、`$ npm run start` 都會自動啟用 https 伺服器。

#### 用 [certbot](https://certbot.eff.org/) 申請 SSL 憑證

步驟可參考 certbot [官網](https://certbot.eff.org/lets-encrypt/ubuntufocal-webproduct) 或 [Will 保哥的文章](https://blog.miniasp.com/post/2021/05/09/Create-SSL-TLS-certificates-from-LetsEncrypt-using-Certbot-2)。

大致上流程是用 snapd 套件管理系統安裝 certbot，用 certbot 向 [Let's Encrypt](https://letsencrypt.org/zh-tw/) 完成一系列確認網域所有權的挑戰，取得憑證並自動更新。

以 ubuntu 20.04 LTS 作為環境進行示範。

1. `$ sudo apt update && sudo apt install snapd`：安裝 snapd。
2. `$ sudo snap install core; sudo snap refresh core`：確認 snapd 是最新版本。
3. `$ sudo apt-get remove certbot`：移除舊有的 certbot。
4. `$ sudo snap install --classic certbot`：用 snap 安裝 certbot。
5. `$ sudo ln -s /snap/bin/certbot /usr/bin/certbot`：確保可以執行 `$ certbot` 指令。
6. `$ cd <path_to_project_directory>` 進入專案根目錄，創資料夾 `$ mkdir ./src/public`。
7. `$ npm run start` 或 `$ npm run dev` 把伺服器跑起來。
8. `$ sudo certbot certonly --webroot`：用 certbot 申請憑證。接下來有一系列問答，根據需求填入值，可參考 [Will 保哥的文章](https://blog.miniasp.com/post/2021/05/09/Create-SSL-TLS-certificates-from-LetsEncrypt-using-Certbot-2)。在 `Input the webroot for <www.your-domain.com.tw>:` 這個問題填入 `<path_to_project_directory>/src/public`。
9. 將金鑰與憑證的路徑填入 `.env` 檔案。範例為 `SSL_KEY=/etc/letsencrypt/live/<www.your-domain.com.tw>/privkey.pem`、`SSL_CERTIFICATE=/etc/letsencrypt/live/<www.your-domain.com.tw>/fullchain.pem`。
10. `$ sudo certbot renew --webroot --dry-run`，確認排程能夠自動更新憑證。

### Docker 部署 (coming soon)

功能尚在撰寫中。

#### 安裝 docker

#### 安裝 docker-compose

#### 執行

`$ docker build -t <image_name> .`：從 Dockerfile 建立 image。

`$ docker run -dp <host_port>:<container_port> --name <container_name> --env-file ./.env <image_name>`：從 image 建立 container，並讀入環境變數。

`$ docker-compose up -d`：由 docker-compose.yml 一次建立多個 container，並在背景執行。

`$ docker-compose down`：停止 docker-compose。

## 檔案架構

```shell
.
├── .env                               # 環境變數存放處
├── .env.example                       # 環境變數的範例
├── .git
├── .gitignore
├── .dockerignore                      # docker 部署時需要的檔案們（新功能即將上線，請耐心等候）
├── Dockerfile
├── docker-compose.dev.yml
├── docker-compose.yml
├── node_modules
├── package-lock.json
├── package.json
├── LICENSE
├── README.md
├── logs                               # 存放 log 的資料夾（app 會自動建立）
├── databaseStructure.sql              # 建立資料庫 table 的 sql
├── tagAndTrailData.sql                # tags 與 trails 兩張 table 資料的 sql
└── src                                # 程式碼在此 ฅ•ω•ฅ
    ├── constants
    │   ├── errors.js                  # 伺服器在特定狀況下回應的錯誤訊息
    │   └── location.js                # 地區與縣市的對照 map
    ├── controllers                    # 收到 http request 後的邏輯處理
    │   ├── articles.js
    │   ├── todos.js
    │   ├── trails.js
    │   └── users.js
    ├── db.js                          # 設定資料庫連線
    ├── index.js                       # application server 進入點
    ├── logger.js                      # logger 的設定
    ├── build.js                       # npm run build 建立資料庫架構及匯入資料
    ├── middlewares                    # 自訂的 middlewares
    │   ├── auth.js                    # 檢查 jwt 是否被竄改或過期，沒問題就放進 res.locals.tokenPayload 變數中
    │   ├── logRequest.js              # 把收到的請求寫入 log
    │   └── validators.js              # 驗證使用者輸入
    ├── models                         # 與資料庫互動的介面
    │   ├── articles.js
    │   ├── refreshTokens.js
    │   ├── todos.js
    │   ├── trails.js
    │   └── users.js
    ├── routers                        # 路由們，底下的資料夾可區分 api 版本
    │   ├── api                        # 第一版 api
    │   │   ├── articles.js
    │   │   ├── index.js               # router 進入點
    │   │   ├── schemas                # swagger.js 需要讀的資料們
    │   │   │   └── userSchema.yaml
    │   │   ├── swagger.js             # 讀 router 的註解與 ./schemas/*.yaml 產生符合 OpenAPI 規範的資料
    │   │   ├── trails.js
    │   │   └── users.js
    │   └── apiv2                      # 第二版 api placeholder
    │       └── index.js
    └── utils.js                       # 可重複利用的函式們
```

## 使用工具

|套件|敘述|
|:--:|:--:|
|[express](https://expressjs.com/)|Node.js 的 web 框架|
|[express-validator](https://www.npmjs.com/package/express-validator)|客製化驗證使用者輸入的 middleware|
|[cors](https://www.npmjs.com/package/cors)|處理 cross origin resource sharing 相關設定的 middleware|
|[cookie-parser](https://www.npmjs.com/package/cookie-parser)|解析 header 的 signed cookie 並放入 `req.signedCookies` 變數|
|[dotenv](https://www.npmjs.com/package/dotenv)|在 `.env` 設置環境變數供程式碼存取|
|[nodemon](https://nodemon.io/)|開發測試用套件，在程式碼改動時自動重啟應用程式|
|[swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc)|產生符合 [OpenAPI (Swagger) specification](https://swagger.io/specification/) 的文件|
|[swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)|用符合 OpenAPI 規範的文件產生 UI 介面，提供 API 測試|
|[winston](https://www.npmjs.com/package/winston)|提供客製化 logger|
|[winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file)|log rotation|
|[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)|產生及認證 JWT 合法性|
|[bcrypt](https://www.npmjs.com/package/bcrypt)|將密碼加鹽雜湊|
|[mysql2](https://www.npmjs.com/package/mysql2#history-and-why-mysql2)|連線操作資料庫|

|其他|敘述|
|:--:|:--:|
|AWS EC2|後端專案部署的平台|
|prettier|自動排版|
|pm2|daemon process manager |
|certbot|申請 SSL 憑證|
|~~docker~~|~~部署工具~~|

## Author

👤 [@cmtilo](https://github.com/cmtilo)
```markdown
 . ＿＿ ∧ ∧             
／＼   (*ﾟ∀ﾟ)＼      專案構想、wireframe 繪製、
＼／|￣￣∪ ∪￣|＼   前端（會員個人頁面（公開＆會員）、
 ＼|    Cmt   |     新增步道頁面、新增心得頁面
     ￣￣￣￣￣
```

👤 [@ddylanlin](https://github.com/ddylanlin)
```markdown
 . ＿＿ ∧ ∧             
／＼   (*ﾟ∀ﾟ)＼      專案雛形發想、wireframe 繪製、
＼／|￣￣∪ ∪￣|＼   前端（管理員後台、單一步道頁面）、
 ＼|   Dylan  |     後端（trail API、article API、部署）
     ￣￣￣￣￣
```

👤 [@torai55](https://github.com/torai55)
```markdown
 . ＿＿ ∧ ∧             
／＼   (*ﾟ∀ﾟ)＼      專案構想、資料庫規劃
＼／|￣￣∪ ∪￣|＼   後端（user API、article API、trail API、
 ＼|   Torai  |     權限控制、logger、API 文件、部署）
     ￣￣￣￣￣
```

👤 [@WenYHsieh](https://github.com/WenYHsieh)
```markdown
 . ＿＿ ∧ ∧             
／＼   (*ﾟ∀ﾟ)＼      專案構想、wireframe 繪製、
＼／|￣￣∪ ∪￣|＼   前端 （功能測試（google map, 圖片上傳, ckeditor 串接）、
 ＼|     Yu   |     首頁、全部步道頁面、會員系統、部署）
     ￣￣￣￣￣
```

👤 [@yymarlerr](https://github.com/yymarlerr)
```markdown
 . ＿＿ ∧ ∧             
／＼   (*ﾟ∀ﾟ)＼      專案雛形發想、專案構想、wireframe 繪製、
＼／|￣￣∪ ∪￣|＼   前端 （單一心得頁面、全部心得頁面）、
 ＼|    Ader  |     後端（article API）
     ￣￣￣￣￣
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
