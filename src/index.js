//export const { build, version, buildFor, isNodeBuild } = process.env; // uhh there is a bug it does process$env = process.env and doesn't even add process polyfill

export const build = process.env.build, 
version = process.env.version, 
buildFor = process.env.buildFor, 
isNodeBuild = process.env.isNodeBuild;

// remember use global instead of window in webpack


export * as utils from "./utils";
export * as errorsList from "./errorsList";
export { default as Client } from "./Client";
export { default as gameSettings } from "./gameSettings";
export { default as WebSocket } from "isomorphic-ws";
export { default as EventEmitter } from "events";
export { default as Buffer } from "buffer";

export function createClient(options) {
    return new Client(options);
}

//__webpack_exports__.Buffer = require("buffer");

if(!process.env.isNodeBuild && global.OPM) { // the package probably will not be on OPM
    __webpack_exports__.install = () => { // export must be at top level :drrr:
        console.log("OWOP bot lib is installed");
    }
    __webpack_exports__.uninstall = () => {
        global.alert("OWOP bot lib will be uninstalled after page refresh");
    }
}


