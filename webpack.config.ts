import path from "path";
import { Configuration } from "webpack";

const config: Configuration = {
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              ["@babel/preset-react", { runtime: "automatic" }],
              ["@babel/preset-typescript", { runtime: "automatic" }],
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".jsx", ".ts", ".tsx", "..."],
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
};

export default config;
