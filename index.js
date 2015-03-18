/* jshint node: true */
'use strict';

var path = require('path');
var fs = require('fs');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('ember-cli/lib/errors/silent');
var redis = require('then-redis');
var readFile = Promise.denodeify(fs.readFile);

module.exports = {};

module.exports.name = 'ember-cli-redis-proxy'

var configPath = path.join(process.cwd(), 'config', 'environment');

function indexFile(indexPath) {
  return readFile(indexPath, {encoding: 'utf8'});
}

var fileNotFound = function() {
  var message = 'index.html could not be found.\n';

  return Promise.reject(new SilentError(message));
}

function successfullyWroteKey(key) {
  var message = '\nwrote index.html to ' + key + '\n';

  console.log(message);
}

module.exports.postBuild = function(result) {
  var environment = process.env.EMBER_ENV || 'development';

  if (environment !== 'development') {
    return;
  }

  var config = require(configPath)(environment);

  var projectName = this.project.name();
  var redisKey = projectName + ":current";
  var indexPath = path.join(result.directory, 'index.html');

  var adapter = redis.createClient(config);

  var uploadToRedis = function(data) {
    return adapter.set(redisKey, data);
  }

  return indexFile(indexPath)
    .then(uploadToRedis, fileNotFound)
    .then(successfullyWroteKey.bind(null, redisKey))
};
