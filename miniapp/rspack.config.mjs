import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as Repack from '@callstack/repack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const STANDALONE = Boolean(process.env.STANDALONE);

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */

export default env => {
  const {mode, platform = process.env.PLATFORM} = env;
  return {
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
        ...Repack.getAssetTransformRules({inline: true}),
      ],
    },
    plugins: [
      new Repack.RepackPlugin(),
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
    ],
  };
};