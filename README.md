# wander-map-backend

## 簡介

這是 wander-map 的 api server。使用 express 作為 web 框架、MySQL 儲存資料。

提供驗證使用者註冊登入、心得與步道的 CRUD 等功能。

## 環境建置

1. 把 `.env.example` 改名成 `.env`。打開檔案填入等號後面的值。
2. `$ npm install`：安裝所需套件。
3. ~~`$ npm run build`：在 database 建立所需的 table。~~

## 開發

`$ npm run start`：運行應用程式。

`$ npm run dev`：測試用，程式碼變動時會自動重啟應用程式。

## 部署

由於 refresh token 是以 `SameSite=None; Secure` 的 cookie 傳送，所以正式運行服務需要申請 SSL 憑證。

獲得 SSL 的未加密私鑰與憑證後，將檔案路徑設定在 `.env` 的 `SSL_KEY`、`SSL_CERTIFICATE`。之後 `$ npm run dev`、`$ npm run start` 都會自動啟用 https 伺服器。

### 用 [certbot](https://certbot.eff.org/) 申請 SSL 憑證

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
8. `$ sudo certbot certonly --webroot`：用 certbot 申請憑證。接下來有一系列問答，根據需求填入值，可參考保哥文章。在 `Input the webroot for www.your-domain.com.tw:` 這個問題填入 `<path_to_project_directory>/src/public`。
9. 將金鑰與憑證的路徑填入 `.env` 檔案。範例為 `SSL_KEY=/etc/letsencrypt/live/www.your-domain.com.tw/privkey.pem`、`SSL_CERTIFICATE=/etc/letsencrypt/live/www.your-domain.com.tw/fullchain.pem`。
10. `$ sudo certbot renew --webroot --dry-run`，確認排程自動更新。

## Docker 部署(deprecate)

還沒寫先別用。

### 安裝 docker

### 安裝 docker-compose

### 執行

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
├── .dockerignore                      # docker 部署時需要的檔案們（久沒更新先別用）
├── Dockerfile
├── docker-compose.dev.yml
├── docker-compose.yml
├── node_modules
├── package-lock.json
├── package.json
├── LICENSE
├── README.md
├── logs
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

## 使用的函式庫

### [express](https://expressjs.com/)

Node.js 的 web 框架。

### [express-validator](https://www.npmjs.com/package/express-validator)

驗證使用者輸入的 middleware。

### [cors](https://www.npmjs.com/package/cors)

處理 cross origin resource sharing 相關設定的 middleware。

### [dotenv](https://www.npmjs.com/package/dotenv)

在 `.env` 設置環境變數並在程式碼中存取。

### [nodemon](https://nodemon.io/)

測試用套件，在程式碼改動時自動重啟應用程式。

### swagger

產生 API 測試頁面。

[swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc)：產生符合 [OpenAPI (Swagger) specification](https://swagger.io/specification/) 的文件。  
[swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)：用符合 OpenAPI 規範的文件產生 UI 介面。

### winston

[winston](https://www.npmjs.com/package/winston)： logger library  
[winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file)：log rotation

### [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)

產生及認證 JWT 合法性。

### [bcrypt](https://www.npmjs.com/package/bcrypt)

將密碼雜湊。

### [mysql2](https://www.npmjs.com/package/mysql2#history-and-why-mysql2)

連線操作資料庫。

## 相關連結

[WANDER MAP 說明書](https://hackmd.io/eD_eEfrGTy6BN5RsBHkjaw?view)

[API 文件](https://hackmd.io/GMJP6yXKQXCXAT4gDXsJPQ?view)

[前端 GitHub](https://github.com/flow-open-money-come/wander-map-frontend)

[後端 GitHub](https://github.com/flow-open-money-come/wander-map-backend)

## License

[MIT](https://choosealicense.com/licenses/mit/)
