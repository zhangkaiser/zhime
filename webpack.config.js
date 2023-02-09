
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
    options: "./src/options.ts",
    main: "./src/decoder-page.ts"
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
        {from: "./assets/html/main.html", to: "./main.html"},
        {from: "./assets/html/index.html", to: "./web/index.html"},
        {from: "./librime/out/worker", to: "./web/decoders"},
        {from: "./librime/out/data", to: "./web/data"},
        {from: "./assets/manifest/_headers", to: "./web"}
      ]
    }),
    new webpack.DefinePlugin(getDefinePluginConfig()), 
  ],
}