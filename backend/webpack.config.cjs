const path = require('path');

module.exports = {
  mode: 'production',
  entry: './server.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
    clean: true,
    library: {
      type: 'commonjs2'
    }
  },
  experiments: {
    topLevelAwait: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  node: 'current'
                },
                modules: 'commonjs'
              }]
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  externals: {
    // Exclude node_modules from bundle
    'express': 'commonjs express',
    'cors': 'commonjs cors',
    'morgan': 'commonjs morgan',
    'dotenv': 'commonjs dotenv',
    'bcryptjs': 'commonjs bcryptjs',
    'path': 'commonjs path',
    'url': 'commonjs url',
    'jsonwebtoken': 'commonjs jsonwebtoken',
    'multer': 'commonjs multer',
    'mysql2': 'commonjs mysql2'
  }
};
