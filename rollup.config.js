import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
export default {
    // 核心选项
    input: './src/Ad.js',     // 必须
    // external: [],
    // plugins,

    // 额外选项
    // onwarn,

    // danger zone
    // acorn,
    context: 'window',
    // moduleContext: 'window',
    // legacy,

    output: [
        {  // 必须 (如果要输出多个，可以是一个数组)
            // 核心选项
            file: './dist/adForGame.js',    // 必须
            format: 'umd',  // 必须 cjs umd iife amd
            name: 'AFG',
            exports: 'named',
            // globals: {
            //     'eventemitter3': 'EventEmitter',
            // },

            // 额外选项
            //   paths,
            //   banner,
            //   footer,
            //   outro,
            //   sourcemap,
            //   sourcemapFile,
            //   interop,

        },
    ],

    plugins: [
        nodeResolve({
            jsnext: true,
            main: true
        }),
        commonjs({
            // non-CommonJS modules will be ignored, but you can also
            // specifically include/exclude files
            // these values can also be regular expressions
            include: 'src/**',

            // search for files other than .js files (must already
            // be transpiled by a previous plugin!)
            // extensions: ['.js'],  // Default: [ '.js' ]

            // if true then uses of `global` won't be dealt with by this plugin
            // ignoreGlobal: false,  // Default: false

            // if false then skip sourceMap generation for CommonJS modules
            sourceMap: false,  // Default: true

            // explicitly specify unresolvable named exports
            // (see below for more details)

            // sometimes you have to leave require statements
            // unconverted. Pass an array containing the IDs
            // or a `id => boolean` function. Only use this
            // option if you know what you're doing!
            // ignore: ['conditional-runtime-dependency']
        })
    ]
};