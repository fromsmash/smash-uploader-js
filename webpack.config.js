const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

const server = {
    mode: 'production',
    entry: './src/SmashUploader.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: path.resolve(__dirname, 'node_modules'),
            },
        ],
    },
    devtool: 'source-map',
    externals: [
        nodeExternals(),
    ],
    output: {
        path: __dirname + '/dist/',
        filename: 'SmashUploader.js',
        libraryTarget: 'umd',
        globalObject: 'this',
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    target: 'node',
};

const browser = {
    mode: 'production',
    entry: './src/SmashUploader.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: path.resolve(__dirname, 'node_modules'),
            },
        ],
    },
    output: {
        path: __dirname + '/dist/',
        filename: 'SmashUploader.browser.js',
        libraryTarget: 'umd',
        globalObject: 'this',
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            "fs": false,
            "path": false,
        },
    },
    target: 'web',
};

module.exports = [server, browser];