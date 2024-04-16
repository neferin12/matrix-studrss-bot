# Matrix Studrss Bot

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-green.svg"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-%23007ACC.svg?logo=typescript&logoColor=white"></a>
  <a href="https://github.com/neferin12/matrix-studrss-bot/actions/workflows/node.js.yml"><img src="https://github.com/neferin12/matrix-studrss-bot/actions/workflows/node.js.yml/badge.svg?branch=main"></a>
  <a href="https://github.com/herzhenr/spic-server/releases"><img src="https://img.shields.io/github/release/neferin12/matrix-studrss-bot.svg?logo=github&color=blue"></a>
</p>

A bot that reads news from the Studon RSS feed and sends them to a Matrix chat.

# Usage
The following commands are available for the Bot:
- `help`: Shows a help dialog with the available commands
- `status`: Gives information about the current status
- `set URL_OF_STUDON_RSS_FEED`: Sets the URL and activates bridging
- `reset`: Deletes the URL and deactivates bridging

# Installation

The environment variables `ACCESS_TOKEN` and `HOMESERVER_URL` must be set.

- `HOMESERVER_URL`: The url of the matrix server
- `ACCESS_TOKEN`: The access token of the matrix user which the bot should use. Do not use the access token of your account as this would lead to the bot replying in your name to every message you recieve!

## Docker

The easiest way to get started is by spinning up the docker container which can be obtained from the GitHub Container Registry. Then the following command can be run:

```bash
docker run --rm -it matrixstudrssbot:latest \
-e ACCESS_TOKEN='token' \
-e HOMESERVER_URL='url'
```

Alternatively the following [`docker-compose.yaml`](./docker-compose.yaml) can be used:

```yml
---
version: "3"
services:
  matrix-studrss-bot:
    image: ghcr.io/neferin12/matrix-studrss-bot:latest
    container_name: matrixstudrssbot
    env_file:
      - .env
    environment:
      HOMESERVER_URL: URL
      ACCESS_TOKEN: ${ACCESS_TOKEN}
    restart: unless-stopped
```
corresponding `.env` file:
```
ACCESS_TOKEN=SECRET
```



## Local

`TypeScript` and `pnpm` as the package manager must be installed. The server can be started with:

```bash
pnpm install
pnpm run build
```

# License
MIT License

```
Copyright (c) 2023

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```