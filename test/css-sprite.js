'use strict';

var should = require('should');
var sprite = require('../lib/css-sprite');
var path = require('path');
var vfs = require('vinyl-fs');
var es = require('event-stream');
var Canvas = require('canvas');
var Image = Canvas.Image;

require('mocha');

describe('css-sprite (lib/css-sprite.js)', function () {
  it('should return a object stream with a sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png'
      }))
      .pipe(es.map(function (file, cb) {
        var img = new Image();
        img.src = file.contents;
        file.path.should.equal('dist/img/sprites.png');
        file.relative.should.equal('sprites.png');
        img.width.should.equal(56);
        img.height.should.equal(125);
        cb();
      }))
      .on('end', done);
  });
  it('should return a object stream with a bigger sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png',
        margin: 20
      }))
      .pipe(es.map(function (file, cb) {
        var img = new Image();
        img.src = file.contents;
        img.width.should.equal(86);
        img.height.should.equal(185);
        cb();
      }))
      .on('end', done);
  });
  it('should return a object stream with a horizontal sprite', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png',
        orientation: 'horizontal'
      }))
      .pipe(es.map(function (file, cb) {
        var img = new Image();
        img.src = file.contents;
        file.path.should.equal('dist/img/sprites.png');
        file.relative.should.equal('sprites.png');
        img.width.should.equal(110);
        img.height.should.equal(69);
        cb();
      }))
      .on('end', done);
  });
  it('should return a object stream with a sprite and a css file', function (done) {
    var png, css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png',
        style: './dist/css/sprites.css'
      }))
      .pipe(es.map(function (file, cb) {
        if (file.relative.indexOf('png') > -1) {
          png = file;
        }
        else {
          css = file;
        }
        cb();
      }))
      .on('end', function () {
        png.should.be.ok;
        png.path.should.equal('dist/img/sprites.png');
        png.relative.should.equal('sprites.png');
        css.should.be.ok;
        css.path.should.equal('./dist/css/sprites.css');
        css.relative.should.equal('sprites.css');
        css.contents.toString('utf-8').should.containEql('.icon-floppy-disk');
        done();
      });
  });
  it('should return a object stream with a sprite and a scss file', function (done) {
    var png, css;
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png',
        processor: 'scss',
        style: './dist/css/sprites.scss'
      }))
      .pipe(es.map(function (file, cb) {
        if (file.relative.indexOf('png') > -1) {
          png = file;
        }
        else {
          css = file;
        }
        cb();
      }))
      .on('end', function () {
        png.should.be.ok;
        png.path.should.equal('dist/img/sprites.png');
        png.relative.should.equal('sprites.png');
        css.should.be.ok;
        css.path.should.equal('./dist/css/sprites.scss');
        css.relative.should.equal('sprites.scss');
        css.contents.toString('utf-8').should.containEql('$floppy-disk');
        done();
      });
  });
  it('should return a object stream with a css file with base64 encode images in it', function (done) {
    vfs.src('./test/fixtures/**')
      .pipe(sprite({
        base64: true,
        out: './dist/css'
      }))
      .pipe(es.map(function (file, cb) {
        file.relative.should.equal('sprite.css');
        file.contents.toString('utf-8').should.containEql('data:image/png;base64');
        cb();
      }))
      .on('end', done);
  });
  it('should do nothing when no files match', function (done) {
    var file = false;
    vfs.src('./test/fixtures/empty/**')
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png'
      }))
      .pipe(es.map(function (f, cb) {
        file = file;
        cb();
      }))
      .on('end', function () {
        file.should.not.ok;
        done();
      });
  });
  it('should throw error when file stream', function (done) {

    vfs.src('./test/fixtures/**', {buffer: false})
      .pipe(sprite({
        out: './dist/img',
        name: 'sprites.png'
      }))
      .on('error', function (err) {
        err.toString().should.equal('Error: Streaming not supported');
        done();
      })
  });
});
