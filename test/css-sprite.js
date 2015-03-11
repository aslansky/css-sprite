'use strict';

var should = require('should');
var sprite = require('../lib/css-sprite');
var path = require('path');
var vfs = require('vinyl-fs');
var through2 = require('through2');
var lwip = require('lwip');
var noop = function () {};

require('mocha');

describe('css-sprite (lib/css-sprite.js)', function () {
  it('should return a object stream with a sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        file.path.should.equal(path.join('dist', 'img', 'sprites.png'));
        file.relative.should.equal('sprites.png');
        lwip.open(file.contents, 'png', function (err, img) {
          should(err).not.be.ok;
          img.width().should.equal(520);
          img.height().should.equal(1064);
          cb();
        });
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should return a object stream with a bigger sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites',
        margin: 20
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        lwip.open(file.contents, 'png', function (err, img) {
          should(err).not.be.ok;
          img.width().should.equal(552);
          img.height().should.equal(1224);
          cb();
        });
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should return a object stream with a horizontal sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites',
        orientation: 'horizontal'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        file.path.should.equal(path.join('dist', 'img', 'sprites.png'));
        file.relative.should.equal('sprites.png');
        lwip.open(file.contents, 'png', function (err, img) {
          should(err).not.be.ok;
          img.width().should.equal(1064);
          img.height().should.equal(520);
          cb();
        });
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should return a object stream with a sprite in binary-tree format', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites',
        orientation: 'binary-tree'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        file.path.should.equal(path.join('dist', 'img', 'sprites.png'));
        file.relative.should.equal('sprites.png');
        lwip.open(file.contents, 'png', function (err, img) {
          should(err).not.be.ok;
          img.width().should.equal(656);
          img.height().should.equal(656);
          cb();
        });
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should return a object stream with a sprite and a css file', function (done) {
    var png, css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites',
        style: './dist/css/sprites.css'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        if (file.relative.indexOf('png') > -1) {
          png = file;
        }
        else {
          css = file;
        }
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        png.should.be.ok;
        png.path.should.equal(path.join('dist', 'img', 'sprites.png'));
        png.relative.should.equal('sprites.png');
        css.should.be.ok;
        css.path.should.equal('./dist/css/sprites.css');
        css.relative.should.equal('sprites.css');
        css.contents.toString('utf-8').should.containEql('.icon-camera');
        css.contents.toString('utf-8').should.containEql('.icon-cart');
        css.contents.toString('utf-8').should.containEql('.icon-command');
        css.contents.toString('utf-8').should.containEql('.icon-font');
        done();
      });
  });
  it('should return a object stream with a sprite and a css file (using a custom template)', function (done) {
    var png, css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites',
        style: './dist/css/sprites.css',
        template: './test/template/template.mustache'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        if (file.relative.indexOf('png') > -1) {
          png = file;
        }
        else {
          css = file;
        }
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        png.should.be.ok;
        png.path.should.equal(path.join('dist', 'img', 'sprites.png'));
        png.relative.should.equal('sprites.png');
        css.should.be.ok;
        css.path.should.equal('./dist/css/sprites.css');
        css.relative.should.equal('sprites.css');
        css.contents.toString('utf-8').should.containEql('.icon-camera');
        css.contents.toString('utf-8').should.containEql('.icon-cart');
        css.contents.toString('utf-8').should.containEql('.icon-command');
        css.contents.toString('utf-8').should.containEql('.icon-font');
        css.contents.toString('utf-8').should.containEql('custom: \'template\';');
        done();
      });
  });
  it('should return a object stream with retina sprite, normal sprite and css with media query', function (done) {
    var png = [], css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites',
        style: './dist/css/sprites.css',
        retina: true
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        if (file.relative.indexOf('png') > -1) {
          png.push(file);
        }
        else {
          css = file;
        }
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        css.contents.toString('utf-8').should.containEql('@media');
        png.length.should.equal(2);
        png[0].relative.should.equal('sprites.png');
        png[1].relative.should.equal('sprites@2x.png');
        lwip.open(png[0].contents, 'png', function (err, normal) {
          should(err).not.be.ok;
          lwip.open(png[1].contents, 'png', function (err, retina) {
            should(err).not.be.ok;
            retina.width().should.equal(normal.width() * 2);
            retina.height().should.equal(normal.height() * 2);
            done();
          });
        });
      });
  });
  it('should return a object stream with a css file with custom class names', function (done) {
    var css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites',
        style: './dist/css/sprites.css',
        prefix: 'test-selector'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        if (file.relative.indexOf('css') > -1) {
          css = file;
        }
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        css.should.be.ok;
        css.path.should.equal('./dist/css/sprites.css');
        css.relative.should.equal('sprites.css');
        css.contents.toString('utf-8').should.containEql('.test-selector');
        done();
      });
  });
  it('should return a css file with an absolute background img URL, if applicable', function (done) {
    var css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites',
        style: './dist/css/sprites.css',
        cssPath: 'http://foo.bar'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        if (file.relative.indexOf('css') > -1) {
          css = file;
        }
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        css.should.be.ok;
        css.path.should.equal('./dist/css/sprites.css');
        css.relative.should.equal('sprites.css');
        css.contents.toString('utf-8').should.containEql('background-image: url(\'http://foo.bar/sprites.png\')');
        done();
      });
  });
  it('should include a random cache buster hash on the background-image, if desired', function (done) {
    var css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites',
        style: './dist/css/sprites.css',
        cachebuster: 'random'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        if (file.relative.indexOf('css') > -1) {
          css = file;
        }
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        css.should.be.ok;
        css.path.should.equal('./dist/css/sprites.css');
        css.relative.should.equal('sprites.css');
        css.contents.toString('utf-8').should.match(/background-image: url\('..\/sprites.png\?[0-9a-f]{40}'\)/);
        done();
      });
  });
  it('should return a object stream with a sprite and a scss file', function (done) {
    var png, css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites',
        processor: 'scss',
        style: './dist/css/sprites.scss'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        if (file.relative.indexOf('png') > -1) {
          png = file;
        }
        else {
          css = file;
        }
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        png.should.be.ok;
        png.path.should.equal(path.join('dist', 'img', 'sprites.png'));
        png.relative.should.equal('sprites.png');
        css.should.be.ok;
        css.path.should.equal('./dist/css/sprites.scss');
        css.relative.should.equal('sprites.scss');
        css.contents.toString('utf-8').should.containEql('$camera');
        css.contents.toString('utf-8').should.containEql('$cart');
        css.contents.toString('utf-8').should.containEql('$command');
        css.contents.toString('utf-8').should.containEql('$font');
        done();
      });
  });
  it('should return a object stream with a css file with base64 encoded sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        base64: true,
        out: './dist/css'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        file.relative.should.equal('sprite.css');
        file.contents.toString('utf-8').should.containEql('data:image/png;base64');
        cb();
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should return a object stream with a css with media query and base64 encoded sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        base64: true,
        retina: true
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        file.relative.should.equal('sprite.css');
        file.contents.toString('utf-8').should.containEql('@media');
        file.contents.toString('utf-8').should.containEql('data:image/png;base64');
        cb();
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should do nothing when no files match', function (done) {
    var file = false;
    vfs.src('./test/fixtures/empty/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites'
      }))
      .pipe(through2.obj(function (f, cb) {
        file = file;
        cb();
      }))
      .on('data', noop)
      .on('end', function () {
        file.should.not.ok;
        done();
      });
  });
  it('should throw error when file stream', function (done) {
    vfs.src('./test/fixtures/**', {buffer: false})
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites'
      }))
      .on('error', function (err) {
        err.toString().should.equal('Error: Streaming not supported');
        done();
      });
  });
  it('should return an object stream with a binary-tree sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites',
        orientation: 'binary-tree'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        file.path.should.equal(path.join('dist', 'img', 'sprites.png'));
        file.relative.should.equal('sprites.png');
        lwip.open(file.contents, 'png', function (err, img) {
          should(err).not.be.ok;
          img.width().should.equal(656);
          img.height().should.equal(656);
          cb();
        });
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should return a object stream with a jpg sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites',
        format: 'jpg'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        file.path.should.equal(path.join('dist', 'img', 'sprites.jpg'));
        file.relative.should.equal('sprites.jpg');
        lwip.open(file.contents, 'jpg', function (err, img) {
          should(err).not.be.ok;
          img.width().should.equal(520);
          img.height().should.equal(1064);
          cb();
        });
      }))
      .on('data', noop)
      .on('end', done);
  });
});
