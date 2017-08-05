// through this file we can override the default cra configuration
// see: https://github.com/timarney/react-app-rewired
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = function override(config, env) {
  const copyWebpackPlugin = new CopyWebpackPlugin([{
    from: 'src/wasm/*.wasm',
    to: 'wasm/[name].wasm'
  }]);
  config.plugins.push(copyWebpackPlugin);

  return config;
}
