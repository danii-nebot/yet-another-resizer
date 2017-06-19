// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  const configuration = {
    basePath: '.',
    frameworks: ['jasmine', 'karma-typescript'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-typescript')
    ],
    files: [
      { pattern: 'src/**/*.ts', included: true, watched: true }
    ],
    exclude: [
    ],
    preprocessors: {
      'src/**/*.ts': [ 'karma-typescript' ]
    },
    reporters: ['progress', 'karma-typescript'],
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false
  };

  config.set(configuration);
};
