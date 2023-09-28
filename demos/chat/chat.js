const unsocketServer = "https://unsocket.com"; // Use http://localhost:3000 for local testing

const init = (_name) => {
	if (!_name) return askName();

	const events = new EventSource(`${unsocketServer}/unsocket-demo`);

	events.addEventListener("connected", ({ data }) => {
		document.getElementById("listeners").textContent = data;
	});

	events.addEventListener("chat", ({ data }) => {
		appendChat(JSON.parse(data));
	});
};

const askName = () => {
	let name = window.localStorage.name;
	if (!name || !name.trim()) {
		let namePrompt = prompt("Please enter your name");
		if (!namePrompt) return askName();
		name = namePrompt.trim();
		window.localStorage.name = name;
	}
	init(name.trim());
};

async function sendChat(data) {
	if (!data) return alert("Empty chat");
	const body = JSON.stringify({ name: window.localStorage.name, text: data });
	const response = await fetch(`${unsocketServer}/unsocket-demo/chat`, {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		headers: { "Content-Type": "text/plain" },
		body,
	});
	return response;
}

const appendChat = (chat) => {
	const chatWrap = document.createElement("div");
	chatWrap.className = "chat";
	const chatName = document.createElement("span");
	chatName.className = "name";
	const chatText = document.createElement("span");
	chatName.textContent = chat.name;
	chatText.textContent = chat.text;

	chatWrap.append(chatName);
	chatWrap.append(chatText);

	document.getElementById("chats").append(chatWrap);
};

document.getElementById("chatForm").addEventListener("submit", (e) => {
	e.preventDefault();
	e.stopPropagation();
	let chatMessage = document.getElementById("chatMsg").value;
	sendChat(chatMessage);
	document.getElementById("chatMsg").value = "";
});

init();
