# Unsocket

## A HTTP-based pub-sub service to replace websockets using Express.js

Unsocket uses HTTP POST to post events and Server-Sent Events (SSE) to subscribe to events. So, no third-party client is needed, all major browsers support this protocol.

### Subscribe to a channel

Unsocket uses channels to differentiate multiple streams. You can use SSE as below to subscribe to any channel.

```js
const events = new EventSource("/test-channel");
```

Here `test-channel` is the channel name. A channel name should be lowercase alphanumeric characters up to 40 characters long.

### Listening to events

You can listen to all messages in a channel or only to specific events as follows.

```js
// Listens to all messages in the channel
events.onmessage((e) => console.log(e));

// Listens to only chat events in the channel
events.addEventListener("chat", (e) => console.log(e));
```

### Posting to channel

Use simple HTTP POST for emitting events to all the subscribers. Currently, only plain text body is supported.

```js
fetch("/test-channel", {
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
git clone https://github.com/<your_name>/unsocket.git
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
