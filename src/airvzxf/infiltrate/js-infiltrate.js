/*jshint esversion: 8 */

/*global console*/

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function getHtmlSectionChallenge() {
	return document.querySelector("#root > div:nth-child(2) > div > div > div:nth-child(3)");
}

function getTitleChallenge() {
	return getHtmlSectionChallenge().querySelector("h4").innerText;
}

function solveBackwardGame() {
	const title = getTitleChallenge();
	console.info(title);
	const htmlSectionChallenge = getHtmlSectionChallenge();
	const phrase = htmlSectionChallenge.querySelector("p:nth-child(2)").innerText;
	console.info(phrase);

	let reactPropsName;
	for (let property in htmlSectionChallenge) {
		if (htmlSectionChallenge.hasOwnProperty(property)) {
			if (property.startsWith("__reactProps")) {
				reactPropsName = property;
			}
		}
	}

	if (reactPropsName !== undefined) {
		const reactProps = htmlSectionChallenge[reactPropsName];
		const keyEvent = reactProps.children[1];
		const keyDown = new KeyboardEvent("keydown", {
			isTrusted: true,
			key: phrase,
		});
		keyEvent.props.onKeyDown(keyDown);
	}
}

function solveBracketGame() {
	const title = getTitleChallenge();
	console.info(title);

	const htmlSectionChallenge = getHtmlSectionChallenge();
	console.info("htmlSectionChallenge:");
	console.info(htmlSectionChallenge);

	const body = document.getElementsByTagName("body");

	Array.from(document.querySelectorAll("*")).forEach(e => {
		const ev = getEventListeners(e);
		if (Object.keys(ev).length !== 0) {
			console.log(e, ev);
		}
	});

	const keyDownEvent = new Event("keydown", {
		altKey: false,
		bubbles: true,
		cancelBubble: false,
		cancelable: true,
		charCode: 0,
		code: "BracketRight",
		composed: true,
		ctrlKey: false,
		currentTarget: document,
		defaultPrevented: true,
		detail: 0,
		eventPhase: 3,
		isComposing: false,
		isTrusted: true,
		key: "]",
		keyCode: 221,
		location: 0,
		metaKey: false,
		repeat: false,
		returnValue: false,
		shiftKey: false,
		srcElement: body,
		target: body,
		type: "keydown",
		which: 221,
	});
	console.info("keyDownEvent:");
	console.info(keyDownEvent);
	document.dispatchEvent(keyDownEvent);
	htmlSectionChallenge.dispatchEvent(keyDownEvent);

	/*const phrase = htmlSectionChallenge.querySelector("p:nth-child(2)").innerText.replace("|", "");
	console.info(phrase);
	const phraseReversed = phrase.split('').reverse().join('').replace(" ", "");
	console.info(phraseReversed);

	let reactPropsName;
	for (let property in htmlSectionChallenge) {
		if (htmlSectionChallenge.hasOwnProperty(property)) {
			if (property.startsWith("__reactProps")) {
				reactPropsName = property;
			}
		}
	}

	if (reactPropsName !== undefined) {
		const reactProps = htmlSectionChallenge[reactPropsName];
		console.info("reactProps:");
		console.info(reactProps);
		const keyEvent = reactProps.children[2];
		for (let character of phraseReversed) {
			console.info("character: ");
			console.info(character);
			let bracketOpposite;
			switch (character) {
				case "(":
					bracketOpposite = ")";
					break;
				case "[":
					bracketOpposite = "]";
					break;
				case "{":
					bracketOpposite = "}";
					break;
				case "<":
					bracketOpposite = ">";
					break;
			}
			console.info("bracketOpposite: ");
			console.info(bracketOpposite);

			if (bracketOpposite === undefined) {
				continue;
			}

			const keyDown = new KeyboardEvent("keydown", {
				isTrusted: true,
				key: bracketOpposite,
			});
			keyEvent.props.onKeyDown(keyDown);
		}
	}*/
}

function solveBribeGame() {

}

function solveCheatCodeGame() {

}

function solveCountdown() {

}

function solveCyberpunk2077Game() {

}

function solveMinesweeperGame() {

}

function solveSlashGame() {

}

function solveVictory() {

}

function solveWireCuttingGame() {

}

function entrypoint() {
	switch (getTitleChallenge()) {
		case "Match the symbols!":
			break;
		case "Cut the wires with the following properties! (keyboard 1 to 9)":
			break;
		case "Say something nice about the guard":
			break;
		case "Type it backward":
			solveBackwardGame();
			break;
		case "Slash when his guard is down!":
			break;
		case "Close the brackets":
			solveBracketGame();
			break;
		case "Remember all the mines!":
			break;
		case "Enter the Code!":
			break;
	}
}

//entrypoint();

function infiltrate(place) {
	// Click on City, right side menu
	// document.querySelector("#root > div.MuiBox-root.css-1ik4laa > div.MuiDrawer-root.MuiDrawer-docked.css-v3syqg > div > ul > div:nth-child(8) > div > div > div:nth-child(1)").__reactProps$ypanhjpct8.onClick();

	// Click on place
	// document.querySelector(`[aria-label="${place}"`).__reactProps$ypanhjpct8.onClick();

	// Click on infiltrate
	const click = new Event("click", {
		isTrusted: true,
	});
	document.querySelector("#root > div.MuiBox-root.css-1ik4laa > div.jss1.MuiBox-root.css-0 > div.MuiBox-root.css-1rkt6wf > button:nth-child(6)").__reactProps$ypanhjpct8.onClick(click);
}

infiltrate("Four Sigma");
