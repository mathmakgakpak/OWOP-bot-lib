const path = require("path");
const webpack = require('webpack');
const fs = require('fs-extra');
const JsDocPlugin = require("jsdoc-webpack-plugin")

const packageJSON = require("./package.json");
let version = packageJSON.version;
let build = packageJSON.build;

function addToVersion(version, number = 1) { // dumb
    let oldNum = +version.split(".").join("");
    let newNum = (oldNum + number).toString();
    oldNum = oldNum.toString();

    let zeros = version.split(".");
    for(let i = 0; i < zeros.length; i++) if(zeros[i] != 0) {
        zeros = zeros.slice(0, i - (newNum.length - oldNum.length)).join(".");
        break;
    }

    return zeros + "." + newNum.split("").join(".");
}

const srcDir = path.resolve(__dirname, "src");

module.exports = [];

function genConfig(buildFor, isProductionBuild) {
    const isNodeBuild = buildFor === "NodeJS";
    const config = {
        target: isNodeBuild ? "node" : "web",
        mode: isProductionBuild ? "production" : "development",
        devtool: isProductionBuild ? undefined : "source-map",

        entry: {
            index: path.resolve(srcDir, "index.js")
        },
        output: {
            filename: `[name].${buildFor}${isProductionBuild ? ".min" : ""}.js`,
            path: path.resolve(__dirname, "build"),
            //pathinfo: true,
            publicPath: isProductionBuild ? '/' : './',
            library: "OWOPBotLib",
            libraryTarget: isNodeBuild ? "commonjs2" : undefined
        },
        module: {
            rules: [
				 {
				  include: srcDir,
				//exclude: path.resolve(__dirname, "node_modules"),
				  use: {
					loader: 'babel-loader',
					options: {
					 // presets: ['@babel/preset-env']
					}
				  }
				}
            ]
        },
    
        plugins: [
            new webpack.EnvironmentPlugin({
                isProductionBuild,
                build,
                version,
                buildFor,
                isNodeBuild
            }),
            new webpack.BannerPlugin({
                banner: `Bot library for OWOP (our world of pixels)

@discord  mathias377#3326
@author   mathias377
@license  MIT`
            }),
            // TO-DO learn how to use this

            
        ],
        externals: {
            canvas: "canvas", // ok wtf why when i set it to {} it requires undefined
            ws: "ws"
        }
    };

    if(isNodeBuild) {
        if(isProductionBuild) config.plugins.push(new JsDocPlugin({
            conf: 'jsdoc.conf.js',
            cwd: '.',
            preserveTmpFile: false,
            recursive: false
        }));
    } else {
        delete config.externals.canvas;
    }

    return config;
}

// NodeJS
module.exports[0] = (env = {}) => {
    const isProductionBuild = !!env.production;
    const buildFor = "NodeJS";

    if (isProductionBuild) packageJSON.version = version = addToVersion(version);
    packageJSON.build = ++build;

    fs.writeFileSync("./package.json", JSON.stringify(packageJSON, null, 2));

    
    const config = genConfig(buildFor, isProductionBuild);

    if(isProductionBuild || env.devclean) {
        console.log(`Cleaning build dir: '${config.output.path}'`);
        fs.removeSync(config.output.path);
    }

    return config;
}
module.exports[1] = (env = {}) => {
    const isProductionBuild = !!env.production;
    const buildFor = "browser";
    const config = genConfig(buildFor, isProductionBuild);

    console.log(`${config.mode} build\nVersion: ${version}\nBuild: ${build}\n`);

    return config;
}