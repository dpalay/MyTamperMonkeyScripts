const path = require('path');
const glob = require('glob');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');

class AddHeaderPlugin {
  constructor() {}

  apply(compiler) {
    compiler.hooks.emit.tapAsync('AddHeaderPlugin', (compilation, callback) => {
      const files = glob.sync('./src/**/index.ts?(x)');
      files.forEach((file) => {
        const folderName = path.dirname(file).split(path.sep).slice(1).join(path.sep);
        const outputFolderName = path.dirname(file).split(path.sep).join('_').replace(/^src_/, '');
        const headerFilePath = path.join(__dirname, 'src', folderName, 'header.txt');
        const headerContent = fs.readFileSync(headerFilePath, 'utf-8');
        const outputFile = outputFolderName + '.user.js';
        const outputFilePath = path.join(compiler.options.output.path, outputFile);
        const existingFileContent = compilation.assets[outputFile].source();
        const newFileContent = headerContent + '\n' + existingFileContent;
        compilation.assets[outputFile] = {
          source: () => newFileContent,
          size: () => newFileContent.length
        };
      });
      callback();
    });
  }
}

module.exports = {
  mode: 'production', // or 'development' if you need sourcemaps
  entry: () => {
    const entries = {};
    glob.sync('./src/**/index.ts*').forEach((file) => {
      const folderList = path.dirname(file).split(path.sep).join('_');
      const outputName = `${folderList.replace(/^src_/, '')}.user.js`; // Remove "src_" from the filename
      entries[outputName] = './' + file; // Add './' prefix to the file path
    });
    return entries;
  },
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.txt$/,
        use: 'file-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new AddHeaderPlugin(),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx']
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: true,
            braces: true,
            wrap_iife: true, 
            indent_start: 0,
            indent_level: 2,
            keep_quoted_props: true,
            semicolons: false
          }
          , mangle: false
        },
        extractComments: false,
      }),
    ],
  },
};
