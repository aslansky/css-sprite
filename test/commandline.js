'use strict';

var should = require('should');
var fs = require('fs');
var exec = require('child_process').exec;
var lwip = require('lwip');

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
  it('should generate sprite (png)', function (done) {
    exec('./bin/cli.js ./test/dist/ ./test/fixtures/*.*',
      function (error, stdout, stderr) {
        stderr.should.be.empty;
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
  it('should generate sprite (jpg)', function (done) {
    exec('./bin/cli.js ./test/dist/ ./test/fixtures/*.* -f jpg',
      function (error, stdout, stderr) {
        stderr.should.be.empty;
        fs.existsSync('./test/dist/sprite.jpg').should.be.true;
        lwip.open('./test/dist/sprite.jpg', function (err, img) {
          should(err).not.be.ok;
          img.width().should.equal(520);
          img.height().should.equal(1064);
          fs.unlinkSync('./test/dist/sprite.jpg');
          fs.rmdirSync('./test/dist');
          done();
        });
      });
  });
});
