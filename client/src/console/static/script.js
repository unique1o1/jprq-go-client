const requestsEl = document.getElementById("requests");
const infoSections = document.getElementsByClassName("card-info");
let requests = [];
let active_request_id = -1;

for (let infoSection of infoSections) {
	let title = infoSection.getElementsByClassName("header-title")[0];
	console.log("clicked...");
	title.addEventListener("click", () => {
		let is_open = !(infoSection.dataset.isOpen === "true");
		infoSection.dataset.isOpen = is_open;

		let detailsEl = infoSection.getElementsByClassName("details")[0];
		let arrowSvg = infoSection.getElementsByTagName("svg")[0];
		if (is_open) {
			detailsEl.classList.remove("hidden");
			arrowSvg.classList.add("open");
		} else {
			detailsEl.classList.add("hidden");
			arrowSvg.classList.remove("open");
		}
	});
}

function createElementFromHTML(htmlString) {
	var div = document.createElement("div");
	div.innerHTML = htmlString.trim();
	return div;
}

const getMethodColor = (method) => {
	const colors = {
		GET: "sky-500",
		POST: "green-500",
		PUT: "orange-500",
		PATCH: "emerald-500",
		DELETE: "rose-500",
		HEAD: "indigo-500",
		OPTIONS: "blue-500",
		DEFAULT: "gray-500",
	};
	return method in colors ? colors[method] : colors["DEFAULT"];
};

const getStatusColor = (status) => {
	let first_digit = Math.floor(status / 100);
	const colors = {
		1: "gray-500",
		2: "green-500",
		3: "yellow-500",
		4: "red-500",
		5: "rose-500",
		DEFAULT: "gray-500",
	};
	return first_digit in colors ? colors[first_digit] : colors["DEFAULT"];
};

const addRequest = (request) => {
	let methodColor = getMethodColor(request.method);
	const requestElHTML = `
    <div class="card cursor-pointer request border-l border-t" onclick="selectRequest('${
			request.id
		}')" data-is-active="false" data-id="${request.id}">
        <div class="method w-20 text-${methodColor}">${request.method}</div>
        <div class="path flex-1 text-black/60" title=${request.url}>
		${request.url.slice(0, 20)}${request.url.length > 20 ? "..." : ""}
		</div>
        <div class="status w-12 text-right"><div class="loader"></div></div>
    </div>
    `;
	const requestElJS = createElementFromHTML(requestElHTML);
	requestsEl.prepend(requestElJS.firstChild);
};

const removeEmptyRequestsIcon = () => {
	let emptyRequestsIconEl = document.getElementById("empty-requests-svg");
	// check if empty requests icon has hidden class, if not then add it
	if (!emptyRequestsIconEl.classList.contains("hidden")) {
		emptyRequestsIconEl.classList.add("hidden");
	}
};

const removeRequestNotSelectedIcon = () => {
	let requestNotSelectedIconEl = document.getElementById(
		"RequestNotSelectedSvg"
	);

	// get element by id SelectedRequestInfo and remove its 'hidden' class
	let selectedRequestInfoEl = document.getElementById("SelectedRequestInfo");
	if (selectedRequestInfoEl.classList.contains("hidden")) {
		selectedRequestInfoEl.classList.remove("hidden");
	}

	if (!requestNotSelectedIconEl.classList.contains("hidden")) {
		requestNotSelectedIconEl.classList.add("hidden");
	}
};

const update_request_status = (request_id, status) => {
	let requestEl = document.querySelector(`[data-id='${request_id}']`);
	let statusEl = requestEl.querySelector(".status");
	let statusColor = getStatusColor(status);

	statusEl.classList.add(`text-${statusColor}`);
	statusEl.innerHTML = status;
};

const prettifyJson = (json_str) => {
	try {
		return JSON.stringify(JSON.parse(json_str.replace(/\\/g, "")), null, 2);
	} catch {
		return json_str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}
	return json_str;
};

const selectRequest = (request_id) => {
	request = requests.find((request) => request.id == request_id);
	removeRequestNotSelectedIcon();
	changeRequestInfo(request);
	let requestEls = document.querySelector("#requests");
	for (let requestEl of requestEls.childNodes) {
		if (parseInt(requestEl.dataset.id) == request_id) {
			requestEl.dataset.isActive = true;
		} else {
			requestEl.dataset.isActive = false;
		}
	}
};

const makeHeaderItem = (key, val) => {
	return `
    <div class="header-item flex mt">
                  <p class="header-key">${key}:</p>
                  <p class="header-val">${val}</p>
                </div>
    `;
};

const updateRequestTitle = (method, url) => {
	const requestMethodEl = document.querySelector("#requestMethod");
	const requestUrlEl = document.querySelector("#requestUrl");
	requestMethodEl.innerText = method;
	requestUrlEl.innerText = url;
};

const updateRequestHeaders = (requestHeaders) => {
	let requestHeadersEl = document
		.getElementById("info")
		.querySelector('[data-title="requestHeaders"]')
		.querySelector(".details");
	let requestHeadersHtml = "";
	Object.keys(requestHeaders).forEach((key) => {
		requestHeadersHtml += makeHeaderItem(key, requestHeaders[key]);
	});
	requestHeadersEl.replaceChildren(createElementFromHTML(requestHeadersHtml));
};

const updateResponseHeaders = (responseHeaders) => {
	let responseHeadersEl = document
		.getElementById("info")
		.querySelector('[data-title="responseHeaders"]')
		.querySelector(".details");
	if (responseHeaders === undefined || responseHeaders === "") {
		return responseHeadersEl.replaceChildren(
			createElementFromHTML("<div class='ml-12 block loader'></div>")
		);
	}
	let responseHeadersHtml = "";
	Object.keys(responseHeaders).forEach((key) => {
		responseHeadersHtml += makeHeaderItem(key, responseHeaders[key][0]);
	});
	responseHeadersEl.replaceChildren(createElementFromHTML(responseHeadersHtml));
};

const updateResponseBody = (responseBody) => {
	let responseBodyEl = document
		.getElementById("info")
		.querySelector('[data-title="responseBody"]')
		.querySelector(".details");
	if (responseBody === undefined) {
		return responseBodyEl.replaceChildren(
			createElementFromHTML("<div class='ml-12 block loader'></div>")
		);
	}
	responseBodyEl.innerHTML = `
    <pre><code class="language-json text-normal">${prettifyJson(
			String.fromCharCode.apply(null, responseBody)
		)}</code></pre>`;
};

const updateRequestBody = (requestBody) => {
	let requestBodyEl = document
		.getElementById("info")
		.querySelector('[data-title="requestBody"]')
		.querySelector(".details");
	if (requestBody === undefined) {
		return requestBodyEl.replaceChildren(
			createElementFromHTML("<div class='ml-12 block loader'></div>")
		);
	}
	requestBodyEl.innerHTML = `
    <pre><code class="language-json text-normal">${prettifyJson(
			String.fromCharCode.apply(null, requestBody)
		)}</code></pre>`;
};

const highlight_code = () => {
	hljs.highlightAll();
};

const changeRequestInfo = (request) => {
	active_request_id = request.id;

	updateRequestTitle(request.method, request.url);
	updateRequestHeaders(request.headers);
	updateResponseHeaders(request.response?.headers);
	updateResponseBody(request.response?.body);
	updateRequestBody(request.body);
	highlight_code();
};

const handleEvent = (e) => {
	let event = JSON.parse(e.data);
	if ("request_id" in event) {
		// Event is response, add latency for race condition
		setTimeout(function () {
			const request = requests.find(
				(request) => request.id == event.request_id
			);
			if (request) {
				request.response = event;
				update_request_status(request.id, event.status);
				if (request.id == active_request_id) {
					updateResponseHeaders(request.response.headers);
					updateResponseBody(request.response.body);
					highlight_code();
				}
			}
		}, 345);
	} else {
		try {
			event["response"] = {};
			requests.push(event);
			removeEmptyRequestsIcon();
			addRequest(event);
		} catch {
			console.log("Could not load request");
		}
	}
};

function main() {
	let sse = new EventSource("/events");
	sse.onmessage = handleEvent;
	sse.onerror = function () {
		sse.close();
		document.querySelector("#connection-status").innerHTML =
			'<div class="offline"></div> Offline';
	};
}

main();
