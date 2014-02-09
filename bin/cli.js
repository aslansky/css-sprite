#!/usr/bin/env node
'use strict';

var sprite = require('../index');
var opts = require('nomnom')
  .option('src', {
    position: 0,
    abbr: 's',
    required: true,
    list: true,
    metavar: 'GLOB',
    help: 'glob strings to find source images to put into the sprite'
  })
  .option('out', {
    abbr: 'o',
    required: true,
    metavar: 'DIR',
    default: process.cwd(),
    help: 'path of directory to write sprite file to'
  })
  .option('name', {
    abbr: 'n',
    default: 'sprite.png',
    help: 'name of the sprite file'
  })
  .option('style', {
    abbr: 'st',
    help: 'file to write css to, if ommited no css is written'
  })
  .option('cssPath', {
    abbr: 'c',
    full: 'css-image-path',
    default: '../images',
    help: 'http path to images on the web server (relative to css path or absolute)'
  })
  .option('processor', {
    abbr: 'p',
    choices: ['css', 'less', 'sass', 'scss', 'stylus'],
    default: 'css',
    help: 'output format of the css. one of css, less, sass, scss or stylus'
  })
  .option('orientation', {
    choices: ['vertical', 'horizontal'],
    default: 'vertical',
    help: 'orientation of the sprite image'
  })
  .option('margin', {
    default: 5,
    help: 'margin in px between tiles'
  })
  .script('css-sprite')
  .parse();

sprite.create(opts);
