const path = require('path');
const _root = path.resolve(__dirname, '.');

/**
 * Webpack Plugins
 */
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/**
 * Helpers
 */
const helpers = {
    /**
     * Get root project path
     */
    root: function (args) {
        args = Array.prototype.slice.call(arguments, 0);
        return path.join.apply(path, [_root].concat(args));
    },

    /**
     * Get app version
     */
    appVersion: require("./package.json").version
};

/**
 * Webpack configuration
 *
 * See: https://webpack.js.org/configuration/
 */
module.exports = (options = {}, argv = {}) => {
    // Set mode
    if (argv.mode) options.mode = argv.mode;
    options.mode = options.mode !== 'development' ? 'production' : 'development';

    // Output path
    options.outputPath = options.outputPath ? options.outputPath : helpers.root('dist/' + options.mode + '-v' + helpers.appVersion);

    return {
        /**
         * Instructs webpack to target a specific environment.
         *
         * See: https://webpack.js.org/concepts/targets/
         */
        target: "web",

        /**
         * Providing the mode configuration option tells webpack to use its built-in optimizations accordingly.
         *
         * See: https://webpack.js.org/concepts/mode/
         */
        mode: options.mode,

        /**
         * These options change how modules are resolved.
         *
         * See: https://webpack.js.org/configuration/resolve/
         */
        resolve: {
            /**
             * Automatically resolve certain extensions.
             *
             * See: https://webpack.js.org/configuration/resolve/#resolve-extensions
             */
            extensions: ['.ts', '.js', '.json'],

            /**
             * Tell webpack what directories should be searched when resolving modules.
             *
             * See: https://webpack.js.org/configuration/resolve/#resolve-modules
             */
            modules: [
                helpers.root("src"), helpers.root("node_modules")
            ],

            /**
             * Create aliases to import or require certain modules more easily.
             *
             * See: https://webpack.js.org/configuration/resolve/#resolve-alias
             * See: https://github.com/vuejs/vue/tree/dev/dist#explanation-of-build-files
             */
            alias: {
                'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
            }
        },

        /**
         * The entry point for the bundle
         *
         * See: http://webpack.github.io/docs/configuration.html#entry
         */
        entry: {
            'popup': helpers.root('src', 'popup.ts')
        },

        /**
         * Options affecting the output of the compilation.
         *
         * See: https://webpack.js.org/concepts/output/
         * See: https://webpack.js.org/configuration/output/
         */
        output: {
            /**
             * Specifies the name of each output file on disk.
             * IMPORTANT: You must not specify an absolute path here!
             *
             * See: https://webpack.js.org/configuration/output/#output-filename
             */
            filename: '[name].[chunkhash].js',

            /**
             * The output directory as absolute path (required).
             *
             * See: https://webpack.js.org/configuration/output/#output-path
             */
            path: options.outputPath
        },

        /**
         * Configuration regarding modules.
         *
         * See: https://webpack.js.org/configuration/module/
         */
        module: {
            /**
             * Rules for modules (configure loaders, parser options, etc.)
             *
             * See: https://webpack.js.org/configuration/module/#module-rules
             */
            rules: [
                /**
                 * TypeScript loader for webpack
                 *
                 * See: https://github.com/TypeStrong/ts-loader
                 */
                {
                    test: /\.ts$/,
                    use: [{
                        loader: "ts-loader",
                        options: {}
                    }]
                },

                /**
                 * SASS Loader.
                 *
                 * See: https://github.com/webpack-contrib/sass-loader
                 */
                {
                    test: /\.s?[ac]ss$/,
                    use: [
                        /*options.mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',*/
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'postcss-loader', // Run post css actions
                            options: {
                                sourceMap: true,
                                /* plugins: (loader) => {
                                     let plugins = [ // post css plugins, can be exported to postcss.config.js
                                         require('precss')
                                     ];
                                     if (options.mode === 'production') {
                                         plugins.push(require('autoprefixer'));
                                         plugins.push();
                                     }
                                     return plugins;
                                 }*/
                                plugins: options.mode === 'production' ? [
                                    require('cssnano')({
                                        preset: 'default'
                                    })
                                ] : []
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true,
                                includePaths: [
                                    helpers.root('src')
                                ]
                            }
                        }
                    ]
                },

                /**
                 * Exports HTML as string.
                 *
                 * See: https://github.com/webpack-contrib/html-loader
                 */
                {
                    test: /\.html$/,
                    loader: 'html-loader'
                }
            ]
        },

        /**
         * Add additional plugins to the compiler.
         *
         * See: http://webpack.github.io/docs/configuration.html#plugins
         */
        plugins: [
            /**
             * This plugin extract CSS into separate files.
             * It creates a CSS file per JS file which contains CSS.
             *
             * See: https://github.com/webpack-contrib/mini-css-extract-plugin
             */
            new MiniCssExtractPlugin({
                filename: "[name].[contenthash].css"
            }),

            /**
             * The HtmlWebpackPlugin simplifies creation of HTML files to serve your webpack bundles.
             *
             * See: https://webpack.js.org/plugins/html-webpack-plugin/
             * See: https://github.com/jantimon/html-webpack-plugin#options
             * See: https://github.com/kangax/html-minifier#options-quick-reference
             */
            new HtmlWebpackPlugin({
                template: helpers.root('src', 'popup.html'),
                filename: "popup.html",
                minify: options.mode === 'production'
            }),

            /**
             * Automatically load modules instead of having to import or require them everywhere.
             *
             * See: https://webpack.js.org/plugins/provide-plugin/
             */
            new ProvidePlugin({
                jQuery: 'jquery'
            }),

            /**
             * This Webpack plugin allows you to copy, archive (.zip/.tar/.tar.gz), move, delete files and directories before and after builds
             *
             * See: https://github.com/gregnb/filemanager-webpack-plugin
             */
            new FileManagerPlugin({
                onEnd: {
                    copy: [
                        {
                            source: helpers.root('assets') + '/*.*',
                            destination: options.outputPath
                        }
                    ]
                }
            }),

            /**
             * Webpack Bundle Analyzer
             *
             * See: https://github.com/webpack-contrib/webpack-bundle-analyzer
             */
            new BundleAnalyzerPlugin({
                analyzerMode: "static",
                openAnalyzer: false,
                reportFilename: helpers.root('reports', options.mode + '-v' + helpers.appVersion + '.html')
            })
        ],

        /**
         * Since version 4 webpack runs optimizations for you depending on the chosen mode,
         * still all optimizations are available for manual configuration and overrides.
         *
         * See: https://webpack.js.org/configuration/optimization/
         */
        optimization: {},

        /**
         * Choose a style of source mapping to enhance the debugging process.
         * These values can affect build and rebuild speed dramatically.
         *
         * See: https://webpack.js.org/configuration/devtool/
         */
        devtool: 'cheap-module-source-map'
    };
};
