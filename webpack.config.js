const path = require('path');
const plugin = require('./plugin');

module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        path: path.resolve(__dirname, 'bin'),
        filename: 'plugin.js'
    },
    mode: 'development',
    plugins: [
        new plugin({
            from: './src/icons',
            to: './dist/snippets',
            outputFilename: 'icons.library'
        })
    ]
}
