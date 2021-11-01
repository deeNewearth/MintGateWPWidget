const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = (env, options) => {

  console.log(`Webpack 'mode': ${options.mode}`);

  var config ={
    entry: './src/index.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      plugins: [new TsconfigPathsPlugin({/* options: see below */ })]
    },
    plugins: [

      new NodePolyfillPlugin()
    ],
    output: {
      filename: 'mint-verifier.js',
      path: path.resolve(__dirname, '../plugin/public/js/dist'),
      publicPath: '/wp-content/plugins/mintgate-verifier/public/js/dist/'
    },
  };

  if("development" == options.mode){
    config.devtool = 'inline-source-map';
  }
  
  return config;

}