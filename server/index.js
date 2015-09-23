import * as routes from './routes/index';

import express from 'express';

var app = express()
  .use('/fonts', express.static('dist/fonts'))
  .use('/css', express.static('dist/css'))
  .set('view engine', 'jade')
  .set('views', 'dist/jade/page/');

app.get('/', routes.landing.index);
app.get('/styleguide', routes.styleguide.index);

app.listen(3000);
