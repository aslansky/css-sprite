'use strict';

var should = require('should');
var fs = require('fs');
var exec = require('child_process').exec;
var Canvas = require('canvas');
var Image = Canvas.Image;

require('mocha');

describe('css-sprite cli (bin/cli.js)', function () {
  it('should output help message', function (done) {
    exec(process.cwd() + '/bin/cli.js',
      function (error, stdout, stderr) {
        stderr.should.be.empty;
        stdout.should.containEql('Usage:');
        stdout.should.containEql('css-sprite <out> <src>');
        done();
      });
  });
  it('should generate sprite', function (done) {
    exec('./bin/cli.js ./test/dist/ ./test/fixtures/*.png',
      function (error, stdout, stderr) {
        stderr.should.be.empty;
        fs.existsSync('./test/dist/sprite.png').should.be.true;
        fs.readFile('./test/dist/sprite.png', function (err, png) {
          var img = new Image();
          img.src = png;
          img.width.should.equal(138);
          img.height.should.equal(552);
          fs.unlinkSync('./test/dist/sprite.png');
          fs.rmdirSync('./test/dist');
          done();
        });
      });
  });
});
