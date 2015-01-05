var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');
var notify = require("gulp-notify");

var scriptsDir = './app/js/';
var buildDir = './dist';

var htmlFiles = 'app/**/*.html';

// Create a transformation function that uses reactify
// and adds ES6 support
function reactifyES6(file) {
    return reactify(file, {'es6': true});
}

function notifyGeneratedFile() {
    return notify({
        message: "Generated file: <%= file.relative %> @ <%= options.date %>",
        templateOptions: {
            date: new Date()
        }
    })
}

// Based on: http://blog.avisi.nl/2014/04/25/how-to-keep-a-fast-build-with-browserify-and-reactjs/
function buildScript(file, watch) {

    var browserifyOptions = watchify.args;
    browserifyOptions.entries = [scriptsDir + '/' + file];
    browserifyOptions.debug = true;
    
    var bundler = watch ? watchify(browserify(browserifyOptions)) : browserify(browserifyOptions);
    
    // Add the reactify transformation
    bundler.transform(reactifyES6);
  
    function rebundle() {
        var stream = bundler.bundle();
        return stream.on('error', 
            notify.onError({
                title: "Compile Error",
                message: "<%= error.message %>"
            }))
            .pipe(source(file))
            .pipe(gulp.dest(buildDir + '/'))
            .pipe(notifyGeneratedFile())
            ;
    }
    bundler.on('update', function() {
        rebundle();
        gutil.log('Rebundle...');
    });
    return rebundle();
}

function initWatch(files, task) {
    gulp.start(task);
    gulp.watch(files, [task]);
}

gulp.task('html', function () {
    return gulp.src(htmlFiles).
        pipe(gulp.dest(buildDir));
});

gulp.task('build', function() {
    initWatch(htmlFiles, 'html');
    return buildScript('app.js', false);
});


gulp.task('default', ['build'], function() {
    initWatch(htmlFiles, 'html');
    return buildScript('app.js', true);
});

