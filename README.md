Custom Video Chat with 3D avator, using Tencent Real-Time Communication and Open AI

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

In the server, rename the `sample.env` to `.env` and add your credentials of the API Key in Open AI.

**.env.local**

```.env
#!/bin/bash
OPENAI_API_KEY=XXXX
```

### 4. Install Rhubarb Lip Sync

In the server, install [Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync) and add the symbolic link path to `bin/rhubarb`.

### 5. Install and run the app

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

- [GPT-4 と Whisper を使って、AI の面接サービスを作ってみた](https://qiita.com/miya-start/items/a495887abaa6bead2b82)
