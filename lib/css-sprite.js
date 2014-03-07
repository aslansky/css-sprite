'use strict';

var es = require('event-stream');
var Canvas = require('canvas');
var lodash = require('lodash');
var path = require('path');
var json2css = require('json2css');
var File = require('vinyl');
var imageinfo = require('imageinfo');
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
        'img': (!opt.base64) ? img : null,
        'name': replaceExtension(file.relative, '').replace(/\/|\\/g, '-'),
        'x': (!opt.base64) ? (opt.orientation === 'vertical' ? opt.margin : ctxWidth + opt.margin) : 0,
        'y': (!opt.base64) ? (opt.orientation === 'vertical' ? ctxHeight + opt.margin: opt.margin) : 0,
        'width': img.width,
        'height': img.height,
        'total_width': img.width,
        'total_height': img.height,
        'image': (!opt.base64) ? path.join(opt.cssPath, opt.name) : 'data:' + imageinfo(file.contents).mimeType + ';base64,' + file.contents.toString('base64')
      });

      if (!opt.base64) {
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
    };

    var img = new Image();
    img.src = file.contents;
    if (img.complete) {
      queue(img);
    }
    else {
      img.onload = function () {
        queue(img);
      };
    }

  }

  function endStream () {
    if (sprites.length === 0) {
      return this.emit('end');
    }
    var canvas = new Canvas(ctxWidth, ctxHeight);
    if (!opt.base64) {
      var ctx = canvas.getContext('2d');
      lodash.each(sprites, function (sprite) {
        sprite.total_width = ctxWidth;
        sprite.total_height = ctxHeight;
        ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.width, sprite.height);
      });
    }
    if (opt.style || opt.base64) {
      var css = json2css(sprites, {'format': opt.processor});
      this.emit('data', new File({
        base: (!opt.base64) ? path.dirname(opt.style) : opt.out,
        path: (!opt.base64 || (opt.base64 && opt.style)) ? opt.style : path.join(opt.out, replaceExtension(opt.name, '.' + opt.processor)),
        contents: new Buffer(css)
      }));
    }
    if (!opt.base64) {
      this.emit('data', new File({
        base: opt.out,
        path: path.join(opt.out, opt.name),
        contents: new Buffer(canvas.toBuffer())
      }));
    }
    this.emit('end');
  }

  return es.through(queueImages, endStream);
};
