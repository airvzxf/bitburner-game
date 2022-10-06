/**
 * Format the number into readable versions, i.e.: add commas every three digits,
 * force to show the last to decimals, if the number is decimal then it rounded
 * to the last two digits.
 *
 * @param {number} amount A number.
 * @param {boolean} twoDecimals Format .
 * @param {string} locales The location format given as language and country.
 * @returns {string} Formatted number with commas and decimals.
 */
export function formatNumberToReadable(amount, twoDecimals = false, locales = "en-US") {
	const amountRounded = Math.round(amount * 100) / 100;
	let minimumFractionDigits;

	if (twoDecimals) {
		minimumFractionDigits = 2;
	}

	return amountRounded.toLocaleString(locales, {minimumFractionDigits: minimumFractionDigits,});
}

/**
 * Given a list of strings it will return the unique values of this list.
 *
 * @param {string[]} array A number.
 * @returns {string[]} List with unique elements.
 */
function uniqueArray(array) {
	const j = {};

	array.forEach(function (v) {
		j[v + '::' + typeof v] = v;
	});

	return Object.keys(j).map(function (v) {
		return j[v];
	});
}

/**
 * Entry point of the script.
 * See general stats of the specified servers.
 *
 * @param {NS} ns Net Script.
 */
export async function main(ns) {
	const hackers = ns.getPurchasedServers();
	hackers.push("home");

	const thisScript = ns.getScriptName();
	ns.tail(thisScript);

	ns.clearLog();
	let information = "\n";
	information += "==============================\n";
	information += "= SERVER INFORMATION         =\n";
	information += "==============================\n";

	let maxHostnameChars = 0;
	const statsVictimServers = {};

	let victims = [];
	for (let hostname of hackers) {
		for (let process of ns.ps(hostname)) {
			if (process.filename !== "js-weaken.js" &&
				process.filename !== "js-weakenHack.js" &&
				process.filename !== "js-weakenGrow.js" &&
				process.filename !== "js-grow.js" &&
				process.filename !== "js-hack.js") {
				continue;
			}
			const victim = process.args[0];
			victims.push(victim);
			statsVictimServers[victim] = {weak: 0, grow: 0, hack: 0, threads: 0,};
			if (victim.length > maxHostnameChars) {
				maxHostnameChars = victim.length;
			}
		}
	}
	victims = uniqueArray(victims);

	for (let hostname of hackers) {
		if (hostname.length > maxHostnameChars) {
			maxHostnameChars = hostname.length;
		}

		for (let process of ns.ps(hostname)) {
			if (process.args.length < 1) {
				continue;
			}
			const victim = statsVictimServers[process.args[0]];
			if (process.filename === "js-weaken.js" ||
				process.filename === "js-weakenHack.js" ||
				process.filename === "js-weakenGrow.js") {
				victim.weak += process.threads;
			}
			if (process.filename === "js-grow.js") {
				victim.grow += process.threads;
			}
			if (process.filename === "js-hack.js") {
				victim.hack += process.threads;
			}
			victim.threads = victim.weak + victim.grow + victim.hack;
		}
	}

	for (let hostname of victims) {
		const victim = ns.getServer(hostname);
		const victimStats = statsVictimServers[hostname];
		const minDifficultyRounded = Math.ceil(victim.minDifficulty * 10) / 10;
		const hackDifficultyRounded = Math.ceil(victim.hackDifficulty * 10) / 10;
		const moneyMaxLength = formatNumberToReadable(victim.moneyMax).length;
		information += " 🖥️ " + hostname + "".padEnd(maxHostnameChars - hostname.length, " ");
		information += " | 🛡️ " + ns.nFormat(minDifficultyRounded, "0,0.0").padEnd(4, " ");
		information += " : " + ns.nFormat(hackDifficultyRounded, "0,0.0").padEnd(4, " ");
		information += " | 💰 $" + formatNumberToReadable(victim.moneyMax);
		information += " : $" + formatNumberToReadable(victim.moneyAvailable).padEnd(moneyMaxLength, " ");
		information += " | 🧵 " + formatNumberToReadable(victimStats.threads).toString().padEnd(5, " ");
		information += " : 🛡️ " + formatNumberToReadable(victimStats.weak).toString().padEnd(5, " ");
		information += " : 💰 " + formatNumberToReadable(victimStats.grow).toString().padEnd(5, " ");
		information += " : ‍💻 " + formatNumberToReadable(victimStats.hack).toString().padEnd(5, " ");
		information += "\n";
	}

	for (let hostname of hackers) {
		const hacker = ns.getServer(hostname);
		const ramOverloaded = hacker.ramUsed >= hacker.maxRam * 0.9 ? " 🔥" : "";
		information += " ‍💻 " + hostname + "".padEnd(maxHostnameChars - hostname.length, " ");
		information += " | 🛠️️ " + formatNumberToReadable(hacker.cpuCores);
		information += " | 📀 " + formatNumberToReadable(hacker.maxRam) + " GiB";
		information += " : " + formatNumberToReadable(hacker.ramUsed) + " GiB";
		information += ramOverloaded;
		information += "\n";
	}

	const player = ns.getPlayer();
	information += " 👨‍💻 ";
	information += " | 💰 " + ns.nFormat(player.money, "0,0.00");
	information += "\n";

	ns.print(information);
}