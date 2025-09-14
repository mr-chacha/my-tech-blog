const DotenvWebpack = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
    clean: true,
    publicPath: "/",
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
        test: /\.(png|jpe?g|gif|webp|svg)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".jsx", ".js", ".json", ".css", ".scss", ".jpg", ".jpeg", ".png"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@public": path.resolve(__dirname, "public"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public",
          to: ".",
          globOptions: {
            ignore: ["**/index.html"],
          },
        },
      ],
    }),
    new DotenvWebpack({
      path: ".env",
      systemvars: true,
      safe: false,
    }),
  ],
  devServer: {
    static: "./dist",
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
    proxy: [
      {
        context: ["/api"],
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    ],
  },
  mode: "production",
};
