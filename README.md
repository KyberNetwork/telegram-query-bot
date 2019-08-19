# telegram-query-bot

Telegram bot automating Kyber queries. Uses the [Telegraf](https://github.com/telegraf/telegraf) Telegram bot framework.

Bots are special [Telegram](https://telegram.org) accounts designed to handle messages automatically.
Users can interact with bots by sending them command messages in private or group chats.

### Installation

```
$ npm install
```

### Setup

1) Create an .env file in the root directory, containing your node API key and Telegram bot token. Note: Omit the bot prefix in the Telegram token.

e.g.
```
NODE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_TOKEN=xxxxxxxxx:xxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxx
```

2) Edit the `rpcURL` in `./src/config/default.json` if you are using Infura or your own node.


### Running

To run in development mode (restarts at every file change)
```
npm run dev
```

To run in production mode
```
npm run start
```

### Bot Commands

Send the following commands directly to the bot or in a group where the bot is present.

Converts one token to another given a quantity.
```
/convert <qty> <srcToken_symbol> <destToken_symbol>
```

Debugs a reserve to find out why it's returning zero rate(s)
```
/debugReserve <token_symbol> <reserve_address>
```

Encodes the ABI for certain methods. This can be used to send a transaction, call a method, or pass it into another smart contracts method as arguments.
```
/encodeABI <function> <...args>
```

Gets the address of an ERC20 token supported in Kyber.
```
/getAddressOfToken <token_symbol>
```

Get the expected conversion rate from source to destination token, as calculated in the smart contract.
```
/getExpectedRate <srcToken_symbol> <destToken_symbol> <srcQty>
```

Get the KNC fee wallet of the reserve.
```
/getKNCFeeWallet <reserve_address>
```

Calculate and get the liquidity parameters to be passed to the `setLiquidityParams()` function in the LiquidityConversionRates contract.
```
/getLiquidityParams <json_input>
```

Get the ETH and token balances of a reserve.
```
/getReserveBalances <reserve_address>
```

Get the index of the reserve listed in the KyberNetwork contract.
```
/getReserveIndex <reserve_address>
```

Get all the reserves serving liquidity for the token in KyberNetwork.
```
/getReservesOfToken <token_symbol>
```

Get all the tokens the a reserve supports.
```
/getTokensOfReserve <reserve_address>
```

Check if the address passed is registered to the fee sharing program.
```
/isFeeSharingWallet <wallet_address>
```

Check if the reserve is listed in mainnet or staging KyberNetwork.
```
/isReserveListed <reserve_address>
```
