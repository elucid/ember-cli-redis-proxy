/* jshint node: true */
'use strict';

var path = require('path');
var fs = require('fs');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('silent-error');
var redis = require('then-redis');
var readFile = Promise.denodeify(fs.readFile);

module.exports = {};

module.exports.name = 'ember-cli-redis-proxy'

var configPath = path.join(process.cwd(), 'config', 'deploy');

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

  var config = require(configPath);

  if (Object.keys(config).indexOf(environment) === -1){
    return;
  }
  var redisConfig = config[environment].store;

  var projectName = this.project.name();
  var indexKey = projectName + ":__development__";
  var currentKey = projectName + ":current";
  var indexPath = path.join(result.directory, 'index.html');

  var adapter = redis.createClient(redisConfig);

  var uploadToRedis = function(data) {
    return adapter.mset(indexKey, data, currentKey, indexKey);
  }

  return indexFile(indexPath)
    .then(uploadToRedis, fileNotFound)
    .then(successfullyWroteKey.bind(null, indexKey))
};
