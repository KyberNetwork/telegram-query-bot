# telegram-query-bot

Telegram bot automating Kyber queries. Uses the [Telegraf](https://github.com/telegraf/telegraf) Telegram bot framework.

Bots are special [Telegram](https://telegram.org) accounts designed to handle messages automatically.
Users can interact with bots by sending them command messages in private or group chats.

### Installation

```
$ npm install
```

### Setup

1) Create an .env file in the root directory, containing your Infura and / or Alchemy API keys and Telegram bot token. Note: Omit the bot prefix in the Telegram token.

e.g.
```
INFURA_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ALCHEMY_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_TOKEN=xxxxxxxxx:xxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxx
```

### Running

To run in development mode (restarts at every file change)
```
npm run dev
```

To run in production mode
```
npm run start
```
