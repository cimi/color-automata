// through this file we can override the default cra configuration
// see: https://github.com/timarney/react-app-rewired
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = function override(config, env) {
  // see: https://github.com/ballercat/wasm-loader/issues/3 for more details
  const wasmExtensionRegExp = /\.wasm$/;

  config.resolve.extensions.push('.wasm');
  // make the file loader ignore wasm files
  const fileLoader = config.module.rules
    .find(rule => rule.loader && rule.loader.endsWith(`${path.sep}file-loader${path.sep}index.js`));
  fileLoader.exclude.push(wasmExtensionRegExp);

  // and add a dedicated loader for them
  config.module.rules.push({
    test: wasmExtensionRegExp,
    include: path.resolve(__dirname, "src"),
    use: [{loader: require.resolve('wasm-loader'), options: {}}]
  });

  const copyWebpackPlugin = new CopyWebpackPlugin([{
    from: 'src/wasm/*.wasm',
    to: 'wasm/[name].wasm'
  }]);
  config.plugins.push(copyWebpackPlugin);

  return config;
}
