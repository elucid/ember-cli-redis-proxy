# ember-cli-redis-proxy

Write your ember-cli app's index.html to redis on each build in development mode.

Why do this? This addon is intended to be used with [ember-cli-deploy](https://github.com/ember-cli/ember-cli-deploy). See that project page or Luke Melia's [Lightning Fast Deploys Talk](https://www.youtube.com/watch?v=QZVYP3cPcWQ) for more background.

`ember-cli-deploy` is an addon for deploying apps. It works fine for cases where your ember-cli app and API app are mostly developed in isolation. However, if you develop your apps more closely or rely on your API app to inject session or initial state data into your ember-cli app's index page, the development process can be cumbersome.

This addon simply writes your ember-cli app's index to redis on each build so that your API app can read (and possibly modify it) just like it would in production.

## Installation

* `cd your-ember-app-that-uses-ember-cli-deploy`
* `npm install --save-dev ember-cli-redis-proxy`

## Configuration

This addon reads the config file used by `ember-cli-deploy` which is located in `config/deploy.js` within your ember-cli project. The addon only runs in development mode and will use the redis config found in the development stanza. Example:

```javascript
// config/deploy.js
module.exports = {
  development: {
    buildEnv: 'development',
    store: {
      type: 'redis',  // this can be omitted because it is the default
      host: 'localhost',
      port: 6379
    },
    assets: {
      // ...
    }
  },

  // other environments
};
```

In addition to configuring how to connect to redis, you will also need to configure your ember-cli app to use fingerprinting in development mode. Why? Without fingerprinting your assets will have relative paths and requests for them will hit your API app rather than your ember-cli app. Fingerprinting is fast and works just as well in development mode. Just ensure you prepend your fully qualified development endpoint. Example:

```javascript
// Brocfile.js
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var fingerprintOptions = {
  enabled: true,
  extensions: ['js', 'css', 'png', 'jpg', 'gif']
};

var env = process.env.EMBER_ENV || 'development';

switch (env) {
  case 'development':
    fingerprintOptions.prepend = 'http://localhost:4200/';
    break;
  case 'production':
    fingerprintOptions.prepend = 'https://your.cdn.com/';
    break;
}

var app = new EmberApp({
  fingerprint: fingerprintOptions
});
```

## Use

With this addon running you can effectively use redis as a proxy for serving your ember-cli app through your API app in development. The endpoint configured for use by `ember-cli-deploy` now works in development mode. See their [Sample Sinatra App](https://github.com/ember-cli/ember-cli-deploy#example-sinatra-app) for an example.
