import * as routes from './routes/index';

import express from 'express';

var app = express()
  .use('/fonts', express.static(__dirname + '/../' + 'fonts'))
  .use('/css', express.static(__dirname + '/../' + 'css'))
  .set('view engine', 'jade')
  .set('views', __dirname + '/../' + 'jade/page/');

app.get('/', routes.landing.index);
app.get('/styleguide', routes.styleguide.index);

app.listen(3000);
