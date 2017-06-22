module.exports = function (config) {
  const configuration = {
    basePath: '.',
    frameworks: ['browserify', 'jasmine'],
    files: [
      { pattern: 'dist/**/*.spec.js', included: true, watched: true }
    ],
    preprocessors: {
      'dist/**/*.spec.js': ['browserify']
    },
    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false
  };

  if (process.env.NODE_ENV === 'coverage') {
    configuration.frameworks = ['jasmine', 'karma-typescript'];
    configuration.files = [{ pattern: 'src/**/*.ts', included: true, watched: true }];
    configuration.preprocessors = {
      'src/**/*.ts': ['karma-typescript']
    };
    configuration.reporters = ['progress', 'karma-typescript'];
    configuration.karmaTypescriptConfig = {
      reports: {
        lcovonly: {
            directory: './',
            subdirectory: 'coverage',
            filename: 'lcov.info'
        },
        html: {
          directory: './',
          subdirectory: 'coverage'
        }
      }
    };
  }

  config.set(configuration);
};
