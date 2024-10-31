const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const path = require('path')

module.exports = {
    entry: {
        main: './src/index.ts',
    },

    output: {
        assetModuleFilename: '[hash][ext]',
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]-[contenthash:6].js',
        publicPath: '/',
        clean: true,
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },

    resolve: {
        extensions: ['.js', '.css'],
    },

    mode: 'development',

    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: process.env.PORT ?? 3000,
        hot: false,
        client: false,
        historyApiFallback: true,
    },

    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
        }),
    ],

    devtool: 'source-map',
}
