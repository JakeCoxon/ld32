var gulp = require('gulp');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var less = require('gulp-less');
var babel = require('gulp-babel');
var webpack = require('gulp-webpack');
var watch = require('gulp-watch');
var webserver = require('gulp-webserver');
var jshint = require('gulp-jshint');

var assign = Object.assign || require('object.assign');
var stylish = require('jshint-stylish');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');


var config = {
    js: {
        entry: 'src/js/app.js',
        watch: 'src/js/**/*.js',
        dist: 'dist',
    },

    markup: {
        src: 'src/*.html',
        watch: 'src/**/*.html',
        dist: 'dist',
    },

    styles: {
        src: 'src/css/main.less',
        watch: 'src/css/**/*.less',
        dist: 'dist'
    },

    webpack: {
        output: {
            filename: 'app.js',
            sourceMapFilename: '[file].map'
        },
        module: {
            loaders: [
                { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
            ]
        }
    },

    babel: {
        filename: '',
        filenameRelative: '',
        blacklist: [],
        whitelist: [],
        modules: '',
        sourceMap: false,
        sourceMapName: '',
        sourceRoot: '',
        moduleRoot: '',
        moduleIds: false,
        experimental: false,
        format: {
            comments: false,
            compact: false,
            indent: {
                parentheses: true,
                adjustMultilineComment: true,
                style: "  ",
                base: 0
            }
        }
    },

    less: {
        // Array of paths to be used for @import directives
        paths: [ 'src/css/' ],
        plugins: [
            new LessPluginAutoPrefix({
                browsers: ["> 5%"]
            })
        ]
    }

};



gulp.task('clean', function() {
    return gulp.src([
            config.markup.dist,
            config.js.dist,
            config.styles.dist ])
        .pipe(vinylPaths(del));
});

gulp.task('markup', function() {
    return gulp.src(config.markup.src)
        .pipe(gulp.dest(config.markup.dist))
})

gulp.task('js', function() {
    return gulp.src(config.js.entry)
        .pipe(babel(assign({}, config.babel, { modules:'common' })))
        .pipe(webpack(config.webpack))
        .pipe(gulp.dest(config.js.dist));
});

gulp.task('styles', function() {
    return gulp.src(config.styles.src)
        .pipe(less(config.less))
        .pipe(gulp.dest(config.styles.dist))
});

gulp.task('serve', ['watch'], function() {
    gulp.src('dist')
        .pipe(webserver({
            livereload: true,
        }));
});

gulp.task('watch', function() {
    gulp.watch(config.markup.watch, ['markup']);
    gulp.watch(config.js.watch, ['js']);
    gulp.watch(config.styles.watch, ['styles']);
});

gulp.task('default', ['js', 'markup', 'styles'], function () {
});
