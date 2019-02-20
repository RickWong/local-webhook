const LocalWebhook = require("./LocalWebhook");
const fetch = require("node-fetch");

(async function() {
  try {
    // Start LocalWebhook server.
    await LocalWebhook.startServer({ subdomain: "sushi" });

    const simulatedTriggers = [];

    // 1) Promise example:
    const promise = LocalWebhook.getPromise("wasabi");
    promise.then(({ req, res }) => {
      res.send("Hello from promise, wasabi");
      // Do stuff here like updating your database.
    });

    // Trigger webhook, normally this is done by a third-party.
    simulatedTriggers.push(fetch(promise.getWebhookUrl()));

    // 2) Observable example:
    const observable = LocalWebhook.getObservable("ichiban");
    observable.subscribe({
      next: ({ req, res }) => {
        res.send("Hello from observable, ichiban");
        // Do stuff here like logging the request.
      },
    });

    // Trigger webhook twice, normally this is done by a third-party.
    simulatedTriggers.push(fetch(observable.getWebhookUrl()));
    simulatedTriggers.push(fetch(observable.getWebhookUrl()));

    // Wait for all the webhooks to be triggered.
    await Promise.all(simulatedTriggers);
    
    // Clean up.
    LocalWebhook.stopServer();
  } catch (error) {
    console.error(error);
  }
})();
