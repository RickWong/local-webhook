# local-webhook

Zero-configuration localhost webhooks.

<p>  
  <img src="https://i.imgur.com/ySm2Noc.png" alt="banner" draggable="false">
</p>

## Installation

```bash
# npm
npm install --save-dev local-webhook express ngrok

# yarn
yarn add --dev local-webhook express ngrok
```

Note: `express` and `ngrok` are required peer dependencies.

## Usage

```js
import LocalWebhook from 'local-webhook';

await LocalWebhook.startServer(); // optional: { port: 9090, region: "eu" }
```

Generate webhook as a Promise:
```js
const promise = LocalWebhook.getPromise();

// This URL can be shared with third-party services.
promise.getWebhookUrl(); 

// Handle third-party service' webhook request once.
promise.then(({ req, res }) => {
    res.send("Hello from promise");
});

// Awaitable if necessary.
await promise;
```

Generate webhook as an Observable:
```js
const observable = LocalWebhook.getObservable();

// This URL can be shared with third-party services.
observable.getWebhookUrl(); 

// Handle third-party service' webhook requests each time.
observable.subscribe({
  next: ({ req, res }) => {
    res.send("Hello from observable");
  },
});
```

To inspect and replay requests, open ngrok's web interface at [localhost:4040](http://localhost:4040).

## Peer dependencies

- [expressjs/express](https://github.com/expressjs/express) - http server
- [bubenshchykov/ngrok](https://github.com/bubenshchykov/ngrok) - a [ngrok](https://ngrok.com/) wrapper

## Community

Let's start one together! After you ★ this project, follow me [@rygu](https://twitter.com/rygu) on Twitter.

## Thanks

- [Vernon de Goede](https://github.com/vernondegoede)
- [Giel Cobben](https://github.com/gielcobben)
- [René Feiner](https://github.com/rfeiner)
- [Mathieu Kooiman](https://github.com/mathieuk)

## License

BSD 3-Clause license. Copyright © 2018, Rick Wong. All rights reserved.
