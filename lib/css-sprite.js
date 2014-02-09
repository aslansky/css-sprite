'use strict';

var es = require('event-stream');
var Canvas = require('canvas');
var lodash = require('lodash');
var path = require('path');
var json2css = require('json2css');
var File = require('vinyl');
var replaceExtension = require('./replace-extension');
var Image = Canvas.Image;

module.exports = function (opt) {
  opt = lodash.extend({}, {name: 'sprite.png', margin: 5, processor: 'css', cssPath: '../images', orientation: 'vertical'}, opt);
  var sprites = [];
  var ctxHeight = 0;
  var ctxWidth = 0;

  function queueImages (file) {
    if (file.isNull()) {
      return; // ignore
    }

    if (file.isStream()) {
      return this.emit('error', new Error('Streaming not supported'));
    }

    var queue = function (img) {
      sprites.push({
        'img': img,
        'name': replaceExtension(file.relative, ''),
        'x': opt.orientation === 'vertical' ? opt.margin : ctxWidth + opt.margin,
        'y': opt.orientation === 'vertical' ? ctxHeight + opt.margin: opt.margin,
        'width': img.width,
        'height': img.height,
        'image': path.join(opt.cssPath, opt.name)
      });

      if (opt.orientation === 'vertical') {
        ctxHeight = ctxHeight + img.height + 2 * opt.margin;
        if (img.width + 2 * opt.margin > ctxWidth) {
          ctxWidth = img.width + 2 * opt.margin;
        }
      }
      else {
        ctxWidth = ctxWidth + img.width + 2 * opt.margin;
        if (img.height + 2 * opt.margin > ctxHeight) {
          ctxHeight = img.height + 2 * opt.margin;
        }
      }
    }

    var img = new Image();
    img.src = file.contents;
    if (img.complete) {
      queue(img);
    }
    else {
      img.onload = function () {
        queue(img);
      }
    }

  }

  function endStream () {
    if (sprites.length === 0) {
      return this.emit('end');
    }
    var canvas = new Canvas(ctxWidth, ctxHeight);
    var ctx = canvas.getContext('2d');
    lodash.each(sprites, function (sprite) {
      sprite.total_width = ctxWidth;
      sprite.total_height = ctxHeight;
      ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.width, sprite.height);
    });
    if (opt.style) {
      var css = json2css(sprites, {'format': opt.processor});
      this.emit('data', new File({
        base: path.dirname(opt.style),
        path: opt.style,
        contents: new Buffer(css)
      }));
    }
    this.emit('data', new File({
      base: opt.out,
      path: path.join(opt.out, opt.name),
      contents: new Buffer(canvas.toBuffer())
    }));
    this.emit('end');
  }

  return es.through(queueImages, endStream);
};
