const DotenvWebpack = require("dotenv-webpack"); // 이 부분이 필요합니다!
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/i, // 이미지 파일 처리
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [
      ".jsx",
      ".js",
      ".json",
      ".css",
      ".scss",
      ".jpg",
      ".jpeg",
      ".png",
    ],
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@public": path.resolve(__dirname, "public"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new DotenvWebpack({
      path: ".env.local",
      systemvars: true,
    }),
  ],
  devServer: {
    static: "./dist",
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true, // 모든 요청을 index.html로 리디렉션
  },
  mode: "development",
};
