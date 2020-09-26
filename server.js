const express = require('express');
const routes = require('./js/routes.js');
const middleware = require('./js/middleware.js');
const err = require('./js/errorHandling.js');

const app = express();

middleware.init(app);
routes.init(app);
err.handleErrors(app);

app.listen(process.env.PORT || 3000);
