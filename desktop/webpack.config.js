const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          },
          output: {
            comments: false
          }
        },
        extractComments: false
      })
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          name: 'common'
        }
      }
    }
  },
  plugins: [
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8
    })
  ],
  module: {
    rules: [
      {
        test: /\.(jpg|jpeg|png|gif|svg)$/,
        use: {
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: { progressive: true, quality: 65 },
            optipng: { enabled: false },
            pngquant: { quality: [0.65, 0.90], speed: 4 },
            gifsicle: { interlaced: false }
          }
        }
      }
    ]
  }
};
