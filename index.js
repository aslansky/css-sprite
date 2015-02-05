'use strict';

var sprite = require('./lib/css-sprite');
var through2 = require('through2');
var vfs = require('vinyl-fs');
var fs = require('graceful-fs');
var mkdirp = require('mkdirp');
var path = require('path');
var replaceExtension = require('./lib/replace-extension');
var _ = require('lodash');
var noop = function () {};

var writeFile = function (file, enc, cb) {
  var stream = this;
  mkdirp(file.base, function () {
    fs.writeFile(file.path, file.contents, function () {
      stream.push(file);
      cb();
    });
  });
};

var defaults = {
  src: null,
  out: '',
  name: 'sprite',
  style: null,
  format: 'png',
  cssPath: '../images',
  processor: 'css',
  template: null,
  orientation: 'vertical',
  retina: false,
  background: '#FFFFFF',
  margin: 4,
  opacity: 0,
  sort: true
};

module.exports = {
  /*
   *  Creates sprite and css file
   */
  create: function (o, cb) {
    if (!o.src) {
      throw new Error('glob missing');
    }
    if (!o.out) {
      throw new Error('output dir missing');
    }

    var opts = _.extend({}, defaults, o);
    if (opts.style && path.basename(opts.style).indexOf('.') === -1) {
      opts.style = path.join(opts.style, replaceExtension(opts.name, '.' + opts.processor));
    }
    vfs.src(opts.src)
      .pipe(sprite(opts))
      .pipe(through2.obj(writeFile))
      .on('data', noop)
      .on('end', function () {
        if (_.isFunction(cb)) {
          cb();
        }
      });
  },
  /*
   *  Takes a vinyl-fs Readable/Writable stream of images
   *  returns a Readable/Writable stream of vinyl files of the sprite and css file
   */
  stream: function (o) {
    var opts = _.extend({}, defaults, o);
    return sprite(opts);
  }
};
