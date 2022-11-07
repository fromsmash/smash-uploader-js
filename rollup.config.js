import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import globals from 'rollup-plugin-node-globals';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';

export default [
    {
        input: 'dist/SmashUploader.js',
        output: {
            name: 'SmashUpload',
            file: 'dist/SmashUploader.js',
            format: 'cjs',
        },
        plugins: [
            json(),
            builtins(),
            resolve({
                preferBuiltins: false,
                browser: true,
            }),
            commonjs(),
            globals(),
            nodePolyfills(),
        ],
    },
    {
        input: 'dist/SmashUploader.js',
        output: {
            name: 'SmashUpload',
            file: 'dist/SmashUploader.min.js',
            format: 'iife',
            sourcemap: true,
            exports: 'named'
        },
        plugins: [
            json(),
            builtins(),
            resolve({
                preferBuiltins: false,
                browser: true,
            }),
            commonjs(), // 
            globals(),
            terser(),
        ],
    }
];
