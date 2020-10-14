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
            pathinfo: true/*!isProductionBuild*/,
            publicPath: isProductionBuild ? '/' : './',
            library: "OWOPBotLib",
            libraryTarget: "commonjs2"
        },
        module: {
            rules: [
				 {
				  include: srcDir,
				//exclude: path.resolve(__dirname, "node_modules"),
				  use: {
					loader: 'babel-loader',
					options: { // .babelrc
                        "presets": ["@babel/preset-env"],
                        "plugins": ["@babel/plugin-proposal-export-namespace-from", "@babel/plugin-proposal-class-properties"/*ignore the weirdo error it works*/, "@babel/plugin-transform-runtime"]
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
        externals: {}
    };

    
    if(isNodeBuild) {
        config.externals["isomorphic-ws"] = "commonjs2 isomorphic-ws";

        

        /*if(isProductionBuild)*/ /*config.plugins.push(new JsDocPlugin({
            conf: 'jsdoc.conf.js',
            cwd: '.',
            preserveTmpFile: false,
            recursive: false
        }));*/
    } else {
        config.externals.ws = {};

        config.resolve = {
            alias: { // https://github.com/webpack/webpack/issues/11282
                assert: "assert",
                buffer: "buffer",
                console: "console-browserify",
                constants: "constants-browserify",
                crypto: "crypto-browserify",
                domain: "domain-browser",
                events: "events",
                http: "stream-http",
                https: "https-browserify",
                os: "os-browserify/browser",
                path: "path-browserify",
                punycode: "punycode",
                process: "process/browser",
                querystring: "querystring-es3",
                stream: "stream-browserify",
                _stream_duplex: "readable-stream/duplex",
                _stream_passthrough: "readable-stream/passthrough",
                _stream_readable: "readable-stream/readable",
                _stream_transform: "readable-stream/transform",
                _stream_writable: "readable-stream/writable",
                string_decoder: "string_decoder",
                sys: "util",
                timers: "timers-browserify",
                tty: "tty-browserify",
                url: "url",
                util: "util",
                vm: "vm-browserify",
                zlib: "browserify-zlib"
            }
        };

        config.plugins.push(
            new webpack.ProvidePlugin({
                'Buffer': ["buffer", "Buffer"],
                
            })
        )
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

    if(/*isProductionBuild || */env.devclean) {
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