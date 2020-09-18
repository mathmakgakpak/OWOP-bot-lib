
# OWOP bot lib
OWOP - [Our World Of Pixels](https://ourworldofpixels.com/)

# Client

Node.js
```js
const OWOPBotLib = require("owop-bot-lib"); // { Client, utils, gameSettings, WebSocket, Canvas }
const bot = OWOPBotLib.Client(); // Client can be also invoked without new and instanceof will work normally
bot.on("join", console.log) // returns id 
```
OPM
```js 
const { Client } = OPM.require("owop-bot-lib"); // Client

const bot = new Client();
bot.on("join", console.log) // returns id 
```

## possible Client.options

### teleport
should accept teleport from server
### unsafe
ignores permissions
stops checking
can send message
can set pixel
### and all other options from Client.defaultOptions

## *static* defaultOptions
Default options which will be deep copied and set to ClientInstance.options
```js
const Client = OPM.require("owop-bot-lib").Client;
console.log(Client.defaultOptions) /*{
wsUrl:  "wss://ourworldofpixels.com", // address it connects to
captchaSiteKey:  "6LcgvScUAAAAAARUXtwrM8MP0A0N70z4DHNJh-KI", // not used
autoMakeSocket:  true, // should connect to websocket after instance created
autoConnectWorld:  true, // should connect to world after it gets 3rd captcha state
wsOptions: {
origin:  "https://ourworldofpixels.com"
},
protocol:  1, // 0 - bop it OWOP 1 - original owop and my latest server
worldName:  "main",
worldVerification:  gameSettings.misc.worldVerification // world verification code default 25565
}*/
// Client.options.wsOptions doesn't works on browser
```

## makeSocket()
makes socket
TO-DO example with proxies or something
## messageHandler(message: websocketMessageEvent)
if someone needs it exists
## sendMessage(message: string) => boolean
Sends message to chat
```js
bot.sendMessage("BOB"); // true
bot.once("message", console.log); //this.player.id: BOB
```

## join(worldName: string = "main")
joins world
TO-DO example
## leave()
disconnects websocket
## playerUpdate(x: number = this.player.x, y: number = this.player.y, color: anyTypeOfArray = this.player.color, toolId: number  = this.player.toolId) => boolean
Sends move, colorUpdate, toolUpdate in one packet
```js
// you can do
bot.playerUpdate(123, 123, [53, 123, 43]);
// 1 packet(faster)
// instead of 
bot.move(123, 123);
bot.setColor([53, 123, 43]);
bot.setTool(gameSettings.toolsIds["cursor"] /* 0 */)
// 3 packets(slower)
```
## move(x: number, y: number) => boolean
moves bot
example in player update
## setColor(color: anyTypeOfArray = this.player.color) => boolean
example in player update
## setTool(toolId: number = this.player.toolId) => boolean
example in player update
## pasteChunk()