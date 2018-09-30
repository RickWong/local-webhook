# local-webhook

Zero-configuration localhost webhooks. Do not use in production.

## Installation

Install `express` and `ngrok` as well.

```bash
npm install --save-dev local-webhook express ngrok
yarn add --dev local-webhook express ngrok
```

## Usage

```js
import LocalWebhook from 'local-webhook';

await LocalWebhook.startServer();
```

Generate webhook as a Promise:
```js
const promise = LocalWebhook.getPromise();

promise.then(({ req, res }) => {
  // Process webhook here with Express' req and res.
    res.send("Hello from promise");
});

// This URL that can be shared with third-party services.
promise.getWebhookUrl(); 

// Awaitable if necessary.
await promise;
```

Generate webhook as an Observable:
```js
const observable = LocalWebhook.getObservable();

observable.subscribe({
  next: ({ req, res }) => {
    // Process webhook here with Express' req and res.
    res.send("Hello from observable");
  },
});

// This URL that can be shared with third-party services.
observable.getWebhookUrl(); 
```

## Peer dependencies

- [expressjs/express](https://github.com/expressjs/express) - http server
- [bubenshchykov/ngrok](https://github.com/bubenshchykov/ngrok) - ngrok wrapper

## Community

Let's start one together! After you ★ this project, follow me [@rygu](https://twitter.com/rygu) on Twitter.

## License

BSD 3-Clause license. Copyright © 2018, Rick Wong. All rights reserved.
