const { createClient, utils } = require("./build/index.NodeJS.js");//require("owop-bot-lib");

const bot = createClient({
	// options
});

let prefix = "&";

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function* rainbowGenerator(frequency = 0.01) {
	let i = 0;
    while(true) {
		yield [
			Math.round(Math.sin(i + 0) * 127 + 128),
			Math.round(Math.sin(i + 2) * 127 + 128),
			Math.round(Math.sin(i + 4) * 127 + 128)
		];
		i += frequency;
    }
}
const rainbow = rainbowGenerator(0.1);
bot.on("join", async id => {
	console.log("Connected with id: " + id);
	
	for(let color of rainbow) {
		bot.setColor(color);
		await sleep(30);
	}
})
bot.on("message", msg => {
	let [user, message, isWhisper]= utils.parseMessage(msg)
	console.log(msg, user, message, isWhisper)
	
	if(!user || !message?.startsWith(prefix)/*!message || !message.startsWith("&")*/) return;
	console.log()
	let [commandName, ...args] = message
        .slice(prefix.length)
        .trim()
        .split(/ +/g);
	
	commandName = commandName.toLowerCase(); // optionally
	
	if(commandName === "about") {
		bot.sendMessage(`hello ${user.nick || ""} ${user.id || ""} Sent from owop-bot-lib https://github.com/mathmakgakpak/OWOP-bot-lib`);
	}
})