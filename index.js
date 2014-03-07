'use strict';

var sprite = require('./lib/css-sprite');
var es = require('event-stream');
var vfs = require('vinyl-fs');
var gfs = require('graceful-fs');
var mkdirp = require('mkdirp');
var path = require('path');
var replaceExtension = require('./lib/replace-extension');
var _ = require('lodash');

var writeFile = function (file, cb) {
  mkdirp(file.base, function () {
    gfs.writeFile(file.path, file.contents, cb);
  });
};

var defaults = {
  src: null,
  out: '',
  name: 'sprite.png',
  style: null,
  cssPath: '../images',
  processor: 'css',
  orientation: 'vertical',
  margin: 5
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
      .pipe(es.map(writeFile))
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
