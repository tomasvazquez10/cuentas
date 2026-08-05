module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@components': './src/components',
            '@context': './src/context',
            '@screens': './src/screens',
            '@services': './src/services',
            '@types': './src/types',
            '@utils': './src/utils',
          },
        },
      ],
    ],
  };
};
