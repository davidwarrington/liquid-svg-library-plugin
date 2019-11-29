const path = require('path');
const fs = require('fs-extra');
const {RawSource} = require('webpack-sources');

const PLUGIN_NAME = 'SVG Icon Library Plugin';

module.exports = class SVGIconLibraryPlugin {
    constructor(options = {}) {
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.emit.tapPromise(PLUGIN_NAME, this.addSVGs.bind(this));
    }

    async addSVGs(compilation) {
        const files = await fs.readdir(this.options.from); // Files in from directory
        const compilationOutput = compilation.compiler.outputPath; // Webpack output destination

        compilation.contextDependencies.add(this.options.from);

        return Promise.all(
            files.map(async file => {
                const fileLocation = path.resolve(this.options.from, file);
                const fileStat = await fs.stat(fileLocation);

                if (fileStat.isFile() && path.extname(file) === '.svg') {
                    const pathToSVG = path.resolve(this.options.from, file);
                    return [
                        path.basename(file, '.svg'),
                        await fs.readFile(pathToSVG, 'utf-8')
                    ];
                }
            })
        )
        .then(response => {
            const outputKey = this._getOutputKey(compilationOutput);
            const template = `{%- case icon -%}\n{{ svgs }}\n{%- endcase -%}`;
            const svgs = response.map(([icon, markup]) => `\n{%- when '${icon}' -%}\n${markup.trim()}`);
            compilation.assets[outputKey] = new RawSource(template.replace(/{{ svgs }}/, svgs.join('')));
        });
    }

    _getOutputKey(compilationOutput) {
        const { outputFilename } = this.options;
        const relativeOutputPath = path.relative(compilationOutput, this.options.to);

        return path.join(relativeOutputPath, `${outputFilename}.liquid`);
    }
}
