module.exports = function (config) {
  const configuration = {
    basePath: '.',
    frameworks: ['browserify', 'jasmine'],
    files: [
      { pattern: 'dist/**/*.js', included: true, watched: true }
    ],
    preprocessors: {
      'dist/**/*.js': ['browserify']
    },
    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false
  };

  config.set(configuration);
};
