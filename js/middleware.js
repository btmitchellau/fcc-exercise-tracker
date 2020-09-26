const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');

const init = (expressApp) => {
  expressApp.use(cors());
  expressApp.use(bodyParser.urlencoded({
    extended: false,
  }));
  expressApp.use(bodyParser.json());
  expressApp.use(express.static(path.join(__dirname, '../public')));
  expressApp.get('/', (req, res) => {
    res.sendFile(`${path.join(__dirname, '../')}/views/index.html`);
  });
};

exports.init = init;
