"use strict";

var debug = require("debug")("local-webhook");
var express = require("express");
var ssh2 = require("ssh2");
var Socket = require("net").Socket;

var LocalWebhook = {
  expressServer: null,
  sshTunnel: null,
  service: "",
  publicUrl: "",
  callbacks: {},

  randomString: function() {
    return Date.now() + "-" + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
  },

  /*
    - port: Local port to run express on in the background.
    - service: Either "localhost.run" (default) or "ngrok".
    - subdomain: For both "localhost.run" and "ngrok".
    - region: For "ngrok" only.
    - authtoken: For "ngrok" only.
   */
  startServer: function(serverOptions) {
    serverOptions = serverOptions || {};

    return new Promise(function(resolve, reject) {
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

      LocalWebhook.service = serverOptions.service;
      switch (LocalWebhook.service) {
        case "ngrok":
          // Start ngrok.
          var ngrok = require("ngrok");
          var ngrokPort = expressPort;
          var ngrokRegion = serverOptions.region || "us";
          var ngrokSubdomain = serverOptions.subdomain || undefined;
          var ngrokAuthToken = serverOptions.authtoken || undefined;

          ngrok.kill().then(function() {
            ngrok
              .connect({
                addr: ngrokPort,
                region: ngrokRegion,
                subdomain: ngrokSubdomain,
                authtoken: ngrokAuthToken,
                bind_tls: true,
              })
              .then(function(ngrokUrl) {
                LocalWebhook.publicUrl = ngrokUrl;
                debug("ngrok started on " + LocalWebhook.publicUrl);
                resolve();
              }, reject);
          });
          break;

        case "localhost.run":
        default:
          // Start ssh tunnel.
          var sshUsername = serverOptions.subdomain || Date.now().toFixed();
          LocalWebhook.sshTunnel = new ssh2();
          LocalWebhook.sshTunnel
            .on("ready", function() {
              LocalWebhook.sshTunnel.forwardIn("localhost", 80, function(error) {
                if (error) {
                  return reject(error);
                }
                LocalWebhook.publicUrl = "https://" + sshUsername + ".localhost.run";
                debug("ssh tunnel started on " + LocalWebhook.publicUrl);
                resolve();
              });
            })
            .on("tcp connection", function(info, accept, reject) {
              var expressSocket = new Socket();
              expressSocket
                .on("error", function(error) {
                  remote ? remote.end() : reject();
                })
                .connect(expressPort, function() {
                  expressSocket.pipe(accept()).pipe(expressSocket);
                });
            })
            .connect({
              username: sshUsername,
              host: "ssh.localhost.run",
              port: 22,
            });
          break;
      }
    });
  },

  stopServer: function() {
    LocalWebhook.expressServer.close();
    LocalWebhook.expressServer = null;
    LocalWebhook.publicUrl = "";
    LocalWebhook.callbacks = {};

    switch (LocalWebhook.service) {
      case "ngrok":
        // Stop ngrok.
        var ngrok = require("ngrok");
        ngrok.kill();
        break;

      case "localhost.run":
      default:
        // Stop ssh tunnel.
        if (LocalWebhook.sshTunnel) {
          LocalWebhook.sshTunnel.end();
        }
        break;
    }
  },

  getPromise: function(id) {
    if (!LocalWebhook.publicUrl) {
      throw new Error("Please call and await LocalWebhook.startServer() first");
    }

    id = id || LocalWebhook.randomString() + "-promise";

    var promise = new Promise(function(resolve) {
      LocalWebhook.callbacks[id] = function(req, res) {
        debug("promise triggered at https://" + req.hostname + req.url);
        resolve({ req: req, res: res });
        LocalWebhook.callbacks[id] = null;
      };
    });

    promise.getWebhookUrl = function() {
      return LocalWebhook.publicUrl + "/" + id;
    };
    debug("promise installed at " + promise.getWebhookUrl());
    return promise;
  },

  getObservable: function(id) {
    if (!LocalWebhook.publicUrl) {
      throw new Error("Please call and await LocalWebhook.startServer() first");
    }

    id = id || LocalWebhook.randomString() + "-observable";

    var observable = {
      subscribe: function(handlers) {
        if (handlers.next) {
          observable.next = handlers.next;
        } else if (handlers.bind) {
          observable.next = handlers;
        }
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
      return LocalWebhook.publicUrl + "/" + id;
    };
    debug("observable installed at " + observable.getWebhookUrl());
    return observable;
  },
};

LocalWebhook.default = LocalWebhook;
module.exports = LocalWebhook;
