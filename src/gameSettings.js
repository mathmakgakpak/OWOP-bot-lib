export function reverseObject(obj) {
  const reversedObject = {};

  for (let i in obj) reversedObject[obj[i]] = i;

  return reversedObject;
}

const gameSettings = {
  maxStoredMessages: 100,
  chunkSize: 16,
  maxWorldNameLength: 24,
  worldBorder: 0xfffff,
  captcha: {
    siteKey: "6LcgvScUAAAAAARUXtwrM8MP0A0N70z4DHNJh-KI"
  },
  opCodes: {
    client: {
      rankVerification: 1, // rank
      requestChunk:
        4 + // chunk x
        4,  // chunk y
      protectChunk:
        4 + // chunk x
        4 + // chunk y
        1 + // newstate
        1, // blank place it exists because before clearchunk had 9 bytes
      setPixel:
        4 + // x
        4 + // y
        1 + // r
        1 + // g
        1,  // b
      playerUpdate:
        4 + // x
        4 + // y
        1 + // r
        1 + // g
        1 + // b
        1,  //tool
      setChunkRGB:
        4 + // chunk x
        4 + // chunk y
        1 + // r
        1 + // g
        1 + // b
        2,  // blank place
      oldClearChunk:
        4 + // chunk x
        4 + // chunk y
        1,  // blank place
      paste:
        4 + // chunk x
        4   // chunk y
        // chunkSize * chunkSize * 3 // data // it is at the bottom
    },
    server: {
      setId: 0,
      worldUpdate: 1,
      chunkLoad: 2,
      teleport: 3,
      setRank: 4,
      captcha: 5,
      setPQuota: 6,
      chunkProtected: 7,
      maxCount: 8
    }
  },
  chatQuota: {
    0: [4, 6],
    1: [4, 6],
    2: [10, 3],
    3: [0, 1000]
  },
  captchaState: {
    WAITING: 0,
    VERIFYING: 1,
    VERIFIED: 2,
    OK: 3,
    INVALID: 4
  },
  toolsNames: {
    0: "cursor",
    1: "move",
    2: "pippete",
    3: "eraser",
    4: "zoom",
    5: "bucket",
    6: "paste",
    7: "export",
    8: "line",
    9: "protect",
    10: "copy"
  },
  toolsRanks: {
    0: 1,
    1: 0,
    2: 0,
    3: 2,
    4: 0,
    5: 1,
    6: 2,
    7: 0,
    8: 1,
    9: 2,
    10: 2
  },
  RANK: {
    NONE: 0,
    USER: 1,
    MOD: 2,
    ADMIN: 3
  },
  maxMessageLength: {
    0: 128,
    1: 128,
    2: 512,
    3: 16384
  },
  misc: {
		worldVerification: 25565,
		chatVerification: String.fromCharCode(10),
		tokenVerification: 'CaptchA'
	}
};
gameSettings.opCodes.paste += gameSettings.chunkSize * gameSettings.chunkSize * 3; // data

gameSettings.toolsIds = reverseObject(gameSettings.toolsNames);
gameSettings.RANKReverse = reverseObject(gameSettings.RANK);
gameSettings.captchaStateReverse = reverseObject(gameSettings.captchaState);


export default gameSettings;
