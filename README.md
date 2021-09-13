# wander-map-backend

## 簡介

這是 wander-map-backend 後端，採用 express 開發。

## 環境建置

1. 把 `.env.example` 改名成 `.env`，填入等號後面的值
2. `npm install`：安裝所需套件。
3. ~~`npm run build`：把資料鍵入資料庫~~

## 開發

`npm run start`：把專案跑起來

`npm run dev`：測試用

## 專案架構

```shell
.
├── LICENSE
├── README.md
├── node_modules
├── .env                              # 環境變數存放處
├── .gitignore
├── package-lock.json
├── package.json
└── src                                # 程式碼在此 ฅ•ω•ฅ
    ├── controllers
    ├── index.js                       # application server 進入點
    ├── middlewares                    # 自訂的 middlewares
    ├── routers                        # 路由們，底下的資料夾可區分 api 版本
    │   ├── api                        # 第一版 api
    │   │   ├── articleRouter.js
    │   │   ├── index.js               # router 進入點
    │   │   ├── schemas
    │   │   │   └── userSchema.yaml
    │   │   ├── swagger.js
    │   │   ├── trailRouter.js
    │   │   └── userRouter.js
    │   └── apiv2                      # 第二版 api placeholder
    │       └── index.js
    └── utils.js                       # 可重複利用的函式們
```

## 使用的套件庫

### [express](https://expressjs.com/)

Node.js 的伺服器框架。

### [dotenv](https://www.npmjs.com/package/dotenv)

在 `.env` 設置環境變數並在程式碼中存取。

### [nodemon](https://nodemon.io/)

測試用套件，在程式碼改動時自動重啟應用程式。

### swagger

產生 API 測試頁面。

[swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc)：產生符合 [OpenAPI (Swagger) specification](https://swagger.io/specification/) 的文件。
[swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)：用符合 OpenAPI 規範的文件產生 UI 介面。

[WANDER MAP 說明書](https://hackmd.io/eD_eEfrGTy6BN5RsBHkjaw?view)

[API 文件](https://hackmd.io/GMJP6yXKQXCXAT4gDXsJPQ?view)

[前端 GitHub](https://github.com/flow-open-money-come/wander-map-frontend)

[後端 GitHub](https://github.com/flow-open-money-come/wander-map-backend)

## License

[MIT](https://choosealicense.com/licenses/mit/)
