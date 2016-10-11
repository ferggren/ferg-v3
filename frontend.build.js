'use strict';

let path                = require('path');
let webpack             = require('webpack');
let ExtractTextPlugin   = require('extract-text-webpack-plugin');
let WebpackDevServer    = null; // require later

// Modes: production dev dev-server profile
const NODE_ENV      = process.env.NODE_ENV || 'production';
const ROOT_PATH     = path.join(__dirname, '/frontend');
const PUBLIC_PATH   = '/assets/';
const BUILD_PATH    = path.join(__dirname, '/public' + PUBLIC_PATH);

const DEV_SERVER_PORT       = process.env.DEV_SERVER_PORT || 8081;
const DEV_SERVER_HOST       = process.env.DEV_SERVER_HOST || 'ferg.dev';
const DEV_SERVER_PROXY_PORT = process.env.DEV_SERVER_PROXY_PORT || 8080;
const DEV_SERVER_PROXY_HOST = process.env.DEV_SERVER_PROXY_HOST || 'ferg.dev';

let site_sections = {
    'site': {

    },
    'admin': {
        admin: ['admin'],
    },
};

let config = [];

for (let section in site_sections) {
    let entry       = site_sections[section];
    let build_path  = BUILD_PATH + section + '/';
    let public_path = PUBLIC_PATH + section + '/';

    let section_config = {
        context: ROOT_PATH,

        entry,

        resolve: {
            root: ROOT_PATH,
            extensions: ['', '.js', '.jsx', '.css', '.sass', '.scss']
        },

        output: {
            path: build_path,
            filename: '[name].js',
            chunkFilename: '[id].js?[hash]',
            publicPath: public_path,
        },

        devtool: (new RegExp(/^dev(-server)?$/).test(NODE_ENV)) ? 'cheap-module-eval-source-map' : null,

        module: {
            loaders: [{
                test: /\.jsx?$/,
                include: ROOT_PATH,
                loader: 'babel',
                exclude: '/node_modules/',
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
            },
            {
                test: /\.(scss|sass)$/,
                loader: ExtractTextPlugin.extract('style', 'css?minimize!sass?includePaths[]='+ROOT_PATH),
            },
            {
                test: /\.gif$/,
                loader: 'url-loader?limit=4096&mimetype=image/gif'
            },
            {
                test: /\.jpg$/,
                loader: 'url-loader?limit=4096&mimetype=image/jpg'
            },
            {
                test: /\.png$/,
                loader: 'url-loader?limit=4096&mimetype=image/png'
            },
            {
                test: /\.svg/,
                loader: 'url-loader?limit=4096&mimetype=image/svg+xml'
            },
            {
                test: /\.(woff|woff2|ttf|eot)/,
                loader: 'url-loader?limit=1'
            },
            ]
        },

        plugins: [
            new webpack.NoErrorsPlugin(),

            new webpack.DefinePlugin({
                'NODE_ENV': JSON.stringify((new RegExp(/^dev(-server)?$/).test(NODE_ENV) ? 'dev' : 'production')),
                
                // for react
                'process.env':{
                    'NODE_ENV': JSON.stringify((new RegExp(/^dev(-server)?$/).test(NODE_ENV) ? 'dev' : 'production')),
                },
            }),

            new webpack.optimize.CommonsChunkPlugin({
                 name: section + "-common",
                 minChunks: 3,
            }),

            new ExtractTextPlugin(section + '.css', {
                allChunks: true,
                disable: (new RegExp(/^dev(-server)?$/).test(NODE_ENV)),
            }),
        ],
    };

    // Additional config for production
    // UglifyJsPlugin & DedupePlugin
    if (NODE_ENV == 'production') {
        section_config.plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                warnings:     false,
                drop_console: false,
                comments:     false,
                sourceMap:    false,
                output: {
                    comments: false
                },
                compressor: {
                    warnings: false
                }
            })
        );

        section_config.plugins.push(
            new webpack.optimize.DedupePlugin()
        );
    }

    // Additional config for dev-server
    // HotModuleReplacementPlugin & adding dev-server to all entry points
    if (NODE_ENV == 'dev-server') {
        section_config.plugins.push(
            new webpack.HotModuleReplacementPlugin()
        );

        function push_webpack_client(entry) {
            if (typeof entry == 'object' && !Array.isArray(entry)) {
                let keys = Object.keys(entry);
                for (let key in keys) {
                    key = keys[key];
                    entry[key] = push_webpack_client(entry[key]);
                }

                return entry
            }

            if (typeof entry == 'object' && Array.isArray(entry)) {
                entry.unshift('webpack/hot/dev-server');
                entry.unshift('webpack-dev-server/client?/');
                return entry;
            }

            if (typeof entry == 'string') {
                return entry = [
                    'webpack-dev-server/client?/',
                    'webpack/hot/dev-server',
                    entry
                ];
            }

            return entry;
        }

        section_config.entry = push_webpack_client(section_config.entry);
    }

    config.push(section_config);
}

// dev mode
// run webpack in watch mode
if (NODE_ENV == 'dev') {
    let compiler = webpack(config);
    compiler.watch(
        {
            aggregateTimeout: 300,
            poll: true,
        },
        function(err, stats) {
            if (err) {
                throw new err;
            }

            console.log(stats.toString({
                chunks: false,
                colors: true,
            }));
        }
    );
}

// dev-server mode
// run DevServer on specified ports
else if (NODE_ENV == 'dev-server') {
    let WebpackDevServer = require('webpack-dev-server');

    let compiler = webpack(config);
    let server = new WebpackDevServer(compiler, {
        hot: true,
        compress: true,
        proxy: {
            "**": "http://"+DEV_SERVER_PROXY_HOST+":" + DEV_SERVER_PROXY_PORT,
        },
        quiet: false,
        noInfo: false,
        publicPath: PUBLIC_PATH,
        stats: { colors: true },
    });
    server.listen(DEV_SERVER_PORT);
}

// profile mode
// dump json profile
else if (NODE_ENV == 'profile') {
    let compiler = webpack(config);
    compiler.run(function (err, stats) {
        if (err) {
            throw new err;
        }

        console.log("%j", stats.toJson());
    });
}

// production mode
else {
    let compiler = webpack(config);
    compiler.run(function (err, stats) {
        if (err) {
            throw new err;
        }

        console.log(stats.toString({
            chunks: false,
            colors: true,
        }));
    });
}