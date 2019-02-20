const LocalWebhook = require("./LocalWebhook");
const fetch = require("node-fetch");

(async function() {
  try {
    // Start LocalWebhook server.
    await LocalWebhook.startServer({ subdomain: "local-webhook" });

    const simulatedTriggers = [];

    // 1) Promise example:
    const promise = LocalWebhook.getPromise("wasabi");
    promise.then(({ req, res }) => {
      res.send("Hello from promise, wasabi");
      // Do important stuff here.
    });

    // Trigger webhook (normally this is done by a third-party).
    simulatedTriggers.push(fetch(promise.getWebhookUrl()));

    // 2) Observable example:
    const observable = LocalWebhook.getObservable("ichiban");
    observable.subscribe({
      next: ({ req, res }) => {
        res.send("Hello from observable, ichiban");
        // Do important stuff here.
      },
    });

    // Trigger webhook twice (normally this is done by a third-party).
    simulatedTriggers.push(fetch(observable.getWebhookUrl()));
    simulatedTriggers.push(fetch(observable.getWebhookUrl()));

    // Clean up.
    await Promise.all(simulatedTriggers);
    LocalWebhook.stopServer();
  } catch (error) {
    console.error(error);
  }
})();
