var gulp          = require('gulp'),
    browserSync   = require('browser-sync').create(),
    reload        = browserSync.reload,
    distDir       = './dist/',
    files         = ['index.html'];

gulp.task('html', function() {
  return gulp.src(files)
      .pipe(gulp.dest(distDir));
});

gulp.task('html-reload', ['html'], function() {
  reload();
})

gulp.task('default', ['html'], function() {
  browserSync.init([distDir+'*'], {
    server: distDir,
    port: 4000,
    notify: false,
    ui: {
      port: 4001
    }
  });

  gulp.watch(files, ['html-reload']);
});
