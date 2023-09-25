// MIT License
//
// Copyright (c) 2023 Vasanth.V <imvasanthv@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const bodyParser = require("body-parser");
const EventEmitter = require("events");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

// Configure port on which the HTTP server shoudl run
const PORT = process.env.PORT || 3000;

// Initialize the event emitter
const pinggyEventEmitter = new EventEmitter();

// Setting the max listeners as "0" which means there is no limit to the listeners
pinggyEventEmitter.setMaxListeners(0);

const app = express();

// Allow CORS
app.use(cors());

// HTTP request logging
app.use(morgan("common"));

// An express js middleware to validate channel name and populate `req.channel`
const validateChannelName = (req, res, next) => {
	if (!req.params.channel) return res.status(400).send("empty-channel");
	const channel = req.params.channel.toLowerCase();

	if (!/^([a-z0-9-]){1,40}$/.test(channel)) return res.status(400).send("invalid-channel");

	req.channel = channel;
	next();
};

// An express js middleware to validate event name and populate `req.event`
const validateEventName = (req, res, next) => {
	if (!req.params.event) return next();
	const event = req.params.event.toLowerCase();

	if (!/^([a-z0-9-]){1,40}$/.test(event)) return res.status(400).send("invalid-event");

	req.event = event;
	next();
};

app.use(["/:channel", "/:channel/:event"], validateChannelName);
app.use("/:channel/:event", validateEventName);

// Middlewares to populate req.body
// Since SSE only support string data we are just parsing raw text body
app.use(["/:channel", "/:channel/:event"], bodyParser.text());

// Use HTTP POST to post data & events on a channel
app.post(["/:channel", "/:channel/:event"], (req, res) => {
	const data = typeof req.body === "object" ? "" : req.body;
	pinggyEventEmitter.emit(req.channel, { event: req.event, data });

	res.send("ok");
});

// SSE endpoint
app.get("/:channel", (req, res) => {
	res.header("Content-Type", "text/event-stream");
	res.header("Connection", "keep-alive");
	res.header("Cache-Control", "no-cache");

	const onEvent = ({ event, data }) => {
		let write = "";
		if (event) write += `event: ${event}\n`;
		if (data) write += `data: ${data}\n`;
		write += "\n";
		res.write(write);
	};

	pinggyEventEmitter.on(req.channel, onEvent);

	// Post initial message
	const listenersCount = pinggyEventEmitter.listeners(req.channel).length;
	// sending connected event
	let data = `event: connected\n`;
	// number of listerned on the channel is sent as data
	data += `data: ${listenersCount} listener${listenersCount === 1 ? "" : "s"}\n\n`;
	res.write(data);

	req.on("close", () => {
		pinggyEventEmitter.off(req.channel, onEvent);
		res.end();
	});
});

// Start the express server
app.listen(PORT, null, () => console.log(`Listening on port ${PORT}`));
