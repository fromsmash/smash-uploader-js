const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = {
    mode: 'production',
    entry: './src/SmashUploader.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: "tsconfig.browser.json"
                    }
                }],
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
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            extractComments: false,
        })],
    },
};
