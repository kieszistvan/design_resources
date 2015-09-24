var del = require('del');
var gulp = require('gulp');
var sass = require('gulp-sass');
var jade = require('gulp-jade');
var babel = require('gulp-babel');
var path = require('path');
var exec = require('child_process').exec;
var Tail = require('tail').Tail;
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var glob = require('glob');

var files = {
  forever: {
    log: 'forever.log',
    err: 'forever.err'
  },
  server: {
    src: path.join(__dirname, '/server/**/*.js'),
    dest: path.join(__dirname, '/__dist/server'),
    main: path.join(__dirname, '/__dist/server/index.js')
  },
  sass: {
    src: path.join(__dirname, '/sass/**/*.*'),
    dest: path.join(__dirname, '/__dist/css')
  },
  jade: {
    src: path.join(__dirname, '/jade/**/*.jade'),
    dest: path.join(__dirname, '/__dist/jade')
  },
  fonts: {
    src: path.join(__dirname, '/fonts/**/*'),
    dest: path.join(__dirname, '/__dist/fonts')
  },
  client: {
    src: path.join(__dirname, '/client/**/*.js'),
    dest: path.join(__dirname, '/__dist/client')
  }
};

/**
 *  Server tasks
 */
gulp.task('server:compile', function () {
  return gulp.src(files.server.src)
    .pipe(babel())
    .pipe(gulp.dest(files.server.dest));
});

gulp.task('server:clean', function () {
  return del(path.join(files.server.dest, '/**/*'));
});

gulp.task('server:compile', ['server:clean', 'server:compile'], function () {

});

var execute = function execute(operation, callback) {
  var foreverBin = path.join(__dirname, 'node_modules/.bin/forever');

  var child = exec(foreverBin + ' ' + operation +
    ' -a' +
    ' -o ' + files.forever.log +
    ' -e ' + files.forever.err +
    ' --minUptime ' + 1000 +
    ' --spinSleepTime ' + 1000 +
    ' ' + files.server.main,
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
  var watcher = gulp.watch(files.server.src, ['server:clean', 'server:compile']);
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

  readTail(files.forever.log);
  readTail(files.forever.err);
});

/**
 * Client
 */
gulp.task('client:clean', function () {
  return del(files.client.dest);
});

gulp.task('client:compile', ['client:clean'], function () {
  var entries = glob.sync('client/**/index.js');
  console.log(entries);
  browserify({
      entries: entries
    })
    .transform(babelify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(files.client.dest));
});

gulp.task('client:watch', function () {
  gulp.watch(files.client.src, ['client:compile']);
});

/**
 *  Sass tasks
 */
gulp.task('sass:clean', function () {
  return del(files.sass.dest);
});

gulp.task('sass:compile', function () {
  gulp.src(files.sass.src)
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(gulp.dest(files.sass.dest));
});

gulp.task('sass:watch', function () {
  gulp.watch(files.sass.src, ['sass:compile']);
});

/**
 *  Jade tasks
 */
gulp.task('jade:clean', function () {
  return del(files.jade.dest);
});

gulp.task('jade:copy', ['jade:clean'], function () {
  gulp.src(files.jade.src)
    .pipe(gulp.dest(files.jade.dest));
});

gulp.task('jade:watch', function () {
  gulp.watch(files.jade.src, ['jade:copy']);
});

/**
 * Font tasks
 */
gulp.task('fonts:clean', function () {
  return del(files.fonts.dest);
});

gulp.task('fonts:copy', ['fonts:clean'], function () {
  gulp.src(files.fonts.src)
    .pipe(gulp.dest(files.fonts.dest));
});

gulp.task('fonts:watch', function () {
  gulp.watch('fonts/**', ['fonts:copy']);
});

/**
 *  Simples
 */
gulp.task('default', ['sass:compile', 'jade:copy', 'fonts:copy', 'server:compile', 'client:compile']);

gulp.task('watch', ['sass:watch', 'jade:watch', 'server:watch', 'client:watch']);
