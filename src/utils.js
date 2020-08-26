import gameSettings from "./gameSettings.js";
const chunkSize = gameSettings.chunkSize;

const hypot = Math.hypot;
/**
 * metters distance between two points.
 * @param {number} x1 - x1.
 * @param {number} y1 - y1.
 * @param {number} x2 - x2.
 * @param {number} y2 - y2.
 */
export function distance(x1, y1, x2, y2) {
  return hypot(x2-x1, y2-y1);
};

/**
 * It allows you to explore/write buffer easier.
 * @constructor
 * @param {Buffer} buffer - node.js / browser buffer implementation buffer.
 */
export class AutoOffsetBuffer { // not really only 2 methods
	constructor(buffer) {
		this.offset = 0;
		this.buffer = buffer;
	}

  /**
   * set uint
   * 
   * @param {number} value - value to write
   * @param {?number} byteLength - byteLength to write
   * @param {?boolean} littleEndian - bytes saving type {@link https://en.wikipedia.org/wiki/Endianness (read this)}
   * @param {?number} offset - number of offset which it should write
   * @param {?boolean} addToOffset - if it should set current offset to offset param's value + byteLength
   */
  setUint(value, byteLength = 1, littleEndian = true, offset = this.offset, addToOffset = true) {
    if(littleEndian) this.buffer.writeUIntLE(value, offset, byteLength);
    else this.buffer.writeUIntBE(value, offset, byteLength);

    if(addToOffset) this.offset = offset + byteLength;
  }
  /**
   * set int
   * 
   * @param {number} value - value to write
   * @param {?number} byteLength - byteLength to write
   * @param {?boolean} littleEndian - bytes saving type {@link https://en.wikipedia.org/wiki/Endianness (read this)}
   * @param {?number} offset - number of offset which it should write
   * @param {?boolean} addToOffset - if it should set current offset to offset param's value + byteLength
   */
  setInt(value, byteLength = 1, littleEndian = true, offset = this.offset, addToOffset = true) {
    if(littleEndian) this.buffer.writeIntLE(value, offset, byteLength);
    else this.buffer.writeIntBE(value, offset, byteLength);

    if(addToOffset) this.offset = offset + byteLength;
  }
  /**
   * get uint
   * 
   * @param {?number} byteLength - byteLength to read
   * @param {?boolean} littleEndian - bytes saving type {@link https://en.wikipedia.org/wiki/Endianness (read this)}
   * @param {?number} offset - number of offset which it should read
   * @param {?boolean} addToOffset - if it should set current offset to offset param's value + byteLength
   */
  getUint(byteLength = 1, littleEndian = true, offset = this.offset, addToOffset = true) {
    let data = littleEndian ? this.buffer.readUIntLE(offset, byteLength) :
     this.buffer.readUIntBE(offset, byteLength);

    if(addToOffset) this.offset = offset + byteLength;
    return data;
  }
  /**
   * get int
   * 
   * @param {?number} byteLength - byteLength to read
   * @param {?boolean} littleEndian - bytes saving type {@link https://en.wikipedia.org/wiki/Endianness (read this)}
   * @param {?number} offset - number of offset which it should read
   * @param {?boolean} addToOffset - if it should set current offset to offset param's value + byteLength
   */
  getInt(byteLength = 1, littleEndian = true, offset = this.offset, addToOffset = true) {
    let data = littleEndian ? this.buffer.readIntLE(offset, byteLength) :
     this.buffer.readIntBE(offset, byteLength);

    if(addToOffset) this.offset = offset + byteLength;
    return data;
  }
  // 
	/*setUint8(value, offset = this.offset, addToOffset = true) {
		this.buffer.writeUInt8(value, offset);
    
		this.offset = addToOffset ? offset + 1 : offset;
	}
	setInt8(value, offset = this.offset, addToOffset = true) {
		this.buffer.writeInt8(value, offset);
    
		this.offset = addToOffset ? offset + 1 : offset;
	}
	// 16
	setUint16(value, offset = this.offset, littleEndian = true, addToOffset = true) {
		if(littleEndian) {
      this.buffer.writeUInt16LE(value, offset);
    } else {
      this.buffer.writeUInt16BE(value, offset);
    }
    
		this.offset = addToOffset ? offset + 2 : offset;
	}
	setInt16(value, offset = this.offset, littleEndian = true, addToOffset = true) {
		if(littleEndian) {
      this.buffer.writeInt16LE(value, offset);
    } else {
      this.buffer.writeInt16BE(value, offset);
    }
    
		this.offset = addToOffset ? offset + 2 : offset;
	}
	// 32
	setUint32(value, offset = this.offset, littleEndian = true, addToOffset = true) {
		if(littleEndian) {
      this.buffer.writeUInt32LE(value, offset);
    } else {
      this.buffer.writeUInt32BE(value, offset);
    }
    
		this.offset = addToOffset ? offset + 4 : offset;
	}
	setInt32(value, offset = this.offset, littleEndian = true, addToOffset = true) {
		if(littleEndian) {
      this.buffer.writeInt32LE(value, offset);
    } else {
      this.buffer.writeInt32BE(value, offset);
    }
    
		this.offset = addToOffset ? offset + 4 : offset;
	}

	// get
	// 8
	getUint8(offset = this.offset, addToOffset = true) {
		let data = this.buffer.readUInt8(offset);
		this.offset = addToOffset ? offset + 1 : offset;
		return data;
	}
	getInt8(offset = this.offset, addToOffset = true) {
		let data = this.buffer.readInt8(offset);
		this.offset = addToOffset ? offset + 1 : offset;
		return data;
	}
	// 16
	getUint16(offset = this.offset, littleEndian = true, addToOffset = true) {
		let data;
    if(littleEndian) {
      data = this.buffer.readUInt16LE(offset);
    } else {
      data = this.buffer.readUInt16BE(offset);
    }
		this.offset = addToOffset ? offset + 2 : offset;
		return data;
	}
	getInt16(offset = this.offset, littleEndian = true, addToOffset = true) {
		let data;
    if(littleEndian) {
      data = this.buffer.readInt16LE(offset);
    } else {
      data = this.buffer.readInt16BE(offset);
    }
		this.offset = addToOffset ? offset + 2 : offset;
		return data;
	}
	// 32
	getUint32(offset = this.offset, littleEndian = true, addToOffset = true) {
		let data;
    if(littleEndian) {
      data = this.buffer.readUInt32LE(offset);
    } else {
      data = this.buffer.readUInt32BE(offset);
    }
		this.offset = addToOffset ? offset + 4 : offset;
		return data;
	}
	getInt32(offset = this.offset, littleEndian = true, addToOffset = true) {
		let data;
    if(littleEndian) {
      data = this.buffer.readInt32LE(offset);
    } else {
      data = this.buffer.readInt32BE(offset);
    }
		this.offset = addToOffset ? offset + 4 : offset;
		return data;
	}
  // text
  
  /*getText(offset = this.offset, addToOffset = true) {
    let text = "";
    let length = this.getUint32(offset, true, addToOffset);
    console.log(length);
    
    for(let i = 0; i < length; i++) text += String.fromCharCode(this.getUint32());
    
    return text;
  }
  setText(text, offset = this.offset) {
    //text.splice(4294967296); // Math.pow(2, 32) // not really needed it will do it self
    let length = this.setUint32(text.length, offset);
    
    for(let i = 0; i < text.length; i++) this.setUint32(text.charCodeAt(i));
    return length;
  }*/
}
AutoOffsetBuffer.prototype.writeUInt = AutoOffsetBuffer.prototype.setUint;
AutoOffsetBuffer.prototype.writeInt = AutoOffsetBuffer.prototype.setInt;

AutoOffsetBuffer.prototype.readUInt = AutoOffsetBuffer.prototype.getUint;
AutoOffsetBuffer.prototype.readInt = AutoOffsetBuffer.prototype.getInt;

export class Bucket {
  constructor(rate, per, infinite) {
    this.lastCheck = Date.now();
    this.allowance = 0;
    this.rate = rate;
    this.per = per;
    this.infinite = infinite;
  }
  update() {
    this.allowance += ((Date.now() - this.lastCheck) / 1000) * (this.rate / this.per);
    this.lastCheck = Date.now();
    if (this.allowance > this.rate) {
      this.allowance = this.rate;
    }
  }
  canSpend(count = 1) {
    if (this.infinite) {
      return true;
    }

    this.update();
    if (this.allowance < count) {
      return false;
    }
    this.allowance -= count;
    return true;
  }
}
export function getIbyXY(x, y, w, alpha) {
  return (y * w + x) * (alpha ? 4 : 3);
}
const floor = Math.floor;

export class ChunkSystem {
    constructor() {
        this.chunks = {};
        this.chunkProtected = {};
    };

    setChunk(x, y, data) {
        //if (!data || typeof x !== "number" || typeof y !== "number") throw new Error("x or y is not a number or no data!");

        return this.chunks[x + "," + y] = data;
    };
    getChunk(x, y) {
        return this.chunks[x + "," + y];
    };
    removeChunk(x, y) {
        return delete this.chunks[x + "," + y];
    };
    setPixel(x, y, rgb) {
        //if (typeof rgb !== "object" || typeof x !== "number" || typeof y !== "number") throw new Error("x or y is not a number or rgb is not array!");
        const chunkX = floor(x / chunkSize);
        const chunkY = floor(y / chunkSize);

        const chunk = this.getChunk(chunkX, chunkY);
        if (!chunk) return;

        const i = getIbyXY(x & chunkSize - 1, y & chunkSize - 1, chunkSize);

        chunk[i] = rgb[0];
        chunk[i + 1] = rgb[1];
        chunk[i + 2] = rgb[2];
        return true;
    };
    getPixel(x, y) {
        //if (typeof x !== "number" || typeof y !== "number") throw new Error("x or y is not a number!");
        const chunkX = floor(x / chunkSize);
        const chunkY = floor(y / chunkSize);

        const chunk = this.getChunk(chunkX, chunkY);

        if (!chunk) return;

        const i = getIbyXY(x & chunkSize - 1, y & chunkSize - 1, chunkSize);
        return [chunk[i], chunk[i + 1], chunk[i + 2]];
    };
    setChunkProtection(x, y, newState) {
        //if (typeof x !== "number" || typeof y !== "number") throw new Error("x or y is not a number!");

        if (newState) this.chunkProtected[x + "," + y] = true;
        else delete this.chunkProtected[x + "," + y];
        return true;
    }
    isProtected(x, y) {
        //if (typeof x !== "number" || typeof y !== "number") throw new Error("x or y is not a number!");
        return !!this.chunkProtected[x + "," + y];
    }
}

/*export class World extends ChunkSystem {
  constructor(name = "main") {
    this.name = name;

    this.players = {};
  }
}*/

export function decompress(u8arr) {
    var originalLength = u8arr[1] << 8 | u8arr[0];
    var u8decompressedarr = new Uint8ClampedArray(originalLength);
    var numOfRepeats = u8arr[3] << 8 | u8arr[2];
    var offset = numOfRepeats * 2 + 4;
    var uptr = 0;
    var cptr = offset;
    for (var i = 0; i < numOfRepeats; i++) {
        var currentRepeatLoc = (u8arr[4 + i * 2 + 1] << 8 | u8arr[4 + i * 2]) + offset;
        while (cptr < currentRepeatLoc) {
            u8decompressedarr[uptr++] = u8arr[cptr++];
        }
        var repeatedNum = u8arr[cptr + 1] << 8 | u8arr[cptr];
        var repeatedColorR = u8arr[cptr + 2];
        var repeatedColorG = u8arr[cptr + 3];
        var repeatedColorB = u8arr[cptr + 4];
        cptr += 5;
        while (repeatedNum--) {
            u8decompressedarr[uptr] = repeatedColorR;
            u8decompressedarr[uptr + 1] = repeatedColorG;
            u8decompressedarr[uptr + 2] = repeatedColorB;
            uptr += 3;
        }
    }
    while (cptr < u8arr.length) {
        u8decompressedarr[uptr++] = u8arr[cptr++];
    }
    return u8decompressedarr;
}

export function createChunkFromRGB(color) {
    let tile = new Uint8ClampedArray(chunkSize * chunkSize * 3);
    for (var i = 0; i < tile.length;) {
        tile[i++] = color[0];
        tile[i++] = color[1];
        tile[i++] = color[2];
    }
    return tile;
}

const chunkx3 = chunkSize * 3;
export function shouldMove(x1, y1, x2, y2) {
  return distance(x1, y1, x2, y2) >= chunkx3;
}

export function isWSConnected(ws) {
  return !!ws && ws.readyState === 1;
}

export function reverseObject(obj) {
  const reversedObject = {};

  for(let i in obj) reversedObject[obj[i]] = i;
  
  return reversedObject;
}

/*export const aggregation = (baseClass, ...mixins) => {
  class base extends baseClass {
      constructor (...args) {
          super(...args);
          mixins.forEach((mixin) => {
              copyProps(this,(new mixin));
          });
      }
  }
  let copyProps = (target, source) => {  // this function copies all properties and symbols, filtering out some special ones
      Object.getOwnPropertyNames(source)
            .concat(Object.getOwnPropertySymbols(source))
            .forEach((prop) => {
               if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/))
                  Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
             })
  }
  mixins.forEach((mixin) => { // outside contructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
      copyProps(base.prototype, mixin.prototype);
      copyProps(base, mixin);
  });
  return base;
}*/
export const deepClone = (inObject) => {
  if (typeof inObject !== "object" || inObject === null) {
    return inObject;
  }


  let outObject = Array.isArray(inObject) ? [] : {};

  for (let key in inObject) {
    outObject[key] = deepClone(inObject[key]);
  }

  return outObject;
}

let a = gameSettings.worldBorder;
let b =  ~a;

export function isInsideWorldBorder(x, y) {
  return x <= a && y <= a && x >= b && y >= b;
}

/*
  0-3 - normal owop ranks
  4 - discord
*/
export function parseMessage(msg) { // maybe someone will use it
  let something = msg.split(": ");

  if (
    msg.startsWith("DEV") ||
    msg.toLowerCase().startsWith("server:") ||
    msg[0] === "<" ||
    something.length < 2
  )
    return [null, null, null, msg];

  let before = something.shift();
  let message = something.join(": ").trim();

  let user = {
    rank: 0,
    id: null,
    nick: ""
  };
  let tell = false;

  if (before.startsWith("[D]")) {
    user.rank = 4; // rank 4 is discord
    user.nick = before.slice(4).trim(); // two ways one is spliting by space second is by just slicing 4 letters
  } else if (before.startsWith("(M)")) {
    user.nick = before.slice(4).trim();
    user.rank = 2;
  } else if (before.startsWith("(A)")) {
    user.nick = before.slice(4).trim();
    user.rank = 3;
  } else if (before.startsWith("[") || /[0-9]/g.test(before[0])) {
    if (before.startsWith("[")) {
      user.id = +before.split("]")[0].substr(1);
      user.nick = before.split("]");
      user.nick.shift();
      user.nick = user.nick.join("]").trim();
    } else {
      user.id = +before;
      user.nick = before.trim(); // trim is not needed i think
    }

    user.rank = 0; //that.players[user.id] ? that.players[user.id].rank : 0;
  } else if (before.startsWith("-> ") && /[0-9]/g.test(before[4])) {
    tell = true;
    user.id = +before.split(" ")[1];
    user.nick = user.id.toString();

    user.rank = 0; //that.players[user.id] ? that.players[user.id].rank : 0;
  } else if (before.toLowerCase().startsWith("-> you tell")) {
    user.id = that.player.id;
    user.nick = that.player.nick;
    tell = true;
  }
  return [user, message, tell, msg];
}