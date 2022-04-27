const path = require("path")
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "src"),
    filename: ".build/index.js"
  },
  target: 'node',
  plugins: [
    new NodePolyfillPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  }
};