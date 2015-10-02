'use strict';

var config = require('../project-config');

module.exports = {
  restApiRoot: config.restApiRoot,
  port: config.localPort,
  url: "localhost:" + config.localPort + "/",
};
