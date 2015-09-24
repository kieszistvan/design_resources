import * as routes from './routes/index';

import express from 'express';

var app = express()
  .use('/static/js', express.static(__dirname + '/../' + 'client'))
  .use('/static/fonts', express.static(__dirname + '/../' + 'fonts'))
  .use('/static/css', express.static(__dirname + '/../' + 'css'))
  .set('view engine', 'jade')
  .set('views', __dirname + '/../' + 'jade/page/');

app.get('/', routes.landing.index);
app.get('/styleguide', routes.styleguide.index);

app.listen(3000);
