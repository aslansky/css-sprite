'use strict';

var should = require('should');
var sprite = require('../index');
var fs = require('fs');
var vfs = require('vinyl-fs');
var es = require('event-stream');
var Canvas = require('canvas');
var Image = Canvas.Image;

require('mocha');

describe('css-sprite wrapper (index.js)', function () {
  it('should generate a sprite file', function (done) {
    sprite.create({
      src: ['./test/fixtures/*.png'],
      out: './test/dist',
      name: 'sprite.png'
    }, function () {
      fs.existsSync('./test/dist/sprite.png').should.be.true;
      fs.readFile('./test/dist/sprite.png', function (err, png) {
        var img = new Image();
        img.src = png;
        img.width.should.be.equal(56);
        img.height.should.be.equal(125);
        fs.unlinkSync('./test/dist/sprite.png');
        fs.rmdirSync('./test/dist');
        done();
      });
    });
  });
  it('should generate a sprite and css file', function (done) {
    sprite.create({
      src: ['./test/fixtures/*.png'],
      out: './test/dist',
      name: 'sprite.png',
      style: './test/dist/sprite.css'
    }, function () {
      fs.existsSync('./test/dist/sprite.png').should.be.true;
      fs.existsSync('./test/dist/sprite.css').should.be.true;
      fs.readFile('./test/dist/sprite.css', {encoding: 'utf-8'}, function (err, css) {
        css.should.containEql('.icon-floppy-disk');
        fs.unlinkSync('./test/dist/sprite.png');
        fs.unlinkSync('./test/dist/sprite.css');
        fs.rmdirSync('./test/dist');
        done();
      });
    });
  });
  it('should generate a sprite and css file and use name of sprite as the name for the css file', function (done) {
    sprite.create({
      src: ['./test/fixtures/*.png'],
      out: './test/dist',
      name: 'sprite.png',
      style: './test/dist/'
    }, function () {
      fs.existsSync('./test/dist/sprite.png').should.be.true;
      fs.existsSync('./test/dist/sprite.css').should.be.true;
      fs.readFile('./test/dist/sprite.css', {encoding: 'utf-8'}, function (err, css) {
        css.should.containEql('.icon-floppy-disk');
        fs.unlinkSync('./test/dist/sprite.png');
        fs.unlinkSync('./test/dist/sprite.css');
        fs.rmdirSync('./test/dist');
        done();
      });
    });
  });
  it('sprite.stream should return a object stream with a sprite', function (done) {
    vfs.src('./test/fixtures/*.png')
      .pipe(sprite.stream({
        name: 'sprite.png'
      }))
      .pipe(es.map(function (file, cb) {
        var img = new Image();
        img.src = file.contents;
        file.relative.should.be.equal('sprite.png');
        img.width.should.be.equal(56);
        img.height.should.be.equal(125);
        cb();
      }))
      .on('end', done);
  });
  it('should throw error when missing out dir', function () {
    (function () {
      sprite.create({
        src: ['./test/fixtures/*.png'],
        name: 'sprite.png'
      });
    }).should.throw(/^output/);
  });
  it('should throw error when missing src', function () {
    (function () {
      sprite.create({
        out: './test/dist',
        name: 'sprite.png'
      });
    }).should.throw(/^glob/);
  });
});
