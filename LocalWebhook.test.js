const LocalWebhook = require("./LocalWebhook");
const fetch = require("node-fetch");

describe("LocalWebhook with ngrok", () => {
  beforeAll(async () => {
    // Start LocalWebhook server.
    await LocalWebhook.startServer({ service: "ngrok", region: "eu" });
  });

  afterAll(async () => {
    // Stop LocalWebhook server.
    await LocalWebhook.stopServer();
  });

  test("Promise API works", async () => {
    // Create Promise.
    const promise = LocalWebhook.getPromise();
    expect(typeof promise.then).toBe("function");
    expect(typeof promise.catch).toBe("function");
    expect(typeof promise.getWebhookUrl).toBe("function");
    expect(promise.getWebhookUrl()).toMatch("eu.ngrok.io");
    // Trigger it.
    let called = 0;
    promise.then(({ res }) => {
      ++called;
      res.end();
    });
    await fetch(promise.getWebhookUrl());
    await promise; // Not really necessary.
    expect(called).toBe(1);
  });

  test("Observable API works", async () => {
    // Create Observable.
    const observable = LocalWebhook.getObservable();
    expect(typeof observable.subscribe).toBe("function");
    expect(observable.getWebhookUrl()).toMatch("eu.ngrok.io");
    // Trigger it twice.
    let called = 0;
    observable.subscribe(({ res }) => {
      ++called;
      res.end();
    });
    await fetch(observable.getWebhookUrl());
    expect(called).toBe(1);
    await fetch(observable.getWebhookUrl());
    expect(called).toBe(2);
  });
});

describe("LocalWebhook with localhost.run", () => {
  const subdomain = Date.now().toString();

  beforeAll(async () => {
    // Start LocalWebhook server.
    await LocalWebhook.startServer({ subdomain });
  });

  afterAll(async () => {
    // Stop LocalWebhook server.
    await LocalWebhook.stopServer();
  });

  test("Promise API works", async () => {
    // Create Promise.
    const promise = LocalWebhook.getPromise("endpoint");
    expect(typeof promise.then).toBe("function");
    expect(typeof promise.catch).toBe("function");
    expect(typeof promise.getWebhookUrl).toBe("function");
    expect(promise.getWebhookUrl()).toMatch(subdomain + ".localhost.run/endpoint");
    // Trigger it.
    let called = 0;
    promise.then(({ res }) => {
      ++called;
      res.end();
    });
    await fetch(promise.getWebhookUrl());
    await promise; // Not really necessary.
    expect(called).toBe(1);
  });

  test("Observable API works", async () => {
    // Create Observable.
    const observable = LocalWebhook.getObservable("some-endpoint");
    expect(typeof observable.subscribe).toBe("function");
    expect(observable.getWebhookUrl()).toMatch(subdomain + ".localhost.run/some-endpoint");
    // Trigger it twice.
    let called = 0;
    observable.subscribe(({ res }) => {
      ++called;
      res.end();
    });
    await fetch(observable.getWebhookUrl());
    expect(called).toBe(1);
    await fetch(observable.getWebhookUrl());
    expect(called).toBe(2);
  });
});
