'use strict';

var should = require('should');
var sprite = require('../index');
var async = require('async');
var fs = require('graceful-fs');
var path = require('path');
var sass = require('node-sass');
var less = require('less');
var stylus = require('stylus');
var CleanCSS = require('clean-css');

describe('styles (lib/templates)', function () {
  it('should create identical styles', function (done) {
    async.eachSeries(['scss', 'less', 'stylus'],
    function (proc, cb) {
      sprite.create({
        src: ['./test/fixtures/*.png'],
        out: './test/dist',
        processor: proc,
        base64: true
      }, cb);
    },
    function () {
      async.series([
        function (cb) {
          var result = sass.renderSync({
            file: path.join(__dirname, 'styles/style.scss'),
            outputStyle: 'compressed'
          });
          cb(null, result.css);
        },
        function (cb) {
          less.render(fs.readFileSync(path.join(__dirname, 'styles/style.less')).toString(), {
            paths: [path.join(__dirname, 'dist/')]
          }, function (err, output) {
            cb(err, output.css);
          });
        },
        function (cb) {
          stylus(fs.readFileSync(path.join(__dirname, 'styles/style.styl')).toString())
            .set('paths', [path.join(__dirname, 'dist/')])
            .render(cb);
        }
      ], function (err, results) {
        new CleanCSS().minify(results[0]).styles.should.equal(new CleanCSS().minify(results[1]).styles);
        new CleanCSS().minify(results[1]).styles.should.equal(new CleanCSS().minify(results[2]).styles);
        new CleanCSS().minify(results[2]).styles.should.equal(new CleanCSS().minify(results[0]).styles);
        fs.unlinkSync('./test/dist/sprite.less');
        fs.unlinkSync('./test/dist/sprite.scss');
        fs.unlinkSync('./test/dist/sprite.styl');
        fs.rmdirSync('./test/dist');
        done();
      });
    });
  });
});
