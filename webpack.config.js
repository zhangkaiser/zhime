
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
    background: './src/chromeosV3.main.ts',
    "web/index": "./src/web.main.ts",
    "background-v2": "./src/pages/chromeosV2.main.ts",
    options: "./src/pages/chromeosOptions.ts",
  },
  mode,
  output: {
    path: path.resolve(process.cwd(), "./dist"),
    filename: '[name].js'
  },
  module: {
    rules: [
      {test: /\.ts$/i, use: "ts-loader"},
      {test: /\.css$/i, use: [
        {
          loader: "css-loader",
          options: {
            exportType: "string"
          }
        }
      ]}
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
        {from: "./assets/manifest/chromeos-ui.json", to: "./manifest.json"},
        {from: "./assets/html/options.html", to: "./options.html"},
        {from: "./assets/html/index.html", to: "./web/index.html"},
        {from: "./librime/out/worker", to: "./web/decoders"},
        {from: "./librime/emscripten/asset/data", to: "./web/data"},
        {from: "./assets/manifest/_headers", to: "./web"}
      ]
    }),
    new webpack.DefinePlugin(getDefinePluginConfig()), 
  ],
}