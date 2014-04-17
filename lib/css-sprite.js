'use strict';

var through2 = require('through2');
var Canvas = require('canvas');
var lodash = require('lodash');
var path = require('path');
var json2css = require('json2css');
var File = require('vinyl');
var imageinfo = require('imageinfo');
var replaceExtension = require('./replace-extension');
var Image = Canvas.Image;

// json2css template
json2css.addTemplate('sprite', require(path.join(__dirname, 'templates/sprite.js')));

module.exports = function (opt) {
  opt = lodash.extend({}, {name: 'sprite.png', margin: 5, processor: 'css', cssPath: '../images', orientation: 'vertical'}, opt);
  opt.styleExtension = (opt.processor === 'stylus') ? 'styl' : opt.processor;
  var sprites = [];
  var ctxHeight = 0;
  var ctxWidth = 0;

  function queue (file, img) {
    sprites.push({
      'img': img,
      'name': replaceExtension(file.relative, '').replace(/\/|\\|\ /g, '-'),
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

  function queueImages (file, enc, cb) {
    if (file.isNull()) {
      cb();
      return; // ignore
    }

    if (file.isStream()) {
      cb(new Error('Streaming not supported'));
      return; // ignore
    }
    var img = new Image();
    img.onload = function () {
      queue(file, img, cb);
      cb();
      return;
    };
    img.onerror = function (err) {
      console.log('Ignoring ' + file.relative + ' -> ' + err.toString());
      cb();
      return;
    };
    img.src = file.contents;
  }

  function createCanvas () {
    var canvas = new Canvas(ctxWidth, ctxHeight);
    var ctx = canvas.getContext('2d');
    lodash.each(sprites, function (sprite) {
      sprite.total_width = ctxWidth;
      sprite.total_height = ctxHeight;
      ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.width, sprite.height);
    });
    return canvas;
  }

  function createNonRetinaCanvas (retinaCanvas) {
    var width = Math.floor(retinaCanvas.width / 2);
    var height = Math.floor(retinaCanvas.height / 2)
    var canvas = new Canvas(width, height);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(retinaCanvas, 0, 0, width, height);
    return canvas;
  }

  function createStyle (sprite, retinaSprite) {
    if (retinaSprite) {
      sprites.unshift({
        name: retinaSprite.relative,
        type: 'retina',
        image: (!opt.base64) ? path.join(opt.cssPath, retinaSprite.relative) : 'data:' + imageinfo(retinaSprite.canvas.toBuffer()).mimeType + ';base64,' + retinaSprite.canvas.toBuffer().toString('base64'),
        total_width: sprite.canvas.width,
        total_height: sprite.canvas.height
      });
      lodash(sprites).each(function (sprite, i) {
        sprites[i].x = Math.floor(sprite.x / 2);
        sprites[i].y = Math.floor(sprite.y / 2);
        sprites[i].width = Math.floor(sprite.width / 2);
        sprites[i].height = Math.floor(sprite.height / 2);
      });
    }

    sprites.unshift({
      name: sprite.relative,
      type: 'sprite',
      image: (!opt.base64) ? path.join(opt.cssPath, sprite.relative) : 'data:' + imageinfo(sprite.canvas.toBuffer()).mimeType + ';base64,' + sprite.canvas.toBuffer().toString('base64'),
      total_width: sprite.canvas.width,
      total_height: sprite.canvas.height
    });
    return json2css(sprites, {'format': 'sprite', formatOpts: {'cssClass': opt.prefix, 'processor': opt.processor}});
  }

  function createSprite (cb) {
    var sprite, nonRetinaSprite, style;
    if (sprites.length === 0) {
      cb();
      return; // ignore
    }
    sprite = {
      base: opt.out,
      relative: opt.name,
      path: path.join(opt.out, opt.name),
      canvas: createCanvas()
    };

    if (opt.retina) {
      sprite.path = replaceExtension(sprite.path, '') + '-x2.png';
      sprite.relative = replaceExtension(sprite.relative, '') + '-x2.png';
      nonRetinaSprite = {
        base: opt.out,
        relative: opt.name,
        path: path.join(opt.out, opt.name),
        canvas: createNonRetinaCanvas(sprite.canvas)
      };
    }

    if (!opt.base64) {
      if (opt.retina) {
        this.push(new File({
          base: nonRetinaSprite.base,
          path: nonRetinaSprite.path,
          contents: new Buffer(nonRetinaSprite.canvas.toBuffer())
        }));
      }
      this.push(new File({
        base: sprite.base,
        path: sprite.path,
        contents: new Buffer(sprite.canvas.toBuffer())
      }));
    }

    if (opt.style || opt.base64) {
      style = opt.retina ? createStyle(nonRetinaSprite, sprite) : createStyle(sprite);
      this.push(new File({
        base: !opt.base64 ? path.dirname(opt.style) : opt.out,
        path: opt.style ? opt.style : path.join(opt.out, replaceExtension(opt.name, '.' + opt.styleExtension)),
        contents: new Buffer(style)
      }));
    }
    cb();
  }

  return through2.obj(queueImages, createSprite);
};
