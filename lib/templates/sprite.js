'use strict';

// Load in local modules
var fs = require('graceful-fs');
var path = require('path');
var mustache = require('mustache');
var cssesc = require('cssesc');
var tmpl = {
  'css': fs.readFileSync(__dirname + '/css.mustache', 'utf8'),
  'scss': fs.readFileSync(__dirname + '/scss.mustache', 'utf8'),
  'sass': fs.readFileSync(__dirname + '/sass.mustache', 'utf8'),
  'less': fs.readFileSync(__dirname + '/less.mustache', 'utf8'),
  'stylus': fs.readFileSync(__dirname + '/stylus.mustache', 'utf8')
};

// Define our css template fn ({items, options}) -> css
function cssTemplate (params) {
  // Localize parameters
  var items = params.items;
  var options = params.options;
  var tmplParams = {
    sprite: null,
    retina: null,
    items: [],
    options: options
  };

  var classFn = function (name, sep) {
    if (options.cssClass) {
      return '.' + cssesc(options.cssClass + sep + name, {isIdentifier: true});
    }
    else {
      return '.icon' + cssesc(sep + name, {isIdentifier: true});
    }
  };

  // Add class to each of the options
  items.forEach(function saveClass (item) {
    if (item.type === 'sprite') {
      item['class'] = classFn('', '');
      item['classname'] = item['class'].slice(1);
      tmplParams.sprite = item;
    }
    else if (item.type === 'retina') {
      item['class'] = classFn('', '');
      item['classname'] = item['class'].slice(1);
      tmplParams.retina = item;
    }
    else {
      item['class'] = classFn(item.name, '-');
      item['classname'] = item['class'].slice(1);
      tmplParams.items.push(item);
    }
  });
  // Render and return CSS
  var tmplFile = options.template ?
    fs.readFileSync(path.resolve(process.cwd(), options.template), 'utf8') :
    tmpl[options.processor];
  var css = mustache.render(tmplFile, tmplParams);
  return css;
}

// Export our CSS template
module.exports = cssTemplate;
