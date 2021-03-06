# local-webhook

Zero-configuration localhost webhooks. Do not use in production.

<p>  
  <img src="https://i.imgur.com/ySm2Noc.png" alt="banner" draggable="false">
</p>

## Installation

```bash
yarn add -D local-webhook express
```

Note: `express` is a required peer dependency. 

## Usage

Setup and generate webhook as a Promise:
```js
import LocalWebhook from 'local-webhook';

await LocalWebhook.startServer({ subdomain: "sushi" });

// Generate an awaitable webhook Promise.
const webhook = LocalWebhook.getPromise("wasabi");

// This URL can be shared with third-party services.
// Ex: "https://sushi.localhost.run/wasabi"
webhook.getWebhookUrl(); 

// Handle third-party service's webhook request once.
webhook.then(({ req, res }) => {
    res.send("Hello from promise, wasabi");
});

// Awaitable if necessary.
await webhook;
```

Generate webhook as an Observable:
```js
// Generate a webhook Observable.
const webhook = LocalWebhook.getObservable("ichiban");

// This URL can be shared with third-party services.
// Ex: "https://sushi.localhost.run/ichiban"
webhook.getWebhookUrl(); 

// Handle third-party service's webhook requests each time it's called.
webhook.subscribe(({ req, res }) => {
  res.send("Hello from observable, ichiban");
});
```

Check the [example](https://github.com/RickWong/local-webhook/blob/master/example.js) and [tests](https://github.com/RickWong/local-webhook/blob/master/LocalWebhook.test.js) for much more options.

## Community

Let's start one together! After you ★ this project, follow me [@Rygu](https://twitter.com/rygu) on Twitter.

## Thanks

- [Vernon de Goede](https://github.com/vernondegoede)
- [Giel Cobben](https://github.com/gielcobben)
- [René Feiner](https://github.com/rfeiner)
- [Mathieu Kooiman](https://github.com/mathieuk)

## License

BSD 3-Clause license. Copyright © 2018, Rick Wong. All rights reserved.
