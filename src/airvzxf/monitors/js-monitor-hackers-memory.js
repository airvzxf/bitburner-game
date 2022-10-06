/**
 * Entry point of the script.
 * Obtains the maximum registered RAM memory usage and displays it in the log.
 *
 * @param {NS} ns Net Script.
 */
export async function main(ns) {
	const timeDelayMs = 10;
	const displayHackerbyColumns = 2;

	const hackers = ns.getPurchasedServers();
	hackers.push("home");

	const memoryUsed = {};
	let hostnameLengthMax = 0;
	for (const hostname of hackers) {
		memoryUsed[hostname] = 0;

		if (hostname.length > hostnameLengthMax) {
			hostnameLengthMax = hostname.length;
		}
	}

	ns.clearLog();
	const thisScriptName = ns.getScriptName();
	ns.tail(thisScriptName);

	let memoryRamLengthMax = 0;
	const hackersMemoryUsed = Object.keys(memoryUsed);

	while (true) {
		for (const hostname of hackers) {
			const hacker = ns.getServer(hostname);
			if (hacker.ramUsed > memoryUsed[hostname]) {
				memoryUsed[hostname] = hacker.ramUsed;

				const maxRamLength = ns.nFormat(hacker.ramUsed, "0,0.00");
				if (maxRamLength.length > memoryRamLengthMax) {
					memoryRamLengthMax = maxRamLength.length;
				}
			}
		}

		let message = "";
		let hackerIndex = 1;
		hackersMemoryUsed.forEach(function (hostname) {
			const server = ns.getServer(hostname);
			const newLineBreak = hackerIndex % displayHackerbyColumns === 0 ? "\n" : "";
			const ramUsed = ns.nFormat(memoryUsed[hostname], "0,0.00");
			const ramOverloaded = memoryUsed[hostname] >= server.maxRam * 0.9 ? "🔥" : "  ";
			message += "| " + hostname.padEnd(hostnameLengthMax) +
				" | CPU: " + server.cpuCores +
				" | RAM: " + ramUsed.padStart(memoryRamLengthMax) + ramOverloaded +
				" |" +
				newLineBreak;
			hackerIndex += 1;
		});
		ns.clearLog();
		ns.print("Max memory used for each hacker server:\n" + message);

		await ns.sleep(timeDelayMs);
	}
}