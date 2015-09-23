var del = require('del');
var gulp = require('gulp');
var sass = require('gulp-sass');
var jade = require('gulp-jade');
var babel = require('gulp-babel');
var path = require('path');
var exec = require('child_process').exec;
var Tail = require('tail').Tail;

var logFile = {
  log: 'forever.log',
  err: 'forever.err'
};

/**
 *
 *  Server tasks
 *
 */
gulp.task('server:compile', function () {
  return gulp.src('server/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/server'));
});

gulp.task('server:clean', function () {
  return del('dist/server/**/*');
});

gulp.task('server', ['server:clean', 'server:compile'], function () {

});

var execute = function execute(operation, callback) {
  var foreverBin = path.join(__dirname, 'node_modules/.bin/forever');

  var child = exec(foreverBin + ' ' + operation +
    ' -a' +
    ' -o ' + logFile.log +
    ' -e ' + logFile.err +
    ' --minUptime ' + 1000 +
    ' --spinSleepTime ' + 1000 +
    ' ./dist/server/index.js',
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error) {
        console.log('exec error: ' + error);
      }

      if (callback) {
        callback();
      }
    });

};

var readTail = function readTail(file) {
  var tail = new Tail(file);

  tail.on('line', function (data) {
    console.log(data);
  });

  tail.on('error', function (error) {
    console.log('ERROR: ', error);
  });
};


gulp.task('server:watch', function () {
  execute('start');
  var watcher = gulp.watch('server/**/*.js', ['server:clean', 'server:compile']);
  watcher.on('change', function (event) {
    execute('restart');
  });

  ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
    'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
  ].forEach(function (element, index, array) {
    process.on(element, function () {
      execute('stop', function () {
        process.exit(1);
      });
    });
  });

  readTail(logFile.log);
  readTail(logFile.err);
});

/**
 *
 *  Sass tasks
 *
 */
gulp.task('sass:clean', function () {
  return del('dist/css');
});

gulp.task('sass', ['sass:clean'], function () {
  gulp.src('sass/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('sass/**/*.scss', ['sass']);
});

/**
 *
 *  Jade tasks
 *
 */
gulp.task('jade:clean', function () {
  return del('dist/page');
});

gulp.task('jade', ['jade:clean'], function () {
  gulp.src('jade/**/*.jade')
    .pipe(gulp.dest('dist/jade'));
});

gulp.task('jade:watch', function () {
  gulp.watch('jade/**/*.jade', ['jade']);
});

/**
 *
 * Font tasks
 *
 */
gulp.task('fonts:clean', function () {
  return del('dist/fonts');
});

gulp.task('fonts', ['fonts:clean'], function () {
  gulp.src('fonts/**/*.*')
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('fonts:watch', function () {
  gulp.watch('fonts/**', ['fonts']);
});

/**
 *
 *  Simples
 *
 */
gulp.task('default', ['sass', 'jade', 'fonts', 'server']);

gulp.task('watch', ['sass:watch', 'jade:watch', 'server:watch']);
