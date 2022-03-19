const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const loader = require('sass-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const devServer = (isDev) =>
  !isDev
    ? {}
    : {
        devServer: {
          open: true,
          port: 9000,
          static: {
            directory: path.join(__dirname, 'public'),
          },
        },
      };

const esLintPlugin = (isDev) => (isDev ? [] : [new ESLintPlugin({ extensions: ['ts', 'js'] })]);

module.exports = ({ development }) => ({
  mode: development ? 'development' : 'production',
  devtool: development ? 'inline-source-map' : false,
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|svg|mp3)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /.json$/,
        type: 'asset/resource',
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    ...esLintPlugin(development),
    new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
    new HTMLWebpackPlugin({
      template: './src/index.html',
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new CopyPlugin({
      patterns: [
        { from: './src/assets/img', to: './public/img' },
        { from: './src/assets/sound', to: './public/sound' },
      ],
    }),
  ],
  ...devServer(development),
});
