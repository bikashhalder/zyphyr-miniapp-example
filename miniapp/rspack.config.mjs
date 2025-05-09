import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as Repack from '@callstack/repack';
import {withZephyr} from 'zephyr-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USE_ZEPHYR = Boolean(process.env.ZC);

const STANDALONE = Boolean(process.env.STANDALONE);

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */

export default env => {
  const {
    mode,
    platform = process.env.PLATFORM,
    bundleFilename = undefined,
    sourceMapFilename = undefined,
    assetsPath = undefined,
  } = env;
  const config = {
    mode,
    context: __dirname,
    entry: './index.js',
    resolve: {
      ...Repack.getResolveOptions(),
    },
    output: {
      uniqueName: 'org-mini-app',
    },
    module: {
      rules: [
        ...Repack.getJsTransformRules(),
        ...Repack.getAssetTransformRules({inline: false}),
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
          './App': './App.tsx',
        },
        shared: {
          react: {
            singleton: true,
            version: '19.0.0',
            eager: STANDALONE,
          },
          'react-native': {
            singleton: true,
            version: '0.78.2',
            eager: STANDALONE,
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
  return withZephyr()(config);
};
