"use strict";

var debug = require("debug")("local-webhook");
var express = require("express");
var ngrok = require("ngrok");

var LocalWebhook = {
  expressServer: null,
  ngrokUrl: "",
  callbacks: {},

  randomString: function() {
    return Date.now() + "-" + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
  },

  startServer: function(serverOptions) {
    serverOptions = serverOptions || {};

    return new Promise(function(resolve) {
      // Start Express.
      var app = express();
      var expressPort = serverOptions.port || Math.floor(Math.random() * 50000 + 10000);

      app.all("/:id", function(req, res) {
        if (req.params.id && LocalWebhook.callbacks[req.params.id]) {
          res.status(200);
          LocalWebhook.callbacks[req.params.id](req, res);
        } else {
          debug("unknown webhook called at https://" + req.hostname + req.url);
          res.sendStatus(404);
        }
      });

      LocalWebhook.expressServer = app.listen(expressPort, function() {
        debug("express started on http://localhost:" + expressPort);
      });

      // Start ngrok.
      var ngrokPort = serverOptions.port || expressPort;
      var ngrokRegion = serverOptions.region || "us";
      ngrok.kill().then(function() {
        ngrok
          .connect({ addr: ngrokPort, region: ngrokRegion, bind_tls: true })
          .then(function(ngrokUrl) {
            LocalWebhook.ngrokUrl = ngrokUrl;
            debug("ngrok started on " + LocalWebhook.ngrokUrl);
            resolve();
          });
      });
    });
  },

  stopServer: function() {
    LocalWebhook.expressServer.close();
    LocalWebhook.expressServer = null;
    LocalWebhook.ngrokUrl = "";
    LocalWebhook.callbacks = {};
    return ngrok.kill();
  },

  getPromise: function() {
    if (!LocalWebhook.ngrokUrl) {
      throw new Error("Please call and await LocalWebhook.startServer() first");
    }

    var id = LocalWebhook.randomString() + "-promise";

    var promise = new Promise(function(resolve) {
      LocalWebhook.callbacks[id] = function(req, res) {
        debug("promise triggered at https://" + req.hostname + req.url);
        resolve({ req: req, res: res });
        LocalWebhook.callbacks[id] = null;
      };
    });

    promise.getWebhookUrl = function() {
      return LocalWebhook.ngrokUrl + "/" + id;
    };
    debug("promise installed at " + promise.getWebhookUrl());
    return promise;
  },

  getObservable() {
    if (!LocalWebhook.ngrokUrl) {
      throw new Error("Please call and await LocalWebhook.startServer() first");
    }

    var id = LocalWebhook.randomString() + "-observable";

    var observable = {
      subscribe: function(handlers) {
        observable.next = handlers.next;
      },
      unsubscribe: function() {
        LocalWebhook.callbacks[id] = null;
        observable.next = null;
      },
    };

    LocalWebhook.callbacks[id] = function(req, res) {
      debug("observable triggered at https://" + req.hostname + req.url);
      observable.next({ req: req, res: res });
    };

    observable.getWebhookUrl = function() {
      return LocalWebhook.ngrokUrl + "/" + id;
    };
    debug("observable installed at " + observable.getWebhookUrl());
    return observable;
  },
};

LocalWebhook.default = LocalWebhook;
module.exports = LocalWebhook;
