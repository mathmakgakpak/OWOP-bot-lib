//export const { build, version, buildFor, isNodeBuild } = process.env; // uhh there is a bug it does process$env = process.env and doesn't even add process for browser

export const build = process.env.build, 
version = process.env.version, 
buildFor = process.env.buildFor, 
isNodeBuild = process.env.isNodeBuild;

// remember use global instead of window in webpack
// String.prototype.map = Array.prototype.map; // not needed anymore






//export * as Canvas from "./Canvas"; not used


export * as utils from "./utils";
export { default as Client } from "./Client";
export { default as gameSettings } from "./gameSettings";
export { default as WebSocket } from "isomorphic-ws";
export { default as EventEmitter } from "events";

__webpack_exports__.Buffer = Buffer;

if(!process.env.isNodeBuild && global.OPM) {
    __webpack_exports__.install = () => {
        console.log("OWOP bot lib is installed");
    }
    __webpack_exports__.uninstall = () => {
        global.alert("OWOP bot lib will be uninstalled after page refresh");
    }
}
