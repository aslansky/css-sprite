# css-sprite

[![NPM version](https://badge.fury.io/js/css-sprite.png)](http://badge.fury.io/js/css-sprite) [![Build Status](https://travis-ci.org/aslansky/css-sprite.png?branch=master)](https://travis-ci.org/aslansky/css-sprite) [![Coverage Status](https://coveralls.io/repos/aslansky/css-sprite/badge.png)](https://coveralls.io/r/aslansky/css-sprite) [![Dependencies](https://david-dm.org/aslansky/css-sprite.png)](https://david-dm.org/aslansky/css-sprite)

> A css sprite generator.

> Generates a sprite file and the propper css file out of a directory with images

## Requirements

`css-sprite` requires [node-canvas](https://github.com/learnboost/node-canvas) which depends on [Cairo](http://cairographics.org/).

Please refer to the [installation guide](https://github.com/learnboost/node-canvas/wiki).

## Install

Install with [npm](https://npmjs.org/package/css-sprite)

```
npm install css-sprite --save
```

If you want to use `css-sprite` on your cli use:

```
npm install css-sprite -g
```

## Command Line Interface

```
Usage: css-sprite <src>... [options]

src     glob strings to find source images to put into the sprite

Options:
   -o DIR, --out DIR      path of directory to write sprite file to  [process.cwd()]
   -n, --name             name of the sprite file  [sprite.png]
   -st, --style           file to write css to, if ommited no css is written
   -c, --css-image-path   http path to images on the web server (relative to css path or absolute)  [../images]
   -p, --processor        output format of the css. one of css, less, sass, scss or stylus  [css]
   --orientation          orientation of the sprite image  [vertical]
   --margin               margin in px between tiles  [5]
```

## Programatic usage
```
var sprite = require('css-sprite');
sprite.create(options, cb);
```

### Options
* **src:** Array or string of globs to find source images to put into the sprite.  [required]
* **out:** path of directory to write sprite file to  [process.cwd()]
* **name:** name of the sprite file  [sprite.png]
* **style:** file to write css to, if ommited no css is written
* **cssPath:** http path to images on the web server (relative to css path or absolute)  [../images]
* **processor:** output format of the css. one of css, less, sass, scss or stylus  [css]
* **orientation:** orientation of the sprite image  [vertical]
* **margin:** margin in px between tiles  [5]

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

gulp.task('sprites', function () {
  return gulp.src('./src/img/*.png')
    .pipe(sprite({
      name: 'sprites.png',
      style: '_sprites.scss',
      cssPath: './img',
      processor: 'scss'
    }))
    .pipe(gulpif('*.png', gulp.dest('./dist/img/')))
    .pipe(gulpif('*.scss', gulp.dest('./dist/scss/')));
});
```

Options to use `css-sprite` with gulp are the same as for the `sprite.create` function with the exception of `src` and `out`.
