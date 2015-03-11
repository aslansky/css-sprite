#!/usr/bin/env node
'use strict';

var sprite = require('../index');
// var gaze = require('gaze');
var fs = require('vinyl-fs');
var opts = require('nomnom')
  .option('out', {
    position: 0,
    required: true,
    metavar: 'DIR',
    default: process.cwd(),
    help: 'path of directory to write sprite file to'
  })
  .option('src', {
    position: 1,
    required: true,
    list: true,
    metavar: 'GLOB',
    help: 'glob strings to find source images to put into the sprite'
  })
  .option('base64', {
    abbr: 'b',
    flag: true,
    help: 'create css with base64 encoded sprite (css file will be written to <out>)'
  })
  .option('cssPath', {
    abbr: 'c',
    full: 'css-image-path',
    default: '../images',
    help: 'http path to images on the web server (relative to css path or absolute path)'
  })
  .option('format', {
    abbr: 'f',
    choices: ['png', 'jpg'],
    default: 'png',
    help: 'output format of the sprite (png or jpg)'
  })
  .option('name', {
    abbr: 'n',
    default: 'sprite',
    help: 'name of sprite file without file extension '
  })
  .option('processor', {
    abbr: 'p',
    choices: ['css', 'less', 'sass', 'scss', 'stylus'],
    default: 'css',
    help: 'output format of the css. one of css, less, sass, scss or stylus'
  })
  .option('template', {
    abbr: 't',
    help: 'output template file, overrides processor option'
  })
  .option('retina', {
    abbr: 'r',
    flag: true,
    help: 'generate both retina and standard sprites. src images have to be in retina resolution'
  })
  .option('style', {
    abbr: 's',
    help: 'file to write css to, if omitted no css is written'
  })
  .option('watch', {
    abbr: 'w',
    flag: true,
    help: 'continuously create sprite'
  })
  .option('background', {
    default: '#FFFFFF',
    help: 'background color of the sprite in hex'
  })
  .option('cachebuster', {
    choices: ['random'],
    default: false,
    help: 'appends a "cache buster" to the background image in the form "?<...>" (random)'
  })
  .option('margin', {
    default: 4,
    help: 'margin in px between tiles'
  })
  .option('interpolation', {
    choices: ['nearest-neighbor', 'moving-average', 'linear', 'grid', 'cubic', 'lanczos'],
    dedault: 'grid',
    help: 'Interpolation algorithm used when scaling retina images (nearest-neighbor|moving-average|linear|grid|cubic|lanczos)'
  })
  .option('opacity', {
    default: 0,
    help: 'background opacity of the sprite. defaults to 0 when png or 100 when jpg'
  })
  .option('orientation', {
    choices: ['vertical', 'horizontal', 'binary-tree'],
    default: 'vertical',
    help: 'orientation of the sprite image (vertical|horizontal|binary-tree)'
  })
  .option('prefix', {
    help: 'prefix for the class name used in css (without .)'
  })
  .option('no-sort', {
    flag: true,
    help: 'disable sorting of layout'
  })
  .script('css-sprite')
  .parse();

if (opts.watch) {
  if (opts['no-sort']) {
    opts.sort = false;
  }
  console.log('Watching for file changes ...');
  fs.watch(opts.src, function () {
    sprite.create(opts, function () {
      console.log('> Sprite created in ' + opts.out);
    });
  });
}
else {
  if (opts['no-sort']) {
    opts.sort = false;
  }

  sprite.create(opts);
}
