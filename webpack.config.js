
const path = require("path");

const webpack = require("webpack");
const WebpackCopyPlugin = require("copy-webpack-plugin");

let mode = "development";
if ("PRODUCTION" in process.env) mode = "production";

function getDefinePluginConfig() {
  let data = {};
  data["process.env.DEV"] = mode == "development" ? true : false;
  return data;
}


module.exports = {
  entry: {
    background: './src/chromeos-ui.ts',
   "web/index": "./src/web-ui.ts",
    options: "./src/options.ts"
  },
  mode,
  output: {
    path: path.resolve(process.cwd(), "./dist"),
    filename: '[name].js'
  },
  module: {
    rules: [
      {test: /\.ts$/, use: "ts-loader"}
    ]
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", "..."],
    alias: {
      src: path.resolve(process.cwd(), "src"),
    },
  },
  plugins: [
    new WebpackCopyPlugin({
      patterns: [
        {from: `./assets/manifest/chromeos-ui.json`, to: "./manifest.json"},
        {from: "./assets/html/options.html", to: "./options.html"},
      ]
    }),
    new webpack.DefinePlugin(getDefinePluginConfig()), 
  ],
}