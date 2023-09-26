/**
 * https://facebook.github.io/metro/docs/configuration
 * @format
 * @type {import('metro-config').MetroConfig}
 */
const config = {};
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// module.exports = {
//   transformer: {
//     getTransformOptions: async () => ({
//       transform: {
//         experimentalImportSupport: false,
//         inlineRequires: true,
//       },
//     }),
//   },
// };

module.exports = mergeConfig(getDefaultConfig(__dirname), config);