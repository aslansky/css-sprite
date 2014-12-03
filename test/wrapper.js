'use strict';

var should = require('should');
var sprite = require('../index');
var fs = require('fs');
var vfs = require('vinyl-fs');
var through2 = require('through2');
var lwip = require('lwip');
var noop = function () {};

require('mocha');

describe('css-sprite wrapper (index.js)', function () {
  it('should generate a sprite file', function (done) {
    sprite.create({
      src: ['./test/fixtures/*.*'],
      out: './test/dist',
      name: 'sprite'
    }, function () {
      fs.existsSync('./test/dist/sprite.png').should.be.true;
      lwip.open('./test/dist/sprite.png', function (err, img) {
        should(err).not.be.ok;
        img.width().should.equal(520);
        img.height().should.equal(1064);
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
      name: 'sprite',
      style: './test/dist/sprite.css'
    }, function () {
      fs.existsSync('./test/dist/sprite.png').should.be.true;
      fs.existsSync('./test/dist/sprite.css').should.be.true;
      fs.readFile('./test/dist/sprite.css', {encoding: 'utf-8'}, function (err, css) {
        css.should.containEql('.icon-camera');
        css.should.containEql('.icon-cart');
        css.should.containEql('.icon-command');
        css.should.containEql('.icon-font');
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
      name: 'sprite',
      style: './test/dist/'
    }, function () {
      fs.existsSync('./test/dist/sprite.png').should.be.true;
      fs.existsSync('./test/dist/sprite.css').should.be.true;
      fs.readFile('./test/dist/sprite.css', {encoding: 'utf-8'}, function (err, css) {
        css.should.containEql('.icon-camera');
        css.should.containEql('.icon-cart');
        css.should.containEql('.icon-command');
        css.should.containEql('.icon-font');
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
        name: 'sprite'
      }))
      .pipe(through2.obj(function (file, enc, cb) {
        file.relative.should.equal('sprite.png');
        lwip.open(file.contents, 'png', function (err, img) {
          should(err).not.be.ok;
          img.width().should.equal(136);
          img.height().should.equal(544);
          cb();
        });
      }))
      .on('data', noop)
      .on('end', done);
  });
  it('should throw error when missing out dir', function () {
    (function () {
      sprite.create({
        src: ['./test/fixtures/*.png'],
        name: 'sprite'
      });
    }).should.throw(/^output/);
  });
  it('should throw error when missing src', function () {
    (function () {
      sprite.create({
        out: './test/dist',
        name: 'sprite'
      });
    }).should.throw(/^glob/);
  });
});
