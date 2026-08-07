module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@components': './src/components',
            '@context': './src/context',
            '@screens': './src/screens',
            '@services': './src/services',
            '@repositories': './src/repositories',
            '@utils': './src/utils',
            '@models': './src/types',
          },
        },
      ],
    ],
  };
};