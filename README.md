# Pinggy

## A free, http-based pub-sub service.

Pinggy uses HTTP POST to post events and server side events (SSE) to subscribe to events.

> Note: Pinggy does not persist any data, it just emits the events as and when received, so there is a chance of data loss when clients are not subscribed.

### Subscribe to a channel

Pinggy uses channels to differentiate multiple streams. You can use SSE as below to subscribe to any channel.

```js
const events = new EventSource("https://pinggy.com/test-channel");
```

Here `test-channel` is the channel name. A channel name should be lower cased alphanumeric characters upto 40 characters long.

### Listening to events

You can listen to all messages in a channel or only to specific events as follows.

```js
// Listens to all messages in the channel
events.onmessage((e) => console.log(e));

// Listens to only chat events in the channel
events.addEventListener("chat", (e) => console.log(e));
```

### Posting to channel

Use simple HTTP POST for emitting events to all the subscribers. Currently only plain text body is supported.

```js
fetch("https://pinggy.com/test-channel", {
	method: "POST",
	mode: "cors",
	cache: "no-cache",
	headers: { "Content-Type": "text/plain" },
	body: "Hello World",
});
```

### How to run locally

Fork this repo and then clone it:

```
git clone https://github.com/<your_name>/pinggy.git
```

```
npm install
```

Then just run

```
npm start
```

to start the development server on port `3000`. Your jsonbox instance will be running on `http://localhost:3000`.

### LICENSE

MIT
