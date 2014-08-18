'use strict';

var through2 = require('through2');
var Canvas = require('canvas');
var lodash = require('lodash');
var path = require('path');
var json2css = require('json2css');
var File = require('vinyl');
var imageinfo = require('imageinfo');
var layout = require('layout');
var replaceExtension = require('./replace-extension');
var Image = Canvas.Image;

// json2css template
json2css.addTemplate('sprite', require(path.join(__dirname, 'templates/sprite.js')));

module.exports = function (opt) {
  opt = lodash.extend({}, {name: 'sprite.png', margin: 5, processor: 'css', cssPath: '../images', orientation: 'vertical'}, opt);
  opt.styleExtension = (opt.processor === 'stylus') ? 'styl' : opt.processor;
  var ctxHeight = 0;
  var ctxWidth = 0;
  var layoutOrientation = opt.orientation === 'vertical' ? 'top-down' : opt.orientation === 'horizontal' ? 'left-right' : 'binary-tree';
  var layer = layout(layoutOrientation);

  function queue (file, img) {
    var spriteName = replaceExtension(file.relative, '').replace(/\/|\\|\ /g, '-');
    layer.addItem({
      height: img.height + 2 * opt.margin,
      width: img.width + 2 * opt.margin,
      meta: {
        name: spriteName,
        img: img,
        image: path.join(opt.cssPath, opt.name)
      }
    });
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

  function createCanvas (layerInfo) {
    var canvas = new Canvas(layerInfo.width, layerInfo.height);
    var ctx = canvas.getContext('2d');
    lodash.each(layerInfo.items, function (sprite, index) {
      ctx.drawImage(sprite.meta.img, sprite.x + opt.margin, sprite.y + opt.margin, sprite.width - opt.margin * 2, sprite.height - opt.margin * 2);
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

  function createStyle (layerInfo, sprite, retinaSprite) {
    var sprites = [];
    lodash.each(layerInfo.items, function (sprite, index) {
      sprites.push({
        'name': sprite.meta.name,
        'x': sprite.x + opt.margin,
        'y': sprite.y + opt.margin,
        'width': sprite.width - opt.margin * 2,
        'height': sprite.height - opt.margin * 2,
        'total_width': layerInfo.width,
        'total_height': layerInfo.height,
        'image': sprite.meta.image
      });
    });

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

    return json2css(sprites, {'format': 'sprite', formatOpts: {'cssClass': opt.prefix, 'processor': opt.processor, 'template': opt.template}});
  }

  function createSprite (cb) {
    var layerInfo = layer.export();
    var sprite, nonRetinaSprite, style;
    if (layerInfo.items.length === 0) {
      cb();
      return; // ignore
    }
    sprite = {
      base: opt.out,
      relative: opt.name,
      path: path.join(opt.out, opt.name),
      canvas: createCanvas(layerInfo)
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
      style = opt.retina ? createStyle(layerInfo, nonRetinaSprite, sprite) : createStyle(layerInfo, sprite);
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
