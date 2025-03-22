module.exports = {
    // Other configurations
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
          exclude: [
            /@firebase\/auth/,  // Exclude Firebase Auth source maps
          ]
        }
      ]
    }
  };
  