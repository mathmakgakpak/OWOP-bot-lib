
# OWOP bot lib
OWOP - [Our World Of Pixels](https://ourworldofpixels.com/)
\
docs are not fully finished

# Client
Client extends [EventEmitter](https://nodejs.org/api/events.html)
Node.js
```js
const OWOPBotLib = require("owop-bot-lib"); // { Client, utils, gameSettings, WebSocket, Buffer (buffer package), createClient  }
const bot = new OWOPBotLib.Client();
bot.on("join", console.log) // logs id 
```
OPM (the library is not published on opm yet)
```js 
const { createClient } = OPM.require("owop-bot-lib"); // Client

const bot = createClient();
bot.on("join", console.log) // logs id 
```
you can also import owop-bot-lib using es modules
```js
import { createClient } from "owop-bot-lib";
```

## possible Client.options

### teleport (buggy)
if enabled accepts teleport from server
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
protocol:  1, // 0 - bop it OWOP 1 - original owop and my latest OWOP server
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

## join(worldName: string = "main") => this
joins world
TO-DO example
## leave() => this
disconnects websocket
## playerUpdate(x: number = this.player.x, y: number = this.player.y, color: anyTypeOfArray = this.player.color, toolId: number = this.player.toolId) => this
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
## move(x: number, y: number) => this
moves bot
example in player update
## setColor(color: anyTypeOfArray = this.player.color) => this
example in player update
## setTool(toolId: number = this.player.toolId) => this
example in player update
## pasteChunk(chunkX: number = this.player.chunkX, chunkY: number = this.player.chunkY, data: Uint8Array = new Uint8ClampedArray(chunkSize * chunkSize * 3))

## setPixel(x: number = this.player.x, y: number = this.player.y, color: ArrayLike = this.player.color, wolfMove: boolean, sneaky: boolean, move: boolean = this.player.rank < 3) => this
Sets pixel on x y with color
TO-DO explain what is wolfMove, sneaky, move
## procetChunk(chunkX: number = this.player.chunkX, chunkY: number = this.player.chunkY, newState: boolean) => this
protects chunk required rank 2

```js
client.protectChunk(10, 12, true);
```

## setChunkRGB(chunkX: number = this.player.chunkX, chunkY: number = this.player.chunkY, color: ArrayLike = [255, 255, 255]) => this
sets chunk with color


## async requestChunk(chunkX: number = this.player.chunkX, chunkY: number = this.player.chunkY) => Promise\<Uint8Array\>
Uint8Array is chunk\

you can request as much times as you want one chunk and it will ask the server only once for chunk

```js
client.requestChunk(0, 0); // requestChunk always returns a Promise which resolves Uint8Array(chunkSize * chunkSize * 3) or error
```

## async requestArea(chunkX1: number, chunkY1: number, chunkX2: number, chunkY2: number) => Promise\<Array\<Uint8Array\>\>
read requestChunk

## async getPixel(x: number = this.player.x, y: number = this.player.y) => Promise<Array>
returns array with array [R, G, B]

