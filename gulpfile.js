var gulp = require('gulp');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var less = require('gulp-less');
var babel = require('gulp-babel');
var webpack = require('gulp-webpack');
var watch = require('gulp-watch');
var webserver = require('gulp-webserver');
var jshint = require('gulp-jshint');
var path = require('path');

var assign = Object.assign || require('object.assign');
var stylish = require('jshint-stylish');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');

var ExtractTextPlugin = require("extract-text-webpack-plugin");


var config = {
    js: {
        entry: 'src/js/app.js',
        watch: 'src/**/*.{js,svg,png,jpg,less,css}',
        dist: 'dist',
    },

    markup: {
        src: 'src/*.html',
        watch: 'src/**/*.html',
        dist: 'dist',
    },

    images: {
        src: 'src/images/**/*.*',
        watch: 'src/images/**/*.*',
        dist: 'dist/images',
    },

    webpack: {
        output: {
            path: require("path").resolve("./dist"),
            filename: 'app.js',
            sourceMapFilename: '[file].map',
            publicPath: '/'
        },
        module: {
            loaders: [
                { test: /\.js$/, exclude: /node_modules|other_modules/, loader: "babel-loader"},
                {
                    test: /\.less$/,
                    loader: ExtractTextPlugin.extract("style-loader", 
                        "css-loader!less-loader!autoprefixer-loader?browsers=last 2 version")
                },
                { test: /\.(png|jpg|svg)$/, loader: 'url-loader?name=images/[name].[ext]&limit=100' }
            ]
        },
        resolve: {
            alias: {
                phaser       : path.join(__dirname, "other_modules/phaser/phaser.js"),
            }
        },
        plugins: [
            new ExtractTextPlugin("[name].css")
        ]
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
    }

};



gulp.task('clean', function() {
    return gulp.src([
            config.markup.dist,
            config.js.dist ])
        .pipe(vinylPaths(del));
});

gulp.task('markup', function() {
    return gulp.src(config.markup.src)
        .pipe(gulp.dest(config.markup.dist))
})

gulp.task('images', function() {
    return gulp.src(config.images.src)
        .pipe(gulp.dest(config.images.dist))
})

gulp.task('js', function() {
    return gulp.src(config.js.entry)
        .pipe(plumber())
        .pipe(babel(assign({}, config.babel, { modules:'common' })))
        .pipe(webpack(config.webpack))
        .pipe(gulp.dest(config.js.dist));
});

gulp.task('serve', ['default', 'watch'], function() {
    gulp.src('dist')
        .pipe(webserver({
            livereload: true,
        }));
});

gulp.task('watch', function() {
    gulp.watch(config.markup.watch, ['markup']);
    gulp.watch(config.js.watch, ['js']);
    gulp.watch(config.images.watch, ['images']);
});

gulp.task('default', ['js', 'markup', 'images'], function () {
});
