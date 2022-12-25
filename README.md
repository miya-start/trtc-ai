# Custom Video Chat with React and TRTC SDK

## How to start

### 1. Before starting the app

Register and create a [Tencent Cloud account](https://www.tencentcloud.com/)

### 2. npm workspaces

The packages are divided between the front and server side. The front side is in the `packages/client` directory and the server side is in the `packages/back` directory.

### 3. Add the credentials

In the front, rename the `sample.env` to `.env` and add your credentials of the application in Tencent Real-Time Communication.

**.env**

```.env
VITE_SDKAPPID=XXXX
VITE_SECRETKEY=XXXX
```

In the server, rename the `sample.env` to `.env` and add your credentials of the API Key in Tencent Cloud.

**.env**

```.env
TENCENT_SECRET_ID=XXXX
TENCENT_SECRET_KEY=XXXX
```

### 3. Install and run the app

For the development, on both the front and server side:

```
$ npm install
$ npm run dev
```

For the build, on the top directory:

```
$ npm run build
```

## About this code

I wrote an article about this application in Japanese.

- [ビデオ通話に、リアルタイムで翻訳字幕をつけてみた](https://qiita.com/miya-start/items/cf64254276cb05f7d009)
