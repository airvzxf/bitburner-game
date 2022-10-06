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
 * This is a recursive function which is connecting node by node thought the network.
 * It will connect all the available nodes in the network.
 *
 * @param {NS} ns Net Script.
 * @param {string} host The name of the host which will be scanned.
 * @param {string} parentHost The name of the parent host to be removed from the scan.
 * @param {number} depth In what level in the network is now.
 * @param {boolean} displayInformation show the information.
 * @returns {{servers: string[], message: string}} All the servers in the network.
 */
export async function getAllServers(ns, host = "home", parentHost = "", connection = "", depth = -1, displayInformation = true) {
	const servers = ns.scan(host);
	let message = "";
	let newConnection = connection;
	let newDepth = depth;
	if (host === "home") {
		newConnection += host + "; ";
	} else {
		newConnection += "connect " + host + "; ";
	}
	newDepth += 1;

	const filteredServers = servers.filter(function (filterHost) {
		const server = ns.getServer(filterHost);
		return server.purchasedByPlayer !== true &&
			filterHost !== parentHost;
	});

	if (filteredServers.length === 0) {
		return {
			servers: [],
			message: "",
		};
	}

	const isNukeApp = ns.fileExists("NUKE.exe", "home");
	const isSshApp = ns.fileExists("BruteSSH.exe", "home");
	const isFtpApp = ns.fileExists("FTPCrack.exe", "home");
	const isSmtpApp = ns.fileExists("relaySMTP.exe", "home");
	const isHttpApp = ns.fileExists("HTTPWorm.exe", "home");
	const isSqlApp = ns.fileExists("SQLInject.exe", "home");
	let crackPorts = 0;
	if (isSshApp) {
		crackPorts += 1;
	}
	if (isFtpApp) {
		crackPorts += 1;
	}
	if (isSmtpApp) {
		crackPorts += 1;
	}
	if (isHttpApp) {
		crackPorts += 1;
	}
	if (isSqlApp) {
		crackPorts += 1;
	}

	const player = ns.getPlayer();
	const playerSkills = player.skills.hacking;
	let childrenServers = [];
	for (let hostname of filteredServers) {
		const serverChecks = ns.getServer(hostname);
		if (isSshApp && !serverChecks.sshPortOpen) {
			ns.brutessh(hostname);
			serverChecks.sshPortOpen = true;
			serverChecks.openPortCount += 1;
		}
		if (isFtpApp && !serverChecks.ftpPortOpen) {
			ns.ftpcrack(hostname);
			serverChecks.sshPortOpen = true;
			serverChecks.openPortCount += 1;
		}
		if (isSmtpApp && !serverChecks.smtpPortOpen) {
			ns.relaysmtp(hostname);
			serverChecks.sshPortOpen = true;
			serverChecks.openPortCount += 1;
		}
		if (isHttpApp && !serverChecks.httpPortOpen) {
			ns.httpworm(hostname);
			serverChecks.sshPortOpen = true;
			serverChecks.openPortCount += 1;
		}
		if (isSqlApp && !serverChecks.sqlPortOpen) {
			ns.sqlinject(hostname);
			serverChecks.sshPortOpen = true;
			serverChecks.openPortCount += 1;
		}

		if (player.skills.hacking >= serverChecks.requiredHackingSkill &&
			serverChecks.openPortCount >= serverChecks.numOpenPortsRequired) {

			if (!serverChecks.hasAdminRights && isNukeApp) {
				ns.nuke(hostname);
				serverChecks.hasAdminRights = true;
			}

			if (serverChecks.hasAdminRights && !serverChecks.backdoorInstalled) {
				const terminalInput = document.getElementById("terminal-input");

				if (terminalInput !== undefined) {
					terminalInput.value = newConnection + "connect " + hostname + ";  backdoor;";
					let handler = Object.keys(terminalInput)[1];
					terminalInput[handler].onChange({target: terminalInput,});
					terminalInput[handler].onKeyDown({key: 'Enter', preventDefault: () => null});
					const splitBackdoorTime = 4;
					const timeWait = ns.getHackTime(hostname) / splitBackdoorTime + 1000;
					const timeWaitReadable = ns.tFormat(timeWait, true);
					ns.tprint("Installing backdoor in " + timeWaitReadable);
					await ns.sleep(timeWait);
					serverChecks.backdoorInstalled = true;

					terminalInput.value = "home;";
					const handlerHome = Object.keys(terminalInput)[1];
					terminalInput[handlerHome].onChange({target: terminalInput,});
					terminalInput[handlerHome].onKeyDown({key: 'Enter', preventDefault: () => null});
				}
			}
		}

		const server = ns.getServer(hostname);
		if (displayInformation) {
			const spaceSize = 3;
			const spaces = "\n".padEnd(newDepth * spaceSize + 1, " ");
			const isConnected = server.isConnectedTo ? "🟢 " : "🔴 ";
			const hasAdminRights = server.hasAdminRights ? "✅" : "❌";
			const isBackdoorInstalled = server.backdoorInstalled ? "✅" : "❌";
			const isPossibleHackPorts = crackPorts >= server.numOpenPortsRequired ? "🚸️ " : "❌ ";
			const hasPorts = server.openPortCount >= server.numOpenPortsRequired ? "✅ " : isPossibleHackPorts;
			const hasSkills = playerSkills >= server.requiredHackingSkill ? "✅ " : "❌ ";
			const hackAnalysisChance = ns.hackAnalyzeChance(hostname);
			const chancesOfHack = Math.round(hackAnalysisChance * 10000) / 100;
			message += "\n";
			message += "".padStart(spaceSize * newDepth, "-");
			message += isConnected + "🖥️ " + hostname + " (" + server.ip + ")" + " | Depth: " + newDepth;
			message += spaces + "   🏢 " + server.organizationName;
			message += spaces + "   💣 Ports: " + hasPorts + server.openPortCount + " of " + server.numOpenPortsRequired;
			message += spaces + "   🧮 Hacking skill: " + hasSkills + formatNumberToReadable(server.requiredHackingSkill);
			message += spaces + "   🔑️ Admin: " + hasAdminRights;
			message += spaces + "   🚪 Backdoor: " + isBackdoorInstalled;
			message += spaces + "   🛠️ CPU cores: " + server.cpuCores;
			message += spaces + "   💿 Memory: " + formatNumberToReadable(server.maxRam) + " GiB";
			message += spaces + "   🛡️ Min security: " + server.minDifficulty;
			message += spaces + "   🛡️ Base security: " + server.baseDifficulty;
			message += spaces + "   💰 Max money: $" + formatNumberToReadable(server.moneyMax);
			message += spaces + "   💰 Grow rate: " + formatNumberToReadable(server.serverGrowth);
			message += spaces + "   💻️ Chances of hack: " + chancesOfHack + "%";
			message += spaces + "   ⛓️ Terminal: " + newConnection + "connect " + hostname + "; ";
			message += "\n";
		}

		const childrenInformation = await getAllServers(ns, hostname, host, newConnection, newDepth);
		if (childrenInformation.servers.length > 0) {
			childrenServers = [].concat(childrenServers, childrenInformation.servers);
			message += childrenInformation.message;
		}
	}

	return {
		servers: filteredServers.concat(childrenServers),
		message: message,
	};
}

/**
 * Search deep through the network and retrieve the information about each one.
 * The main function of this tool is to get valuable information, for example if the servers
 * has installed the backdoor, the opened ports, and more.
 *
 *  @param {NS} ns
 */
export async function main(ns) {
	ns.disableLog("ALL");

	const serversInformation = await getAllServers(ns);
	ns.clearLog();
	ns.print(serversInformation.message);
	const thisScript = ns.getScriptName();
	ns.tail(thisScript);
}