// webpack.config.js
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as Repack from '@callstack/repack';
import {withZephyr} from 'zephyr-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USE_ZEPHYR = Boolean(process.env.ZC);
const STANDALONE = Boolean(process.env.STANDALONE);

export default env => {
  const {
    mode = 'production',
    platform = 'ios', // or 'android'
    bundleFilename = 'index.bundle',
    sourceMapFilename = 'index.map',
    assetsPath = path.resolve(__dirname, 'dist/assets'),
  } = env;

  const config = {
    mode,
    context: __dirname,
    entry: './index.js',
    resolve: {
      ...Repack.getResolveOptions(),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      uniqueName: 'org-mini-app',
      filename: '[name].js',
    },
    module: {
      rules: [
        ...Repack.getJsTransformRules(),
        ...Repack.getAssetTransformRules({inline: false}), // Emit physical assets
      ],
    },
    plugins: [
      new Repack.RepackPlugin({
        platform,
        output: {
          bundleFilename,
          sourceMapFilename,
          assetsPath,
        },
      }),
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'miniapp',
        filename: 'miniapp.container.js.bundle',
        dts: false,
        exposes: {
          './App': './src/App.tsx',
        },
        shared: {
          react: {singleton: true, eager: STANDALONE, version: '18.2.0'},
          'react-native': {
            singleton: true,
            eager: STANDALONE,
            version: '0.73.0',
          },
        },
      }),
      new Repack.plugins.HermesBytecodePlugin({
        enabled: mode === 'production',
        test: /\.(js)?bundle$/,
        exclude: /index.bundle$/,
      }),
    ],
  };

  return withZephyr()(config); // <-- Wrap AFTER all plugins
};
