import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  entry: './server.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
    clean: true
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
            presets: ['@babel/preset-env']
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
