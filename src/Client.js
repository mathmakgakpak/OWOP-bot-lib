import { EventEmitter } from "events";
import gameSettings from "./gameSettings";
import WS from "isomorphic-ws";
import { isWSConnected, createChunkFromRGB, shouldMove, Bucket, AutoOffsetBuffer, ChunkSystem, decompress, deepClone, isInsideWorldBorder, getIbyXY } from "./utils";
import { WEBSOCKET_IS_NOT_CONNECTED, REQUEST_CHUNK_OUTSIDE_WORLD_BORDER, TOO_LOW_PERMISSION, CANNOT_SPEND } from "./errorsList";
const { RANK, chunkSize } = gameSettings;
const { client: clientOpcodes, server: serverOpCodes } = gameSettings.opCodes;

const chuchunk3 = chunkSize * chunkSize * 3; // buh the name

const { floor, max } = Math;
const { allocUnsafe: BufferAllocUnsafe, from: BufferFrom } = Buffer;


class Client extends EventEmitter {
  static defaultOptions = {
    wsUrl: "wss://ourworldofpixels.com",
    captchaSiteKey: "6LcgvScUAAAAAARUXtwrM8MP0A0N70z4DHNJh-KI",
    autoMakeSocket: true,
    autoConnectWorld: true,
    wsOptions: {
      origin: "https://ourworldofpixels.com"
    },
    protocol: 1,
    worldName: "main",
    worldVerification: gameSettings.misc.worldVerification
  }

  constructor(options = {}) {
    super();
    const defaultOptionsDeepCopy = deepClone(Client.defaultOptions);
    for (let key in defaultOptionsDeepCopy) {
      if (!options.hasOwnProperty(key)) {
        options[key] = defaultOptionsDeepCopy[key];
      }
    }
    this.options = options;

    this._resetDefault();
    if (options.autoMakeSocket) this.makeSocket();
  }

  _resetDefault() {
    if (this.ws) {
      if (this.ws.readyState !== 1) this.ws.close();
      this.ws = undefined;
    }
    this.messages = [];
    this.players = {};
    this.pendingLoad = {};

    const quota0 = gameSettings.chatQuota[RANK.NONE];
    this.player = {
      rank: 0,
      nick: "",
      color: new Uint8ClampedArray(3).fill(255),
      pixelBucket: new Bucket(0, 0),
      chatBucket: new Bucket(quota0[0], quota0[1]),
      worldName: "", // main

      x: 0,
      y: 0,
      chunkX: 0,
      chunkY: 0,

      tool: 0,
      toolName: gameSettings.toolsNames[0]
    };
    this.chunkSystem = new ChunkSystem;

    this.maxPlayersOnWorld = null;
  }

  makeSocket() {
    this.ws = new WS(this.options.wsUrl, process.env.isNodeBuild ? this.options.wsOptions : undefined);

    if (!process.env.isNodeBuild) this.ws.binaryType = "arraybuffer";

    this.ws.onclose = reason => this.emit("close", reason);

    this.ws.onerror = err => this.emit("error", err);

    this.ws.onmessage = this.messageHandler.bind(this);
  }
  messageHandler(message) {
    const data = message.data; // ArrayBuffer || buffer || string

    if (typeof data === "string") {
      this.messages.push(data);
      if (this.messages.length > gameSettings.maxStoredMessages) this.messsages.shift();
      this.emit("message", data);
    } else {
      const buf = process.env.isNodeBuild ? data : BufferFrom(data); // buffer from cuz it sends array buffer
      this.emit("rawMessage", buf);

      switch (buf.readUInt8(0)) {
        case serverOpCodes.setId: {
          this.player.chatBucket.allowance = this.player.rate;
          //let id = this.player.id = buf.readUInt32LE(1)
          //this.emit("gotId", id);
          this.emit("join", this.player.id = buf.readUInt32LE(1));
          break;
        }
        case serverOpCodes.worldUpdate: { // to do change it to normal buffer
          //break;
          const ab = new AutoOffsetBuffer(buf);
          ab.offset++;
          let count = ab.readUInt(); // players update size

          if (count) {
            let updatedPlayers = {};
            let newPlayers = [];
            for (let i = 0; i < count; i++) { // player updates
              let id = ab.readUInt(4); // player id
              //let isNew = false;
              if (!this.players[id]) {
                //isNew = true;
                this.players[id] = {
                  id,
                  nick: "",
                  rank: 0,
                  color: new Uint8ClampedArray(3),
                }
                newPlayers.push(id);
              }
              let player = updatedPlayers[id] = this.players[id];

              player.x = ab.readInt(4) / 16; // x
              player.y = ab.readInt(4) / 16; // y

              player.color[0] = ab.readUInt(); // r
              player.color[1] = ab.readUInt(); // g
              player.color[2] = ab.readUInt(); // b
              let tool = ab.readUInt(); // tool
              player.tool = gameSettings.toolsNames[tool] ? tool : 0;
              player.rank = max(player.rank, gameSettings.toolsRanks[tool]);
            }

            this.emit("updatedPlayers", updatedPlayers);
            if (newPlayers.length) this.emit("newPlayers", newPlayers);
          }

          count = ab.readUInt(2); // pixels update size

          if (count) {
            let updatedPixels = [];

            for (let i = 0; i < count; i++) { // pixel updates
              let pixel = {};
              if (this.options.protocol === 1) pixel.id = ab.readUInt(4); // player which set pixel id
              pixel.x = ab.readInt(4); // pixel x
              pixel.y = ab.readInt(4); // y
              pixel.color = [ab.readUInt(), ab.readUInt(), ab.readUInt()];

              this.chunkSystem.setPixel(pixel.x, pixel.y, pixel.color);

              updatedPixels.push(pixel);
            }

            this.emit("updatedPixels", updatedPixels);
          }

          count = ab.readUInt(); // disconnections of players update size

          if (count) {
            let disconnectedPlayers = [];
            for (let i = 0; i < count; i++) {
              let leftId = ab.readUInt(4);
              disconnectedPlayers.push(leftId);
              delete this.players[leftId];
            }
            this.emit("playersLeft", disconnectedPlayers);
          }
          break;
        }
        case serverOpCodes.chunkLoad: {
          const chunkX = buf.readInt32LE(1);
          const chunkY = buf.readInt32LE(5);
          const locked = !!buf.readUInt8(6);

          const chunkData = decompress(buf.slice(10, buf.length));

          this.chunkSystem.setChunk(chunkX, chunkY, chunkData);
          this.chunkSystem.setChunkProtection(chunkX, chunkY, locked);

          this.emit("chunk", chunkX, chunkY, chunkData, locked);
          break;
        }
        case serverOpCodes.teleport: {
          if (this.options.teleport) {
            let x = buf.readInt32LE(1);
            let y = buf.readInt32LE(5);

            this._setPosition(x, y);
          } else {
            this.move(this.player.x, this.player.y); // can be unsafe if you are going outside teleport border
          }
          this.emit("teleport", x, y);
          break;
        }
        case serverOpCodes.setRank: {
          const rank = this.player.rank = buf.readUInt8(1);
          this.ws.send(new Uint8Array([rank])); // verify rank
          this.emit("rank", rank);

          const quota = gameSettings.chatQuota[rank];
          const bucket = this.player.chatBucket;

          bucket.rate = quota[0];
          bucket.per = quota[1];
          //bucket.allowance = 0; // idk if it restarts every set rank but i think that it does not

          bucket.infinite = this.player.pixelBucket.infinite = rank === 3;

          this.emit("setChatBucket", bucket);
          break;
        }
        case serverOpCodes.captcha: {
          this.captchaState = buf.readUInt8(1);

          if (this.captchaState === 3 && this.options.autoConnectWorld) this.join(this.options.worldName);

          this.emit("captcha", this.captchaState);
          break;
        }
        case serverOpCodes.setPQuota: {
          const rate = buf.readUInt16LE(1);
          const per = buf.readUInt16LE(3);
          const bucket = this.player.pixelBucket;

          bucket.rate = rate;
          bucket.per = per;
          bucket.allowance = 0;

          this.emit("setPixelBucket", bucket);
          break;
        }
        case serverOpCodes.chunkProtected: {
          const chunkX = buf.readInt32LE(1);
          const chunkY = buf.readInt32LE(5);
          const newState = buf.readUInt8(6);

          this.chunkSystem.setChunkProtection(chunkX, chunkY, newState);
          break;
        }
        case serverOpCodes.maxCount: {
          this.emit("maxPlayers", this.maxPlayersOnWorld = buf.readUInt16LE(1));
          break;
        }
      }
    }
  }

  sendMessage(message) {
    if (!isWSConnected(this.ws)) throw new Error(WEBSOCKET_IS_NOT_CONNECTED);

    if (!this.options.unsafe) {
      if (!this.player.chatBucket.canSpend()) {
        this.emit("message", "Slow down! You're talking too fast!");
        this.messages.push("Slow down! You're talking too fast!");
        throw new Error(CANNOT_SPEND + " (chat)")
      }
      message = message.slice(0, gameSettings.maxMessageLength[this.player.rank])
    }

    this.ws.send(message + gameSettings.misc.chatVerification);
    return this;
  }

  join(name = "main") {
    if (!isWSConnected(this.ws)) throw new Error(WEBSOCKET_IS_NOT_CONNECTED);
    // TO-DO change dat because regex is slow
    name = name.replace(/[^a-zA-Z0-9\._]/gm, "").slice(0, gameSettings.maxWorldNameLength) || "main";
    const len = name.length;
    const buf = BufferAllocUnsafe(len + 2);

    for (let i = 0; i < len; i++) {
      buf.writeUInt8(name.charCodeAt(i), i)
    };

    buf.writeUInt16LE(this.options.worldVerification, len);

    this.ws.send(buf);

    this.player.worldName = name;
    
    return this;
  }

  leave() {
    /*if (isWSConnected(this.ws))*/ this.ws.close();
    return this;
  }

  playerUpdate(x = this.player.x, y = this.player.y, color = this.player.color, toolId = this.player.toolId) {
    if (!isWSConnected(this.ws)) throw new Error(WEBSOCKET_IS_NOT_CONNECTED);

    const buf = BufferAllocUnsafe(clientOpcodes.playerUpdate);

    buf.writeInt32LE(x * 16);
    buf.writeInt32LE(y * 16, 4);
    
    buf.writeUInt8(color[0], 8);
    buf.writeUInt8(color[1], 9);
    buf.writeUInt8(color[2], 10);

    buf.writeUInt8(toolId, 11);
    

    this.ws.send(buf);

    this.player.color[0] = color[0];
    this.player.color[1] = color[1];
    this.player.color[2] = color[2];

    this.player.toolName = gameSettings.toolsNames[
      this.player.tool = toolId
    ];

    this._setPosition(x, y);

    return this;
  }
  _setPosition(x, y) {
    this.player.x = x;
    this.player.y = y;

    this.player.chunkX = floor(x / chunkSize);
    this.player.chunkY = floor(y / chunkSize);
  }

  move(x = this.player.x, y = this.player.y) {
    return this.playerUpdate(x, y);
  }

  setColor(color = this.player.color) {
    this.playerUpdate(undefined, undefined, color);
    return this;
  }

  setTool(toolId = this.player.toolId) {
    return this.playerUpdate(undefined, undefined, undefined, toolId);
  }

  pasteChunk(chunkX = this.player.chunkX, chunkY = this.player.chunkY, data = new Uint8ClampedArray(chuchunk3)) {
    if (!isWSConnected(this.ws)) throw new Error(WEBSOCKET_IS_NOT_CONNECTED);
    if (!this.options.unsafe) {
      if (this.player.rank !== 3) return false;
      if (this.player.rank !== 2) return false;
    }


    const buf = BufferAllocUnsafe(clientOpcodes.pasteChunk);

    buf.writeInt32LE(chunkX);
    buf.writeInt32LE(chunkY, 4);

    for (let i = 0, off = 4 + 4; i < chuchunk3; i++, off++) buf.writeUInt8(data[i], off);

    this.ws.send(buf);

    return this;
  }
  setPixel(x = this.player.x, y = this.player.y, color = this.player.color, wolfMove, sneaky, move = this.player.rank < 3) {
    if (!isWSConnected(this.ws)) throw new Error(WEBSOCKET_IS_NOT_CONNECTED);
    if (!this.options.unsafe) {
      if (this.player.rank === 0) throw new Error(TOO_LOW_PERMISSION + "1");
      if (!this.player.pixelBucket.canSpend()) throw new Error(CANNOT_SPEND + " (pixel)");
    }


    const { x: oldX, y: oldY } = this.player;

    if (move || wolfMove && shouldMove(oldX, oldY, x, y)) this.move(x, y);

    const buf = BufferAllocUnsafe(clientOpcodes.setPixel);

    buf.writeInt32LE(x);
    buf.writeInt32LE(y, 4);

    buf.writeUInt8(color[0], 8);
    buf.writeUInt8(color[1], 9);
    buf.writeUInt8(color[2], 10);

    this.ws.send(buf);

    if (sneaky && oldX !== x && oldY !== y) this.move(oldX, oldY);

    return this;
  }

  protectChunk(chunkX = this.player.chunkX, chunkY = this.player.chunkY, newState) {
    if (!isWSConnected(this.ws)) throw new Error(WEBSOCKET_IS_NOT_CONNECTED);
    if (!this.options.unsafe && this.player.rank >= 2) throw new Error(TOO_LOW_PERMISSION + "2");

    const buf = BufferAllocUnsafe(clientOpcodes.setPixel);

    buf.writeInt32LE(chunkX);
    buf.writeInt32LE(chunkY, 4);

    buf.writeUInt8(newState, 8);

    this.ws.send(buf);

    return this;
  }

  setChunkRGB(chunkX = this.player.chunkX, chunkY = this.player.chunkY, color = [255, 255, 255]) {
    if (!isWSConnected(this.ws)) throw new Error(WEBSOCKET_IS_NOT_CONNECTED);
    if (!this.options.unsafe && this.player.rank >= 2) throw new Error(TOO_LOW_PERMISSION + "2");
    
    if (this.options.protocol === 0) {
      if (color[0] === 255 && color[1] === 255 && color[2] === 255) { // clears chunk
        const buf = BufferAllocUnsafe(clientOpcodes.oldClearChunk);

        buf.writeInt32LE(chunkX);
        buf.writeInt32LE(chunkY, 4);

        this.ws.send(buf);
      } else {
        this.pasteChunk(chunkX, chunkY, createChunkFromRGB(color));
      }
    } else {
      const buf = BufferAllocUnsafe(clientOpcodes.setChunkRGB);

      buf.writeInt32LE(chunkX);
      buf.writeInt32LE(chunkY, 4);

      buf.writeUInt8(color[0], 8);
      buf.writeUInt8(color[1], 9);
      buf.writeUInt8(color[2], 10);

      this.ws.send(buf);
    }

    return true;
  }

  async requestChunk(chunkX = this.player.chunkX, chunkY = this.player.chunkY) { // async is here because if chunk is loaded bot.requestChunk(0, 0) would not be promise
    if (!isWSConnected(this.ws)) throw new Error(WEBSOCKET_IS_NOT_CONNECTED);
    if (/*!this.options.unsafe && */!isInsideWorldBorder(chunkX, chunkY)) throw new Error(REQUEST_CHUNK_OUTSIDE_WORLD_BORDER);

    const key = chunkX + "," + chunkY;

    const chunk = this.chunkSystem.chunks[key] || // chunk
      this.pendingLoad[key] || // promise 
      (this.pendingLoad[key] = new Promise(resolve => {
        const func = (chunkXX, chunkYY, chunkData) => {
          if (chunkX === chunkXX && chunkY === chunkYY) {
            this.off("chunk", func);
            delete this.pendingLoad[key];
            resolve(chunkData);
          }
        }

        this.on("chunk", func);
        const buf = BufferAllocUnsafe(clientOpcodes.requestChunk);

        buf.writeInt32LE(chunkX, 0);
        buf.writeInt32LE(chunkY, 4);

        this.ws.send(buf);
      })); // promise 

    return await chunk;
  }

  requestArea(x1, y1, x2, y2) {
    x1 = x1 < x2 ? x1 : x2;
    y1 = y1 < y2 ? y1 : y2;
    x2 = x1 > x2 ? x1 : x2;
    y2 = y1 > y2 ? y1 : y2;

    //let chunksLasted = (x2 - x1 + 1) * (y2 - y1 + 1);

    const promises = [];
    const a = this.requestChunk;
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        promises.push(a(x, y));
      }
    }
    return Promise.all(promises);
  }

  async getPixel(x = this.player.x, y = this.player.y) {
    const chunkX = floor(x / chunkSize);
    const chunkY = floor(y / chunkSize);

    const i = getIbyXY(x & chunkSize - 1, y & chunkSize - 1, chunkSize);

    return (await this.requestChunk(chunkX, chunkY)).slice(i, i + 3);
  }
}


/*Client = (options) => new _Client(options);
Client.prototype = _Client.prototype;*/
Client.Client = Client;

export default Client;