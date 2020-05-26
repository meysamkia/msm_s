const generateConfig = (option) => {
  const config = {
    output: {
      filename: '[name].js'
    },
    mode: option ? 'production' : 'development',
    module: {
      rules: []
    },
    externals: {
      jquery: 'jQuery'
    }
  }

  if (option) {
    config.module.rules.push(
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    )

    config.optimization = {
      splitChunks: {
        chunks: 'all',
        minSize: 5000
      }
    }
  }
  return config
}

module.exports = generateConfig
