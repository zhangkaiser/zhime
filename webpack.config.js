
const path = require("path");
const WebpackCopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    background: './src/chromeos-ui.ts'
  },
  mode: "development",
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
    })
  ],
}