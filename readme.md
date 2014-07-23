# css-sprite

[![NPM version](https://badge.fury.io/js/css-sprite.png)](http://badge.fury.io/js/css-sprite) [![Build Status](https://travis-ci.org/aslansky/css-sprite.png?branch=master)](https://travis-ci.org/aslansky/css-sprite) [![Coverage Status](https://coveralls.io/repos/aslansky/css-sprite/badge.png)](https://coveralls.io/r/aslansky/css-sprite) [![Dependencies](https://david-dm.org/aslansky/css-sprite.png)](https://david-dm.org/aslansky/css-sprite)

> A css sprite generator.

> Generates sprites and propper css files out of a directory of images.

> Supports retina sprites.

> Can inline base64 encoded sprites.

## Requirements

`css-sprite` requires [node-canvas](https://github.com/learnboost/node-canvas) which depends on [Cairo](http://cairographics.org/).

Please refer to the [installation guide](https://github.com/learnboost/node-canvas/wiki).

## Install

Install with [npm](https://npmjs.org/package/css-sprite)

```
npm install css-sprite --save
```

If you want to use `css-sprite` on your cli install with:

```
npm install css-sprite -g
```

## Command Line Interface

```
Usage: css-sprite <out> <src>... [options]

out     path of directory to write sprite file to
src     glob strings to find source images to put into the sprite

Options:
   -b, --base64           create css with base64 encoded sprite (css file will be written to <out>)
   -c, --css-image-path   http path to images on the web server (relative to css path or absolute path)  [../images]
   -n, --name             name of sprite file  [sprite.png]
   -p, --processor        output format of the css. one of css, less, sass, scss or stylus  [css]
   -t, --template         output template file, overrides processor option
   -r, --retina           generate both retina and standard sprites. src images have to be in retina resolution
   -s, --style            file to write css to, if ommited no css is written
   -w, --watch            continuously create sprite
   --margin               margin in px between tiles  [5]
   --orientation          orientation of the sprite image  [vertical]
   --prefix               prefix for the class name used in css (without .) [icon]
```

## Programatic usage
```
var sprite = require('css-sprite');
sprite.create(options, cb);
```

### Options
* **src:** Array or string of globs to find source images to put into the sprite.  [required]
* **out:** path of directory to write sprite file to  [process.cwd()]
* **base64:** when true instead of creating a sprite writes base64 encoded images to css (css file will be written to `<out>`)
* **cssPath:** http path to images on the web server (relative to css path or absolute)  [../images]
* **name:** name of the sprite file  [sprite.png]
* **processor:** output format of the css. one of css, less, sass, scss or stylus  [css]
* **template:** output template file, overrides processor option
* **retina:** generate both retina and standard sprites. src images have to be in retina resolution
* **style:** file to write css to, if omitted no css is written
* **margin:** margin in px between tiles  [5]
* **orientation:** orientation of the sprite image [vertical]
* **prefix:** prefix for the class name used in css (without .) [icon]


### Example
```
var sprite = require('css-sprite');
sprite.create({
  src: ['./src/img/*.png'],
  out: './dist/img'
  name: 'sprites.png',
  style: './dist/scss/_sprites.scss',
  cssPath: '../img',
  processor: 'scss'
}, function () {
  console.log('done');
});
```

## Usage with [Gulp](http://gulpjs.com)
```
var gulp = require('gulp');
var gulpif = require('gulp-if');
var sprite = require('css-sprite').stream;

// generate sprite.png and _sprite.scss
gulp.task('sprites', function () {
  return gulp.src('./src/img/*.png')
    .pipe(sprite({
      name: 'sprite.png',
      style: '_sprite.scss',
      cssPath: './img',
      processor: 'scss'
    }))
    .pipe(gulpif('*.png', gulp.dest('./dist/img/'), gulp.dest('./dist/scss/')))
});
// generate scss with base64 encoded images
gulp.task('base64', function () {
  return gulp.src('./src/img/*.png')
    .pipe(sprite({
      base64: true,
      style: '_base64.scss',
      processor: 'scss'
    }))
    .pipe(gulp.dest('./dist/scss/'));
});
```

Options to use `css-sprite` with [Gulp](http://gulpjs.com) are the same as for the `sprite.create` function with the exception of `src` and `out`.

## Usage with [Grunt](http://gruntjs.com)

Add `css-sprite` as a dependency to your grunt project and then use something like this in your `gruntfile.js`:

```
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    css_sprite: {
      options: {
        'cssPath': '../images',
        'processor': 'css',
        'orientation': 'vertical',
        'margin': 5
      },
      sprite: {
        options: {
          'style': 'dest/css/sprite.css'
        },
        src: ['src/images/*', 'src/images2/*'],
        dest: 'dest/images/sprite.png',
      },
      base64: {
        options: {
          'base64': true
        },
        src: ['src/images/*'],
        dest: 'dest/scss/base64.css',
      }
    }
  });

  // Load the plugin that provides the "css-sprite" task.
  grunt.loadNpmTasks('css-sprite');

  // Default task(s).
  grunt.registerTask('default', ['css_sprite']);
};
```

Options to use `css-sprite` with [Grunt](http://gruntjs.com) are the same as for the `sprite.create` function with the exception of `src` and `out`.


## Usage with [sass](http://sass-lang.com/) / [less](http://lesscss.org/) / [stylus](http://learnboost.github.io/stylus/)

#### [scss](http://sass-lang.com/) example

```
@import 'sprite'; // the generated style file (sprite.scss)

// camera icon (camera.png in src directory)
.icon-camera {
  @include sprite($camera);
}

// cart icon (cart.png in src directory)
.icon-cart {
  @include sprite($cart);
}
```

#### [sass](http://sass-lang.com/) example

```
@import 'sprite' // the generated style file (sprite.sass)

// camera icon (camera.png in src directory)
.icon-camera
  +sprite($camera)

// cart icon (cart.png in src directory)  
.icon-cart
  +sprite($cart)
```

#### [less](http://lesscss.org/) example

```
@import 'sprite'; // the generated style file (sprite.less)

// camera icon (camera.png in src directory)
.icon-camera {
  .sprite(@camera);
}

// cart icon (cart.png in src directory)
.icon-cart {
  .sprite(@cart);
}
```

#### [stylus](http://learnboost.github.io/stylus/) example

```
@import 'sprite' // the generated style file (sprite.styl)

// camera icon (camera.png in src directory)
.icon-camera
  sprite($camera)

// cart icon (cart.png in src directory)
.icon-cart
  sprite($cart)
```
