const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/index.js",
    output: {
        filename: '[name].js',
        publicPath: '/',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    optimization: {
        minimize: false,
        minimizer: [
            new TerserPlugin({ extractComments: false })
        ]
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'matter test',
            template: path.resolve(__dirname, 'src') + '/index.html', // template file
            filename: 'index.html', // output file
          }),
    ],
    devServer: {
        historyApiFallback: true,
        static: path.resolve(__dirname, 'public'),
        open: true,
        compress: true,
        hot: true,
        port: 8080,
    }
}