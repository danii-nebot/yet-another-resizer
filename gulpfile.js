var gulp          = require('gulp'),
    browserSync   = require('browser-sync').create(),
    reload        = browserSync.reload,
    distDir       = './dist/',
    demoDir       = './demo/',
    jsFiles       = [distDir + 'resizer.js'];

gulp.task('copy-scripts', function() {
  return gulp.src(jsFiles)
      .pipe(gulp.dest(demoDir + 'js/'));
});

gulp.task('reload', function() {
  reload();
})

gulp.task('reload-scripts', ['copy-scripts'], function() {
  reload();
})

gulp.task('default', ['copy-scripts'], function() {
  browserSync.init([distDir+'*'], {
    server: demoDir,
    port: 4000,
    notify: false,
    ui: {
      port: 4001
    }
  });

  gulp.watch(jsFiles, ['reload-scripts']);
  gulp.watch(demoDir + '*.*', ['reload'])
});
