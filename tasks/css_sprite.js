/*
 * grunt-css-sprite
 * https://github.com/aslansky/grunt-css-sprite
 *
 * Copyright (c) 2014 Alexander Slansky
 * Licensed under the MIT license.
 */

'use strict';

var sprite = require('../index');
var path = require('path');

module.exports = function(grunt) {

  grunt.registerMultiTask('css_sprite', 'Grunt task for generating css sprites images and corresponding stylesheets.', function () {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      out: '',
      name: 'sprite',
      style: null,
      cssPath: '../images',
      format: 'png',
      processor: 'css',
      orientation: 'vertical',
      retina: false,
      margin: 5,
      prefix: 'icon',
      background: '#FFFFFF',
      sort: true,
      opacity: 0,
      interpolation: 'grid'
    });

    var done = this.async();
    this.files.forEach(function(f) {
      options.src = f.orig.src;
      options.name = path.basename(f.dest);
      options.out = path.dirname(f.dest);
      sprite.create(options, function () {
        grunt.log.writeln('File ' + f.dest + ' created.');
        done();
      });
    });

  });

};
