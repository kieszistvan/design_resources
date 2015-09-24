import express from 'express';

import * as routes from './routes/index';

const URL_PATH = {
  static: {
    js: '/static/js',
    css: '/static/css',
    font: '/static/fonts'
  },
  root: '/',
  styleguide: '/styleguide'
};

const DIST_PATH = __dirname + '/..';

console.log('dist path: %s', DIST_PATH);
console.log('avaiable URL paths: %j', URL_PATH);

var app = express();

app.locals.urlPath = URL_PATH;

app.use(URL_PATH.static.js, express.static(DIST_PATH + '/client'))
  .use(URL_PATH.static.font, express.static(DIST_PATH + '/fonts'))
  .use(URL_PATH.static.css, express.static(DIST_PATH + '/css'))
  .set('view engine', 'jade')
  .set('views', DIST_PATH + '/jade/page/');

app.get(URL_PATH.root, routes.landing.index);
app.get(URL_PATH.styleguide, routes.styleguide.index);

app.listen(3000);
