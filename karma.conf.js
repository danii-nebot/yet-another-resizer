// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  const configuration = {
    basePath: '.',
    frameworks: ['browserify', 'jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-browserify')
    ],
    customLaunchers: {
      // chrome setup for travis CI using chromium
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox', '--headless']
      }
    },
    files: [
      { pattern: 'dist/*.spec.js', included: true, watched: true }
    ],
    exclude: [
    ],
    preprocessors: {
      'dist/*.spec.js': [ 'browserify' ]
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    // browserify configuration
    browserify: {
      debug: true,
      // transform: [ 'brfs', 'browserify-shim' ]
    }
  };

  // CI
  if (process.env.TRAVIS) {
    configuration.singleRun = true;
    configuration.browsers = ['Chrome_travis_ci'];
    configuration.customLaunchers = {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    };
  }

  config.set(configuration);
};
