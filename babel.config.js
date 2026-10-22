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
            '@queries': './src/queries',
            '@lib': './src/lib',
            '@schemas': './src/schemas',
            '@navigation': './src/navigation',
            '@utils': './src/utils',
            '@models': './src/types',
            '@navigators': './src/navigators'
          },
        },
      ],
    ],
  };
};