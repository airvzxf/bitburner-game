/**
 * @param {NS} ns Netscript.
 * @param {string} text The text message which will be formatted.
 * @param {boolean} addSecondNewLine Add a second new line at the end of the text.
 * @param {boolean} addFirstNewLine Add new line at the end of the text.
 * @param {boolean} isPrint Print in the terminal the formatted message.
 * @returns Formatted text.
 */
function formatTextToPrint(ns, text, addSecondNewLine = false, addFirstNewLine = true, isPrint = true) {
	const firstNewLine = addFirstNewLine == true ? "\n" : "";
	const secondNewLine = addSecondNewLine == true ? "\n" : "";
	const message = text + firstNewLine + secondNewLine;
	if (isPrint) ns.print(message);
	//if (isPrint) ns.tprint(message);
	//if (isPrint) console.log(message);

	return message;
}

/**
 * @param {number} amount A number.
 * @returns {string} The formatted size in bytes.
 */
export function formatNumberToBytes(amount) {
	amount = Math.round(amount * 100) / 100;

	if (amount >= 1048576) return (Math.round((amount / 1024 / 1024) * 100) / 100).toString() + " PiB";
	else if (amount >= 1024) return (Math.round((amount / 1024) * 100) / 100).toString() + " TiB";

	return amount.toString() + " GiB";
}

/**
 * @param {number} amount A number.
 * @param {string} locales The location format given as language and country.
 * @returns {string} The shorted version of the number. Example: 25645 returns 25.65k.
 */
export function formatNumberToShortReadable(amount, locales = "en-US") {
	const numberScale = {
		1: {name: "", symbol: "", scale: "", scaleSymbol: ""},
		2: {name: "kilo", symbol: "k", scale: "Thousand", scaleSymbol: "k"},
		3: {name: "mega", symbol: "M", scale: "million", scaleSymbol: "m"},
		4: {name: "giga", symbol: "G", scale: "Billion", scaleSymbol: "b"},
		5: {name: "tera", symbol: "T", scale: "Trillion", scaleSymbol: "t"},
		6: {name: "peta", symbol: "P", scale: "Quadrillion", scaleSymbol: "qa"},
		7: {name: "exa", symbol: "E", scale: "Quintillion", scaleSymbol: "qi"},
		8: {name: "zetta", symbol: "Z", scale: "Sextillion", scaleSymbol: "sx"},
		9: {name: "yotta", symbol: "Y", scale: "Septillion", scaleSymbol: "sp"},
	};

	amount = Math.round(Math.abs(amount));
	const amountLength = amount.toString().length;
	if (amountLength <= 3) return amount.toLocaleString(locales);
	const digitsGroupedByThree = Math.ceil(amountLength / 3);
	const scaleSymbol = numberScale[digitsGroupedByThree].scaleSymbol;
	const scaleMod = amountLength % 3;
	const scaleDigits = scaleMod == 0 ? 3 : scaleMod;
	const decimals = 2;
	let roundedExponent = amountLength - scaleDigits - decimals;
	if (roundedExponent < 0) roundedExponent = 0;
	const firstRoundedAmount = Math.pow(10, roundedExponent);
	const roundedAmount = Math.round(amount / firstRoundedAmount);
	const finalExponent = Math.pow(10, decimals);
	const finalAmount = roundedAmount / finalExponent;

	return finalAmount.toLocaleString(locales) + scaleSymbol;
}

/**
 * @param {number} amount A number.
 * @param {string} locales The location format given as language and country.
 * @returns {string} Formatted number with commas and decimals.
 */
export function formatNumberToReadable(amount, locales = "en-US") {
	amount = Math.round(amount * 100) / 100;

	return amount.toLocaleString(locales);
}

/**
 * @param {number} amount A number.
 * @param {string} locales The location format given as language and country.
 * @returns {string} Formatted number with commas and decimals.
 * Also, The shorted version of the number. Example: 25645 returns 25,645 ~ 25.65k.
 */
export function formatNumberToLongReadable(amount, locales = "en-US") {
	const formattedAmount = formatNumberToReadable(amount, locales)
		+ " ~ " + formatNumberToShortReadable(amount, locales);

	return formattedAmount;
}

/**
 * @param {number} time An integer number or float.
 * @param {string} locales The location format given as language and country.
 * @returns {string[]} Rounded and formatted time.
 */
function formatNumberToTime(time, locales = "en-US") {
	time = Math.round(time);
	return time.toLocaleString(locales);
}

/**
 * @param {number} time An integer number or float.
 * @returns {string[]} Rounded and formatted time for easy read.
 */
function formatNumberToReadableTime(time) {
	time = Math.round(Math.abs(time));
	const timeLength = time.toString().length;
	if (timeLength <= 3) return time.toString() + " Ms";

	let formattedTime;
	const milliseconds = time.toString().substr(timeLength - 3);
	formattedTime = milliseconds + "ms";
	time = Math.floor(time / 1000);

	const seconds = Math.floor(time % 60);
	formattedTime = seconds + "s|" + formattedTime;

	const minutes = time / 60;
	if (minutes < 1) return formattedTime;
	formattedTime = Math.floor(minutes % 60) + "m|" + formattedTime;

	const hours = minutes / 60;
	if (hours < 1) return formattedTime;
	formattedTime = Math.floor(hours % 60) + "h|" + formattedTime;

	const days = hours / 24;
	if (days < 1) return formattedTime;
	formattedTime = Math.floor(days) + "d|" + formattedTime;

	return formattedTime;
}

/**
 * @param {NS} ns Netscript.
 * @param {string} server Target server name.
 * @param {number} startMoney Tha available money in the server.
 * @param {number} targetMoney The money that you want to simulate the growth.
 * @param {number} cores Number of CPU cores on your host.
 * @param {number} serverGrowthRate The rate of the server grow.
 * @returns {number} The calculated number of threads needed to grow a server from one amount to a higher amount.
 */
function numCycleForGrowthCorrected(ns, server, startMoney = 0, targetMoney, cores = 1, serverGrowthRate = 1) {
	const serverBaseGrowthRate = 1.03;
	const serverMaxGrowthRate = 1.0035;
	const serverHackDifficulty = ns.getServer(server).hackDifficulty;
	const adjGrowthRate = 1 + (serverBaseGrowthRate - 1) / serverHackDifficulty;
	const exponentialBase = Math.min(adjGrowthRate, serverMaxGrowthRate);
	const serverGrowth = ns.getServer(server).serverGrowth;
	const serverGrowthPercentage = serverGrowth / 100.0;
	const coreMultiplier = 1 + (cores - 1) / 16;
	const playerHackingGrow = ns.getPlayer().mults.hacking_grow;
	const threadMultiplier = serverGrowthPercentage * playerHackingGrow * coreMultiplier * serverGrowthRate;
	const x = threadMultiplier * Math.log(exponentialBase);
	const y = startMoney * x + Math.log(targetMoney * x);

	let w;
	if (y < Math.log(2.5)) {
		const ey = Math.exp(y);
		w = (ey + (4 / 3) * ey * ey) / (1 + (7 / 3) * ey + (5 / 6) * ey * ey);
	} else {
		w = y;
		if (y > 0) w -= Math.log(y);
	}

	let cycles = w / x - startMoney;
	const bt = exponentialBase ** threadMultiplier;

	let corr = Infinity;
	do {
		const bct = bt ** cycles;
		const opc = startMoney + cycles;
		const diff = opc * bct - targetMoney;
		corr = diff / (opc * x + 1.0) / bct;
		cycles -= corr;
	} while (Math.abs(corr) >= 1);

	const fca = Math.floor(cycles);
	if (targetMoney <= (startMoney + fca) * Math.pow(exponentialBase, fca * threadMultiplier)) {
		return fca;
	}

	const cca = Math.ceil(cycles);
	if (targetMoney <= (startMoney + cca) * Math.pow(exponentialBase, cca * threadMultiplier)) {
		return cca;
	}

	return cca + 1;
}

/**
 * @param {NS} ns Netscript.
 * @param {string} server The name of the server.
 */
function getServerInfo(ns, server) {
	const purchasedByPlayer = ns.getServer(server).purchasedByPlayer;
	const maxRam = ns.getServer(server).maxRam;
	const cpuCores = ns.getServer(server).cpuCores;
	const hasAdminRights = ns.getServer(server).hasAdminRights;
	const backdoorInstalled = ns.getServer(server).backdoorInstalled;
	const minDifficulty = ns.getServer(server).minDifficulty;
	const moneyMax = ns.getServer(server).moneyMax;
	const numOpenPortsRequired = ns.getServer(server).numOpenPortsRequired;
	const requiredHackingSkill = ns.getServer(server).requiredHackingSkill;
	const serverGrowth = ns.getServer(server).serverGrowth;
	const hackChances = ns.hackAnalyzeChance(server) * 100;

	return {
		hostname: server,
		purchasedByPlayer: purchasedByPlayer,
		maxRam: maxRam,
		cpuCores: cpuCores,
		hasAdminRights: hasAdminRights,
		backdoorInstalled: backdoorInstalled,
		minDifficulty: minDifficulty,
		moneyMax: moneyMax,
		numOpenPortsRequired: numOpenPortsRequired,
		requiredHackingSkill: requiredHackingSkill,
		serverGrowth: serverGrowth,
		hackChances: hackChances,
	};
}

/**
 * @param {NS} ns Netscript.
 * @param {string[]} servers List with the names of the servers.
 * @returns Servers split by type: mine, externals and non-functional externals.
 */
export function getServersByType(ns, servers) {
	const toastDuration = 12000;
	let myServers = [];
	let externalServers = [];
	let externalServersRam = [];
	let externalServersMoney = [];
	let externalServersNonFunctional = [];

	for (let server of servers) {
		const serverInfo = getServerInfo(ns, server);

		if (serverInfo.purchasedByPlayer) {
			myServers.push(serverInfo);
		} else {
			if (serverInfo.maxRam > 0) {
				externalServersRam.push(serverInfo);
			}
			if (serverInfo.moneyMax > 0) {
				externalServersMoney.push(serverInfo);
			}
			if (serverInfo.maxRam == 0 && serverInfo.moneyMax == 0) {
				externalServersNonFunctional.push(serverInfo);
			}
			externalServers.push(serverInfo);
		}
	}

	//ns.toast("SUCCESS: Retrieved all the servers with their specs.", "success", toastDuration);

	return {
		myServers: myServers,
		externalServers: externalServers,
		externalServersRam: externalServersRam,
		externalServersMoney: externalServersMoney,
		externalServersNonFunctional: externalServersNonFunctional,
	};
}

/**
 * @param {NS} ns Netscript.
 * @param {string[]} servers List with the names of the servers.
 */
function copyScriptsHackerServers(ns, servers) {
	const toastDuration = 12000;
	const scripts = ["js-weaken.js", "js-grow.js", "js-hack.js"];

	for (const server of servers) {
		ns.scp(scripts, server.hostname, "home");
	}

	//ns.toast("SUCCESS: Copied all the scripts in the hacker servers.", "success", toastDuration);
}

/**
 * @param {NS} ns Netscript.
 * @param {string[]} servers List with the names of the servers.
 * @returns {string[]} The hacker servers which has the requirement specs as
 * money, required hacking skills and required open ports.
 */
export function getHackerServers(ns, servers) {
	const toastDuration = 12000;

	const hackerServers = servers.filter((filterHost) => {
		return filterHost.hasAdminRights == true
			&& filterHost.maxRam > 0;
	});

	hackerServers.sort(function (a, b) {
		return b.maxRam - a.maxRam || b.cpuCores - a.cpuCores;
	});

	//ns.toast("SUCCESS: Retrieved all the hacker servers.", "success", toastDuration);

	return hackerServers;
}

/**
 * @param {NS} ns Netscript.
 * @param {string[]} servers List with the names of the servers.
 * @returns {string[]} The victim servers which has the requirement specs as
 * money, required hacking skills and required open ports.
 */
export function getVictimServers(ns, servers) {
	const toastDuration = 12000;
	const playerHackSkills = ns.getPlayer().skills.hacking;

	const victimServers = servers.filter((filterHost) => {
		// TODO: Remove the n00dles server, it is for other tests.
		if (filterHost.hostname == "n00dles") return false;

		const openPortCount = ns.getServer(filterHost.hostname).openPortCount;
		const chanceToHack = ns.hackAnalyzeChance(filterHost.hostname);
		return filterHost.hasAdminRights == true
			&& chanceToHack >= 0.9
			&& filterHost.moneyMax > 0
			&& filterHost.requiredHackingSkill <= playerHackSkills
			&& filterHost.numOpenPortsRequired <= openPortCount;
	});

	victimServers.sort(function (a, b) {
		return b.hackChances - a.hackChances || b.moneyMax - a.moneyMax;
	});

	//ns.toast("SUCCESS: Retrieved all the victim servers.", "success", toastDuration);

	return victimServers;
}

/**
 * @param {NS} ns Netscript.
 * @param {string[]} servers List with the names of the servers.
 */
function nukeAndOpenPortsServers(ns, servers) {
	const isNuke = ns.fileExists("NUKE.exe", "home");
	const isSshCrack = ns.fileExists("BruteSSH.exe", "home");
	const isFtpCrack = ns.fileExists("FTPCrack.exe", "home");
	const isSmtpCrack = ns.fileExists("relaySMTP.exe", "home");
	const isHttpCrack = ns.fileExists("HTTPWorm.exe", "home");
	const isSqlCrack = ns.fileExists("SQLInject.exe", "home");

	for (const server of servers) {
		const hostname = server.hostname;

		if (ns.getServer(hostname).requiredHackingSkill > ns.getPlayer().skills.hacking) {
			continue;
		}

		if (ns.getServer(hostname).openPortCount == 5 && ns.getServer(hostname).hasAdminRights) {
			continue;
		}

		if (isSshCrack && !ns.getServer(hostname).sshPortOpen) {
			ns.brutessh(hostname);
		}
		if (isFtpCrack && !ns.getServer(hostname).ftpPortOpen) {
			ns.ftpcrack(hostname);
		}
		if (isSmtpCrack && !ns.getServer(hostname).smtpPortOpen) {
			ns.relaysmtp(hostname);
		}
		if (isHttpCrack && !ns.getServer(hostname).httpPortOpen) {
			ns.httpworm(hostname);
		}
		if (isSqlCrack && !ns.getServer(hostname).sqlPortOpen) {
			ns.sqlinject(hostname);
		}

		if (ns.getServer(hostname).numOpenPortsRequired > ns.getServer(hostname).openPortCount) {
			continue;
		}
		if (isNuke && !ns.getServer(hostname).hasAdminRights) {
			ns.nuke(hostname);
			server.hasAdminRights = ns.getServer(hostname).hasAdminRights;
		}
	}
}

/**
 * @param {NS} ns Netscript.
 * @param {string[]} servers List with the names of the servers.
 * @param {object[]} hackerServers List with the object of the hacker servers.
 */
function hackVictimServers(ns, servers, hackerServers) {
	const toastDuration = 12000;
	const addSecondNewLine = false;
	const addFirstNewLine = true;
	const isPrint = true;
	const script = "js-hack.js";
	const percentOfHackMoney = 0.25; // 1 = 100% | 0.75 = 75% | 0.25 = 25%

	/*for (const server of servers) {
		const hackerServer = hackerServers[0];
		formatTextToPrint(ns, "hackerServer.hostname: " + hackerServer.hostname, addSecondNewLine, addFirstNewLine, isPrint);
		const chanceHack = ns.hackAnalyzeChance(hackerServer.hostname);
		formatTextToPrint(ns, "chanceHack: " + chanceHack, addSecondNewLine, addFirstNewLine, isPrint);
		if (chanceHack < 1) {
			formatTextToPrint(ns, "if (chanceHack < 1): " + (chanceHack < 1), addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "INFO: This server does not have the 100% of chances of hack.", addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			continue;
		}

		formatTextToPrint(ns, "hackerServer.maxRam: " + formatNumberToBytes(hackerServer.maxRam), addSecondNewLine, addFirstNewLine, isPrint);
		const usedRam = ns.getServer(hackerServer.hostname).ramUsed;
		formatTextToPrint(ns, "usedRam: " + formatNumberToBytes(usedRam), addSecondNewLine, addFirstNewLine, isPrint);
		const freeRam = hackerServer.maxRam - usedRam;
		formatTextToPrint(ns, "freeRam: " + formatNumberToBytes(freeRam), addSecondNewLine, addFirstNewLine, isPrint);
		const scriptRam = ns.getScriptRam(script, hackerServer.hostname);
		formatTextToPrint(ns, "scriptRam: " + formatNumberToBytes(scriptRam), addSecondNewLine, addFirstNewLine, isPrint);
		if (freeRam < scriptRam) {
			formatTextToPrint(ns, "INFO: This hacker server is unable to run any script. Memory RAM: " + formatNumberToBytes(freeRam), addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			continue;
			return;
		}
		formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

		formatTextToPrint(ns, "server.hostname: " + server.hostname, addSecondNewLine, addFirstNewLine, isPrint);
		//formatTextToPrint(ns, "server.minDifficulty: " + server.minDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
		const hackDifficulty = ns.getServer(server.hostname).hackDifficulty;
		//formatTextToPrint(ns, "hackDifficulty: " + hackDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
		const remainderDifficulty = hackDifficulty - server.minDifficulty;
		//formatTextToPrint(ns, "remainderDifficulty: " + remainderDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
		//formatTextToPrint(ns, "server.moneyMax: " + formatNumberToLongReadable(server.moneyMax), addSecondNewLine, addFirstNewLine, isPrint);
		const moneyAvailable = ns.getServer(server.hostname).moneyAvailable;
		//formatTextToPrint(ns, "moneyAvailable: " + formatNumberToLongReadable(moneyAvailable), addSecondNewLine, addFirstNewLine, isPrint);
		const remainderMoney = server.moneyMax - moneyAvailable;
		//formatTextToPrint(ns, "remainderMoney: " + formatNumberToLongReadable(remainderMoney), addSecondNewLine, addFirstNewLine, isPrint);
		server.hackChances = ns.hackAnalyzeChance(server.hostname) * 100;
		formatTextToPrint(ns, "server.hackChances: " + formatNumberToReadable(server.hackChances), addSecondNewLine, addFirstNewLine, isPrint);

		if (hackDifficulty > server.minDifficulty) {
			formatTextToPrint(ns, "INFO: This victim server needs to weaken.", addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			continue;
		}
		if (moneyAvailable < server.moneyMax) {
			formatTextToPrint(ns, "INFO: This victim server needs to grow.", addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			continue;
		}
		formatTextToPrint(ns, "------------", addSecondNewLine, addFirstNewLine, isPrint);

		const moneyToHack = ns.getServer(server.hostname).moneyAvailable * percentOfHackMoney;
		formatTextToPrint(ns, "moneyToHack: " + formatNumberToLongReadable(moneyToHack), addSecondNewLine, addFirstNewLine, isPrint);
		let threads = Math.ceil(ns.hackAnalyzeThreads(server.hostname, moneyToHack));
		formatTextToPrint(ns, "threads: " + formatNumberToReadable(threads), addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

		const scriptMaxRam = scriptRam * threads;
		formatTextToPrint(ns, "scriptMaxRam: " + formatNumberToBytes(scriptMaxRam), addSecondNewLine, addFirstNewLine, isPrint);
		if (scriptMaxRam > freeRam) {
			formatTextToPrint(ns, "INFO: Not enough memory in the hacker server to run the hack script.", addSecondNewLine, addFirstNewLine, isPrint);
			threads = Math.floor(freeRam / scriptRam);
			formatTextToPrint(ns, "threads: " + threads, addSecondNewLine, addFirstNewLine, isPrint);
		}
		if (threads < 1) {
			formatTextToPrint(ns, "INFO: Zero threads to execute the hacking: " + threads, addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			continue;
		}
		formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

		const pid = ns.exec(script, hackerServer.hostname, threads, server.hostname);
		formatTextToPrint(ns, "***** PID: " + pid, addSecondNewLine, addFirstNewLine, isPrint);
		if (pid == 0) {
			formatTextToPrint(ns, "WARNING: The process dosen't run.", addSecondNewLine, addFirstNewLine, isPrint);
		}

		const processTimeMs = ns.getHackTime(server.hostname);
		formatTextToPrint(ns, "processTime: " + formatNumberToReadableTime(processTimeMs), addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);

		formatTextToPrint(ns, "~~~~~~~~~~~~~~~~~~~~~~~~", addSecondNewLine, addFirstNewLine, isPrint);
	}*/

	let hackedThreads = 0;
	let totalThreads = 0;
	let indexServer = 0;
	for (let hackerServer of hackerServers) {
		formatTextToPrint(ns, "************************************", addSecondNewLine, addFirstNewLine, isPrint);

		formatTextToPrint(ns, "hackerServers #" + hackerServers.length, addSecondNewLine, addFirstNewLine, isPrint);
		let listOfHackerServers = "";
		for (let thisServer of hackerServers) {
			listOfHackerServers += thisServer.hostname + ", ";
		}
		formatTextToPrint(ns, "hackerServers: " + listOfHackerServers, addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

		formatTextToPrint(ns, "hackerServer.hostname: " + hackerServer.hostname, addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "hackerServer.maxRam: " + formatNumberToBytes(hackerServer.maxRam), addSecondNewLine, addFirstNewLine, isPrint);
		const usedRam = ns.getServer(hackerServer.hostname).ramUsed;
		formatTextToPrint(ns, "usedRam: " + formatNumberToBytes(usedRam), addSecondNewLine, addFirstNewLine, isPrint);
		let freeRam = hackerServer.maxRam - usedRam;
		formatTextToPrint(ns, "freeRam: " + formatNumberToBytes(freeRam), addSecondNewLine, addFirstNewLine, isPrint);
		const scriptRam = ns.getScriptRam(script, hackerServer.hostname);
		formatTextToPrint(ns, "scriptRam: " + formatNumberToBytes(scriptRam), addSecondNewLine, addFirstNewLine, isPrint);
		if (freeRam < scriptRam) {
			formatTextToPrint(ns, "INFO: The free RAM in the hacker server is not enough to run the script.", addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			continue;
		}
		formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

		let isStillWorkingHackerServer = true;
		while (isStillWorkingHackerServer) {
			formatTextToPrint(ns, "******************", addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "servers #" + servers.length, addSecondNewLine, addFirstNewLine, isPrint);
			let listOfVictimServers = "";
			for (let thisServer of servers) {
				listOfVictimServers += thisServer.hostname + ", ";
			}
			formatTextToPrint(ns, "servers: " + listOfVictimServers, addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

			if (indexServer == servers.length) {
				formatTextToPrint(ns, "if (indexServer == servers.length): " + (indexServer == servers.length), addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "INFO: Not more victim servers in the list.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				break;
			}

			const server = servers[indexServer];
			formatTextToPrint(ns, "server.hostname: " + server.hostname, addSecondNewLine, addFirstNewLine, isPrint);

			const chanceHack = ns.hackAnalyzeChance(server.hostname);
			formatTextToPrint(ns, "chanceHack: " + formatNumberToReadable(chanceHack * 100) + " %", addSecondNewLine, addFirstNewLine, isPrint);
			if (chanceHack < 1) {
				indexServer += 1;
				formatTextToPrint(ns, "if (chanceHack < 1): " + (chanceHack < 1), addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "INFO: This server does not have the 100% of chances of hack.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				continue;
			}

			//formatTextToPrint(ns, "server.minDifficulty: " + server.minDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
			const hackDifficulty = ns.getServer(server.hostname).hackDifficulty;
			//formatTextToPrint(ns, "hackDifficulty: " + hackDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
			const remainderDifficulty = hackDifficulty - server.minDifficulty;
			formatTextToPrint(ns, "remainderDifficulty: " + remainderDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "moneyMax: $" + formatNumberToReadable(server.moneyMax), addSecondNewLine, addFirstNewLine, isPrint);
			const moneyAvailable = ns.getServer(server.hostname).moneyAvailable;
			formatTextToPrint(ns, "moneyAvailable: $" + formatNumberToReadable(moneyAvailable), addSecondNewLine, addFirstNewLine, isPrint);
			/*if (hackDifficulty > server.minDifficulty) {
				indexServer += 1;
				hackedThreads = 0;
				totalThreads = 0;
				formatTextToPrint(ns, "INFO: This victim server needs to weaken.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				continue;
			}*/
			if (moneyAvailable < server.moneyMax) {
				indexServer += 1;
				hackedThreads = 0;
				totalThreads = 0;
				formatTextToPrint(ns, "INFO: This victim server needs to grow.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				continue;
			}
			formatTextToPrint(ns, "------------", addSecondNewLine, addFirstNewLine, isPrint);

			const moneyToHack = ns.getServer(server.hostname).moneyAvailable * percentOfHackMoney;
			formatTextToPrint(ns, "moneyToHack: " + formatNumberToLongReadable(moneyToHack), addSecondNewLine, addFirstNewLine, isPrint);
			let threads = Math.ceil(ns.hackAnalyzeThreads(server.hostname, moneyToHack));
			formatTextToPrint(ns, "threads: " + formatNumberToReadable(threads), addSecondNewLine, addFirstNewLine, isPrint);
			if (totalThreads == 0) {
				totalThreads = threads;
				formatTextToPrint(ns, "totalThreads: " + formatNumberToReadable(totalThreads), addSecondNewLine, addFirstNewLine, isPrint);
			}
			formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

			let virtualThreads = totalThreads - hackedThreads;
			formatTextToPrint(ns, "virtualThreads: " + formatNumberToReadable(virtualThreads), addSecondNewLine, addFirstNewLine, isPrint);
			const maxThreadsHackerServer = Math.floor(freeRam / scriptRam);
			formatTextToPrint(ns, "maxThreadsHackerServer: " + formatNumberToReadable(maxThreadsHackerServer), addSecondNewLine, addFirstNewLine, isPrint);
			if (virtualThreads <= maxThreadsHackerServer) {
				threads = virtualThreads;
			}
			formatTextToPrint(ns, "scriptRam: " + formatNumberToBytes(scriptRam), addSecondNewLine, addFirstNewLine, isPrint);
			const scriptMaxRam = threads * scriptRam;
			formatTextToPrint(ns, "scriptMaxRam: " + formatNumberToBytes(scriptMaxRam), addSecondNewLine, addFirstNewLine, isPrint);
			if (scriptMaxRam > freeRam) {
				isStillWorkingHackerServer = false;
				formatTextToPrint(ns, "INFO: Not enough memory in the hacker server to run the hack script.", addSecondNewLine, addFirstNewLine, isPrint);
				threads = maxThreadsHackerServer;
				formatTextToPrint(ns, "threads: " + formatNumberToReadable(threads), addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			}
			if (threads < 1) {
				formatTextToPrint(ns, "INFO: Zero threads to execute the hacking.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				break;
			}
			hackedThreads += threads;
			formatTextToPrint(ns, "totalThreads: " + formatNumberToReadable(totalThreads), addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "hackedThreads: " + formatNumberToReadable(hackedThreads), addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "if (hackedThreads > totalThreads): " + (hackedThreads > totalThreads), addSecondNewLine, addFirstNewLine, isPrint);
			if (hackedThreads > totalThreads) {
				const remainderThreads = totalThreads + threads - hackedThreads;
				formatTextToPrint(ns, "remainderThreads: " + formatNumberToReadable(remainderThreads), addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "if (remainderThreads <= threads): " + (threads <= remainderThreads), addSecondNewLine, addFirstNewLine, isPrint);
				if (remainderThreads <= threads) {
					threads = remainderThreads;
					formatTextToPrint(ns, "threads: " + formatNumberToReadable(threads), addSecondNewLine, addFirstNewLine, isPrint);
				}
			}
			freeRam -= (threads * scriptRam);
			formatTextToPrint(ns, "freeRam: " + formatNumberToBytes(freeRam), addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

			const pid = ns.exec(script, hackerServer.hostname, threads, server.hostname);
			formatTextToPrint(ns, "***** PID: " + pid, addSecondNewLine, addFirstNewLine, isPrint);
			if (pid == 0) {
				formatTextToPrint(ns, "WARNING: The process dosen't run.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			}

			const processTimeMs = ns.getWeakenTime(server.hostname);
			formatTextToPrint(ns, "processTime: " + formatNumberToReadableTime(processTimeMs), addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);

			if (hackedThreads > totalThreads) {
				formatTextToPrint(ns, "if (hackedThreads > threads)", addSecondNewLine, addFirstNewLine, isPrint);
				indexServer += 1;
				hackedThreads = 0;
				totalThreads = 0;
				formatTextToPrint(ns, "INFO: This victim server (" + server.hostname + ") is hacked.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				continue;
			}

			if (!isStillWorkingHackerServer) {
				formatTextToPrint(ns, "INFO: The free RAM in the hacker server is not enough to run the script.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				break;
			}

			indexServer += 1;
			hackedThreads = 0;
			totalThreads = 0;
			formatTextToPrint(ns, "INFO: This victim server (" + server.hostname + ") is hacked.", addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "~~~~~~~~~~~~~~~~~~~~~~~~", addSecondNewLine, addFirstNewLine, isPrint);
		}
	}

	//ns.toast("SUCCESS: Hacked all the victims servers.", "success", toastDuration);
}

/**
 * @param {NS} ns Netscript.
 * @param {string[]} servers List with the names of the servers.
 * @param {object[]} hackerServers List with the object of the hacker servers.
 */
async function growVictimServers(ns, servers, hackerServers) {
	const toastDuration = 12000;
	const addSecondNewLine = false;
	const addFirstNewLine = true;
	const isPrint = true;
	const script = "js-grow.js";

	/*for (const server of servers) {
		const hackerServer = hackerServers[0];
		formatTextToPrint(ns, "hackerServer.hostname: " + hackerServer.hostname, addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "hackerServer.maxRam: " + formatNumberToBytes(hackerServer.maxRam), addSecondNewLine, addFirstNewLine, isPrint);
		const usedRam = ns.getServer(hackerServer.hostname).ramUsed;
		formatTextToPrint(ns, "usedRam: " + formatNumberToBytes(usedRam), addSecondNewLine, addFirstNewLine, isPrint);
		const freeRam = hackerServer.maxRam - usedRam;
		formatTextToPrint(ns, "freeRam: " + formatNumberToBytes(freeRam), addSecondNewLine, addFirstNewLine, isPrint);
		const scriptRam = ns.getScriptRam(script, hackerServer.hostname);
		formatTextToPrint(ns, "scriptRam: " + formatNumberToBytes(scriptRam), addSecondNewLine, addFirstNewLine, isPrint);
		if (freeRam < scriptRam) {
			formatTextToPrint(ns, "INFO: This hacker server is unable to run any script. Memory RAM: " + formatNumberToBytes(freeRam), addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			continue;
		}
		formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

		formatTextToPrint(ns, "server.hostname: " + server.hostname, addSecondNewLine, addFirstNewLine, isPrint);
		//formatTextToPrint(ns, "server.minDifficulty: " + server.minDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
		const hackDifficulty = ns.getServer(server.hostname).hackDifficulty;
		//formatTextToPrint(ns, "hackDifficulty: " + hackDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
		const remainderDifficulty = hackDifficulty - server.minDifficulty;
		//formatTextToPrint(ns, "remainderDifficulty: " + remainderDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
		//formatTextToPrint(ns, "server.moneyMax: " + formatNumberToLongReadable(server.moneyMax), addSecondNewLine, addFirstNewLine, isPrint);
		const moneyAvailable = ns.getServer(server.hostname).moneyAvailable;
		//formatTextToPrint(ns, "moneyAvailable: " + formatNumberToLongReadable(moneyAvailable), addSecondNewLine, addFirstNewLine, isPrint);
		const remainderMoney = server.moneyMax - moneyAvailable;
		//formatTextToPrint(ns, "remainderMoney: " + formatNumberToLongReadable(remainderMoney), addSecondNewLine, addFirstNewLine, isPrint);

		if (moneyAvailable == server.moneyMax) {
			formatTextToPrint(ns, "INFO: This victim server is grown.", addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			continue;
		}
		formatTextToPrint(ns, "------------", addSecondNewLine, addFirstNewLine, isPrint);

		formatTextToPrint(ns, "hackerServer.cpuCores: " + hackerServer.cpuCores, addSecondNewLine, addFirstNewLine, isPrint);
		let threads = numCycleForGrowthCorrected(ns, server.hostname, moneyAvailable, server.moneyMax, hackerServer.cpuCores);
		formatTextToPrint(ns, "threads: " + formatNumberToReadable(threads), addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

		const scriptMaxRam = scriptRam * threads;
		formatTextToPrint(ns, "scriptMaxRam: " + formatNumberToBytes(scriptMaxRam), addSecondNewLine, addFirstNewLine, isPrint);
		if (scriptMaxRam > freeRam) {
			formatTextToPrint(ns, "INFO: Not enough memory in the hacker server to run the growth script.", addSecondNewLine, addFirstNewLine, isPrint);
			threads = Math.floor(freeRam / scriptRam);
			formatTextToPrint(ns, "threads: " + threads, addSecondNewLine, addFirstNewLine, isPrint);
		}
		if (threads < 1) {
			formatTextToPrint(ns, "INFO: Zero threads to execute the growing: " + threads, addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			continue;
		}
		formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

		const pid = ns.exec(script, hackerServer.hostname, threads, server.hostname);
		formatTextToPrint(ns, "***** PID: " + pid, addSecondNewLine, addFirstNewLine, isPrint);
		if (pid == 0) {
			formatTextToPrint(ns, "WARNING: The process dosen't run.", addSecondNewLine, addFirstNewLine, isPrint);
		}

		const processTimeMs = ns.getGrowTime(server.hostname);
		formatTextToPrint(ns, "processTime: " + formatNumberToReadableTime(processTimeMs), addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);

		formatTextToPrint(ns, "~~~~~~~~~~~~~~~~~~~~~~~~", addSecondNewLine, addFirstNewLine, isPrint);
	}*/

	let hackedThreads = 0;
	let totalThreads = 0;
	let indexServer = 0;
	for (let hackerServer of hackerServers) {
		formatTextToPrint(ns, "************************************", addSecondNewLine, addFirstNewLine, isPrint);

		formatTextToPrint(ns, "hackerServers #" + hackerServers.length, addSecondNewLine, addFirstNewLine, isPrint);
		let listOfHackerServers = "";
		for (let thisServer of hackerServers) {
			listOfHackerServers += thisServer.hostname + ", ";
		}
		formatTextToPrint(ns, "hackerServers: " + listOfHackerServers, addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

		formatTextToPrint(ns, "hackerServer.hostname: " + hackerServer.hostname, addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "hackerServer.maxRam: " + formatNumberToBytes(hackerServer.maxRam), addSecondNewLine, addFirstNewLine, isPrint);
		const usedRam = ns.getServer(hackerServer.hostname).ramUsed;
		formatTextToPrint(ns, "usedRam: " + formatNumberToBytes(usedRam), addSecondNewLine, addFirstNewLine, isPrint);
		let freeRam = hackerServer.maxRam - usedRam;
		formatTextToPrint(ns, "freeRam: " + formatNumberToBytes(freeRam), addSecondNewLine, addFirstNewLine, isPrint);
		const scriptRam = ns.getScriptRam(script, hackerServer.hostname);
		formatTextToPrint(ns, "scriptRam: " + formatNumberToBytes(scriptRam), addSecondNewLine, addFirstNewLine, isPrint);
		if (freeRam < scriptRam) {
			formatTextToPrint(ns, "INFO: The free RAM in the hacker server is not enough to run the script.", addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			continue;
		}
		formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

		let isStillWorkingHackerServer = true;
		while (isStillWorkingHackerServer) {
			formatTextToPrint(ns, "******************", addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "servers #" + servers.length, addSecondNewLine, addFirstNewLine, isPrint);
			let listOfVictimServers = "";
			for (let thisServer of servers) {
				listOfVictimServers += thisServer.hostname + ", ";
			}
			formatTextToPrint(ns, "servers: " + listOfVictimServers, addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

			if (indexServer == servers.length) {
				formatTextToPrint(ns, "if (indexServer == servers.length): " + (indexServer == servers.length), addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "INFO: Not more victim servers in the list.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				break;
			}

			const server = servers[indexServer];
			formatTextToPrint(ns, "server.hostname: " + server.hostname, addSecondNewLine, addFirstNewLine, isPrint);
			//formatTextToPrint(ns, "server.minDifficulty: " + server.minDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
			const hackDifficulty = ns.getServer(server.hostname).hackDifficulty;
			//formatTextToPrint(ns, "hackDifficulty: " + hackDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
			const remainderDifficulty = hackDifficulty - server.minDifficulty;
			formatTextToPrint(ns, "remainderDifficulty: " + remainderDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "moneyMax: $" + formatNumberToReadable(server.moneyMax), addSecondNewLine, addFirstNewLine, isPrint);
			const moneyAvailable = ns.getServer(server.hostname).moneyAvailable;
			formatTextToPrint(ns, "moneyAvailable: $" + formatNumberToReadable(moneyAvailable), addSecondNewLine, addFirstNewLine, isPrint);

			if (server.moneyMax == moneyAvailable) {
				formatTextToPrint(ns, "if (server.moneyMax == moneyAvailable)", addSecondNewLine, addFirstNewLine, isPrint);
				indexServer += 1;
				hackedThreads = 0;
				totalThreads = 0;
				formatTextToPrint(ns, "INFO: This victim server (" + server.hostname + ") is grown.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				continue;
			}
			formatTextToPrint(ns, "------------", addSecondNewLine, addFirstNewLine, isPrint);

			formatTextToPrint(ns, "hackerServer.cpuCores: " + hackerServer.cpuCores, addSecondNewLine, addFirstNewLine, isPrint);
			let threads = numCycleForGrowthCorrected(ns, server.hostname, moneyAvailable, server.moneyMax, hackerServer.cpuCores);
			formatTextToPrint(ns, "threads: " + formatNumberToReadable(threads), addSecondNewLine, addFirstNewLine, isPrint);
			if (totalThreads == 0) {
				totalThreads = threads;
				formatTextToPrint(ns, "totalThreads: " + formatNumberToReadable(totalThreads), addSecondNewLine, addFirstNewLine, isPrint);
			}
			formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

			let virtualThreads = totalThreads - hackedThreads;
			formatTextToPrint(ns, "virtualThreads: " + formatNumberToReadable(virtualThreads), addSecondNewLine, addFirstNewLine, isPrint);
			const maxThreadsHackerServer = Math.floor(freeRam / scriptRam);
			formatTextToPrint(ns, "maxThreadsHackerServer: " + formatNumberToReadable(maxThreadsHackerServer), addSecondNewLine, addFirstNewLine, isPrint);
			if (virtualThreads <= maxThreadsHackerServer) {
				threads = virtualThreads;
			}
			formatTextToPrint(ns, "scriptRam: " + formatNumberToBytes(scriptRam), addSecondNewLine, addFirstNewLine, isPrint);
			const scriptMaxRam = threads * scriptRam;
			formatTextToPrint(ns, "scriptMaxRam: " + formatNumberToBytes(scriptMaxRam), addSecondNewLine, addFirstNewLine, isPrint);
			if (scriptMaxRam > freeRam) {
				isStillWorkingHackerServer = false;
				formatTextToPrint(ns, "INFO: Not enough memory in the hacker server to run the growth script.", addSecondNewLine, addFirstNewLine, isPrint);
				threads = maxThreadsHackerServer;
				formatTextToPrint(ns, "threads: " + formatNumberToReadable(threads), addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			}
			if (threads < 1) {
				formatTextToPrint(ns, "INFO: Zero threads to execute the growing.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				break;
			}
			hackedThreads += threads;
			formatTextToPrint(ns, "totalThreads: " + formatNumberToReadable(totalThreads), addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "hackedThreads: " + formatNumberToReadable(hackedThreads), addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "if (hackedThreads > totalThreads): " + (hackedThreads > totalThreads), addSecondNewLine, addFirstNewLine, isPrint);
			if (hackedThreads > totalThreads) {
				const remainderThreads = totalThreads + threads - hackedThreads;
				formatTextToPrint(ns, "remainderThreads: " + formatNumberToReadable(remainderThreads), addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "if (remainderThreads <= threads): " + (threads <= remainderThreads), addSecondNewLine, addFirstNewLine, isPrint);
				if (remainderThreads <= threads) {
					threads = remainderThreads;
					formatTextToPrint(ns, "threads: " + formatNumberToReadable(threads), addSecondNewLine, addFirstNewLine, isPrint);
				}
			}
			freeRam -= (threads * scriptRam);
			formatTextToPrint(ns, "freeRam: " + formatNumberToBytes(freeRam), addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

			const pid = ns.exec(script, hackerServer.hostname, threads, server.hostname);
			formatTextToPrint(ns, "***** PID: " + pid, addSecondNewLine, addFirstNewLine, isPrint);
			if (pid == 0) {
				formatTextToPrint(ns, "WARNING: The process dosen't run.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
			}

			const processTimeMs = ns.getWeakenTime(server.hostname);
			formatTextToPrint(ns, "processTime: " + formatNumberToReadableTime(processTimeMs), addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);

			if (hackedThreads > totalThreads) {
				formatTextToPrint(ns, "if (hackedThreads > threads)", addSecondNewLine, addFirstNewLine, isPrint);
				indexServer += 1;
				hackedThreads = 0;
				totalThreads = 0;
				formatTextToPrint(ns, "INFO: This victim server (" + server.hostname + ") is grown.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				continue;
			}

			if (!isStillWorkingHackerServer) {
				formatTextToPrint(ns, "INFO: The free RAM in the hacker server is not enough to run the script.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				break;
			}

			indexServer += 1;
			hackedThreads = 0;
			totalThreads = 0;
			formatTextToPrint(ns, "INFO: This victim server (" + server.hostname + ") is grown.", addSecondNewLine, addFirstNewLine, isPrint);
			formatTextToPrint(ns, "~~~~~~~~~~~~~~~~~~~~~~~~", addSecondNewLine, addFirstNewLine, isPrint);
		}
	}

	//ns.toast("SUCCESS: Grew on all the victims servers.", "success", toastDuration);
}

/**
 * @param {NS} ns Netscript.
 * @param {string[]} servers List with the names of the servers.
 * @param {object[]} hackerServers List with the object of the hacker servers.
 */
async function weakenVictimServers(ns, servers, hackerServers) {
	const toastDuration = 12000;
	const addSecondNewLine = false;
	const addFirstNewLine = true;
	const isPrint = true;
	const script = "js-weaken.js";

	let totalProcessedServers = 0;
	let totalProcessedHackerServers = hackerServers.length;

	while (totalProcessedServers < servers.length && totalProcessedHackerServers == hackerServers.length) {
		//formatTextToPrint(ns, "servers #" + servers.length, addSecondNewLine, addFirstNewLine, isPrint);
		//formatTextToPrint(ns, "hackerServers #" + hackerServers.length, addSecondNewLine, addFirstNewLine, isPrint);
		//formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);

		let hackedThreads = 0;
		let totalThreads = 0;
		let indexServer = 0;
		totalProcessedServers = 0;
		totalProcessedHackerServers = 0;
		let lastProcessedHackerServers = "";
		for (let hackerServer of hackerServers) {
			//formatTextToPrint(ns, "************************************", addSecondNewLine, addFirstNewLine, isPrint);
			lastProcessedHackerServers = hackerServer.hostname;

			//formatTextToPrint(ns, "hackerServers #" + hackerServers.length, addSecondNewLine, addFirstNewLine, isPrint);
			let listOfHackerServers = "";
			for (let thisServer of hackerServers) {
				listOfHackerServers += thisServer.hostname + ", ";
			}
			//formatTextToPrint(ns, "hackerServers: " + listOfHackerServers, addSecondNewLine, addFirstNewLine, isPrint);
			//formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

			//formatTextToPrint(ns, "hackerServer.hostname: " + hackerServer.hostname, addSecondNewLine, addFirstNewLine, isPrint);
			//formatTextToPrint(ns, "hackerServer.maxRam: " + formatNumberToBytes(hackerServer.maxRam), addSecondNewLine, addFirstNewLine, isPrint);
			const usedRam = ns.getServer(hackerServer.hostname).ramUsed;
			//formatTextToPrint(ns, "usedRam: " + formatNumberToBytes(usedRam), addSecondNewLine, addFirstNewLine, isPrint);
			let freeRam = hackerServer.maxRam - usedRam;
			//formatTextToPrint(ns, "freeRam: " + formatNumberToBytes(freeRam), addSecondNewLine, addFirstNewLine, isPrint);
			const scriptRam = ns.getScriptRam(script, hackerServer.hostname);
			//formatTextToPrint(ns, "scriptRam: " + formatNumberToBytes(scriptRam), addSecondNewLine, addFirstNewLine, isPrint);
			if (freeRam < scriptRam) {
				formatTextToPrint(ns, "INFO: The free RAM in the hacker server is not enough to run the script.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				continue;
			}
			//formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

			let isStillWorkingHackerServer = true;
			while (isStillWorkingHackerServer) {
				//formatTextToPrint(ns, "******************", addSecondNewLine, addFirstNewLine, isPrint);
				//formatTextToPrint(ns, "servers #" + servers.length, addSecondNewLine, addFirstNewLine, isPrint);
				let listOfVictimServers = "";
				for (let thisServer of servers) {
					listOfVictimServers += thisServer.hostname + ", ";
				}
				//formatTextToPrint(ns, "servers: " + listOfVictimServers, addSecondNewLine, addFirstNewLine, isPrint);
				//formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

				if (indexServer == servers.length) {
					//formatTextToPrint(ns, "if (indexServer == servers.length): " + (indexServer == servers.length), addSecondNewLine, addFirstNewLine, isPrint);
					formatTextToPrint(ns, "INFO: Not more victim servers in the list.", addSecondNewLine, addFirstNewLine, isPrint);
					formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
					break;
				}

				const server = servers[indexServer];
				//formatTextToPrint(ns, "server.hostname: " + server.hostname, addSecondNewLine, addFirstNewLine, isPrint);
				////formatTextToPrint(ns, "server.minDifficulty: " + server.minDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
				const hackDifficulty = ns.getServer(server.hostname).hackDifficulty;
				////formatTextToPrint(ns, "hackDifficulty: " + hackDifficulty, addSecondNewLine, addFirstNewLine, isPrint);
				const remainderDifficulty = hackDifficulty - server.minDifficulty;
				//formatTextToPrint(ns, "remainderDifficulty: " + remainderDifficulty, addSecondNewLine, addFirstNewLine, isPrint);

				if (hackDifficulty == server.minDifficulty) {
					//formatTextToPrint(ns, "if (hackDifficulty == server.minDifficulty)", addSecondNewLine, addFirstNewLine, isPrint);
					indexServer += 1;
					hackedThreads = 0;
					totalThreads = 0;
					totalProcessedServers += 1;
					//formatTextToPrint(ns, "totalProcessedServers: " + totalProcessedServers, addSecondNewLine, addFirstNewLine, isPrint);
					formatTextToPrint(ns, "INFO: This victim server (" + server.hostname + ") is weakened.", addSecondNewLine, addFirstNewLine, isPrint);
					formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
					continue;
				}
				totalProcessedServers = 0;
				//formatTextToPrint(ns, "totalProcessedServers: " + totalProcessedServers, addSecondNewLine, addFirstNewLine, isPrint);
				//formatTextToPrint(ns, "------------", addSecondNewLine, addFirstNewLine, isPrint);

				//formatTextToPrint(ns, "hackerServer.cpuCores: " + hackerServer.cpuCores, addSecondNewLine, addFirstNewLine, isPrint);
				const weaknessAnalysis = ns.weakenAnalyze(1, hackerServer.cpuCores);
				//formatTextToPrint(ns, "weaknessAnalysis: " + weaknessAnalysis, addSecondNewLine, addFirstNewLine, isPrint);
				let threads = Math.ceil(remainderDifficulty / weaknessAnalysis);
				//formatTextToPrint(ns, "threads: " + threads, addSecondNewLine, addFirstNewLine, isPrint);
				if (totalThreads == 0) {
					totalThreads = threads;
					//formatTextToPrint(ns, "totalThreads: " + formatNumberToReadable(totalThreads), addSecondNewLine, addFirstNewLine, isPrint);
				}
				//formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

				let virtualThreads = totalThreads - hackedThreads;
				//formatTextToPrint(ns, "virtualThreads: " + formatNumberToReadable(virtualThreads), addSecondNewLine, addFirstNewLine, isPrint);
				const maxThreadsHackerServer = Math.floor(freeRam / scriptRam);
				//formatTextToPrint(ns, "maxThreadsHackerServer: " + formatNumberToReadable(maxThreadsHackerServer), addSecondNewLine, addFirstNewLine, isPrint);
				if (virtualThreads <= maxThreadsHackerServer) {
					threads = virtualThreads;
				}
				//formatTextToPrint(ns, "scriptRam: " + formatNumberToBytes(scriptRam), addSecondNewLine, addFirstNewLine, isPrint);
				const scriptMaxRam = threads * scriptRam;
				//formatTextToPrint(ns, "scriptMaxRam: " + formatNumberToBytes(scriptMaxRam), addSecondNewLine, addFirstNewLine, isPrint);
				if (scriptMaxRam > freeRam) {
					isStillWorkingHackerServer = false;
					formatTextToPrint(ns, "INFO: Not enough memory in the hacker server to run the weaken script.", addSecondNewLine, addFirstNewLine, isPrint);
					threads = maxThreadsHackerServer;
					//formatTextToPrint(ns, "threads: " + formatNumberToReadable(threads), addSecondNewLine, addFirstNewLine, isPrint);
					formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				}
				if (threads < 1) {
					formatTextToPrint(ns, "INFO: Zero threads to execute the weakening.", addSecondNewLine, addFirstNewLine, isPrint);
					formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
					break;
				}
				hackedThreads += threads;
				//formatTextToPrint(ns, "totalThreads: " + formatNumberToReadable(totalThreads), addSecondNewLine, addFirstNewLine, isPrint);
				//formatTextToPrint(ns, "hackedThreads: " + formatNumberToReadable(hackedThreads), addSecondNewLine, addFirstNewLine, isPrint);
				//formatTextToPrint(ns, "if (hackedThreads > totalThreads): " + (hackedThreads > totalThreads), addSecondNewLine, addFirstNewLine, isPrint);
				if (hackedThreads > totalThreads) {
					const remainderThreads = totalThreads + threads - hackedThreads;
					//formatTextToPrint(ns, "remainderThreads: " + formatNumberToReadable(remainderThreads), addSecondNewLine, addFirstNewLine, isPrint);
					//formatTextToPrint(ns, "if (remainderThreads <= threads): " + (threads <= remainderThreads), addSecondNewLine, addFirstNewLine, isPrint);
					if (remainderThreads <= threads) {
						threads = remainderThreads;
						//formatTextToPrint(ns, "threads: " + formatNumberToReadable(threads), addSecondNewLine, addFirstNewLine, isPrint);
					}
				}
				freeRam -= (threads * scriptRam);
				//formatTextToPrint(ns, "freeRam: " + formatNumberToBytes(freeRam), addSecondNewLine, addFirstNewLine, isPrint);
				//formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

				if (lastProcessedHackerServers != server.hostname) {
					formatTextToPrint(ns, "if (lastProcessedHackerServers != server.hostname): " + (lastProcessedHackerServers != server.hostname), addSecondNewLine, addFirstNewLine, isPrint);
					totalProcessedHackerServers += 1;
					formatTextToPrint(ns, "totalProcessedHackerServers: " + totalProcessedHackerServers, addSecondNewLine, addFirstNewLine, isPrint);
					lastProcessedHackerServers = server.hostname;
				}
				formatTextToPrint(ns, "------", addSecondNewLine, addFirstNewLine, isPrint);

				const pid = ns.exec(script, hackerServer.hostname, threads, server.hostname);
				//formatTextToPrint(ns, "***** PID: " + pid, addSecondNewLine, addFirstNewLine, isPrint);
				if (pid == 0) {
					formatTextToPrint(ns, "WARNING: The process dosen't run.", addSecondNewLine, addFirstNewLine, isPrint);
					formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
				}

				const processTimeMs = ns.getWeakenTime(server.hostname);
				//formatTextToPrint(ns, "processTime: " + formatNumberToReadableTime(processTimeMs), addSecondNewLine, addFirstNewLine, isPrint);
				//formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);

				if (hackedThreads > totalThreads) {
					//formatTextToPrint(ns, "if (hackedThreads > threads)", addSecondNewLine, addFirstNewLine, isPrint);
					indexServer += 1;
					hackedThreads = 0;
					totalThreads = 0;
					formatTextToPrint(ns, "INFO: This victim server (" + server.hostname + ") is weakened.", addSecondNewLine, addFirstNewLine, isPrint);
					formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
					continue;
				}

				if (!isStillWorkingHackerServer) {
					formatTextToPrint(ns, "INFO: The free RAM in the hacker server is not enough to run the script.", addSecondNewLine, addFirstNewLine, isPrint);
					formatTextToPrint(ns, "________________________", addSecondNewLine, addFirstNewLine, isPrint);
					break;
				}

				indexServer += 1;
				hackedThreads = 0;
				totalThreads = 0;
				formatTextToPrint(ns, "INFO: This victim server (" + server.hostname + ") is weakened.", addSecondNewLine, addFirstNewLine, isPrint);
				formatTextToPrint(ns, "~~~~~~~~~~~~~~~~~~~~~~~~", addSecondNewLine, addFirstNewLine, isPrint);
			}
		}
		await ns.sleep(200);
	}

	//ns.toast("SUCCESS: Weakened all victim servers.", "success", toastDuration);
}

/**
 * @param {NS} ns Netscript.
 * @param {string} host The name of the host which will be scan.
 * @param {string} parentHost The name of the parent host to be removed from the scan.
 * @returns {string[]} All the servers in the network.
 */
export function getAllServers(ns, host = "home", parentHost = "") {
	const servers = ns.scan(host);

	const filteredServers = servers.filter((filterHost) => {
		return filterHost != parentHost;
	});

	if (filteredServers.length == 0) {
		return [];
	}

	let childrenServers = [];
	for (let server of filteredServers) {
		const children = getAllServers(ns, server, host);
		if (children.length > 0) {
			childrenServers = [].concat(childrenServers, children);
		}
	}

	return filteredServers.concat(childrenServers);
}

/**
 * @param {NS} ns Netscript.
 * @param {number} minRamGbServer The minimum size of the RAM in GiBs, which will be buy.
 * @param {number} maxRamGbServer The maximum size of the RAM in GiBs, which will be upgraded.
 */
function buyPersonalServers(ns, minRamGbServer = 2, maxRamGbServer = 1048576) {
	const servers = [];
	const serverNamePrefix = "mrRobot-";
	const ramScalars = {
		1: {exponent: 0, description: "1_GiB"},
		2: {exponent: 1, description: "2_GiB"},
		4: {exponent: 2, description: "4_GiB"},
		8: {exponent: 3, description: "8_GiB"},
		16: {exponent: 4, description: "16_GiB"},
		32: {exponent: 5, description: "32_GiB"},
		64: {exponent: 6, description: "64_GiB"},
		128: {exponent: 7, description: "128_GiB"},
		256: {exponent: 8, description: "256_GiB"},
		512: {exponent: 9, description: "512_GiB"},
		1024: {exponent: 10, description: "1_TiB"},
		2048: {exponent: 11, description: "2_TiB"},
		4096: {exponent: 12, description: "4_TiB"},
		8192: {exponent: 13, description: "8_TiB"},
		16384: {exponent: 14, description: "16_TiB"},
		32768: {exponent: 15, description: "32_TiB"},
		65536: {exponent: 16, description: "64_TiB"},
		131072: {exponent: 17, description: "128_TiB"},
		262144: {exponent: 18, description: "256_TiB"},
		524288: {exponent: 19, description: "512_TiB"},
		1048576: {exponent: 20, description: "1_PiB"},
	};

	const purchasedServerLimit = ns.getPurchasedServerLimit();
	let purchasedServers = ns.getPurchasedServers();

	// Buy for first time.
	const purchasedServerMinCost = ns.getPurchasedServerCost(minRamGbServer);
	const startIndexPurchase = 1 + purchasedServers.length;
	for (let indexServer = startIndexPurchase; indexServer <= purchasedServerLimit; indexServer++) {
		const playerAvailableMoney = ns.getPlayer().money;
		if (playerAvailableMoney < purchasedServerMinCost) {
			break;
		}
		const hostname = serverNamePrefix + indexServer + "-" + ramScalars[minRamGbServer].description;
		ns.purchaseServer(hostname, minRamGbServer);
	}

	// Upgrade existing servers.
	let minServerRamDetected;
	let continueBuyingServers = true;
	while (continueBuyingServers) {
		purchasedServers = ns.getPurchasedServers();
		minServerRamDetected = Math.pow(2, 30);

		for (let server of purchasedServers) {
			const maxRamServer = ns.getServer(server).maxRam;
			const minRam = Math.min(minServerRamDetected, maxRamServer);
			if (minRam < minServerRamDetected) {
				minServerRamDetected = minRam;
			}
		}

		if (minServerRamDetected > maxRamGbServer) {
			break;
		}

		for (let indexServer = 1; indexServer <= purchasedServers.length; indexServer++) {
			const server = purchasedServers[indexServer - 1];
			const maxRamServer = ns.getServer(server).maxRam;
			if (maxRamServer != minServerRamDetected) {
				continue;
			}
			const nextRamExponent = ramScalars[maxRamServer].exponent + 1;
			const nextRamLevel = Math.pow(2, nextRamExponent);
			if (nextRamLevel > maxRamGbServer) {
				continueBuyingServers = false;
				break;
			}
			const playerAvailableMoney = ns.getPlayer().money;
			const purchasedServerMinCost = ns.getPurchasedServerCost(nextRamLevel);
			if (playerAvailableMoney < purchasedServerMinCost) {
				continueBuyingServers = false;
				break;
			}
			const hostname = serverNamePrefix + indexServer + "-" + ramScalars[nextRamLevel].description;
			ns.deleteServer(server);
			ns.purchaseServer(hostname, nextRamLevel);
		}
	}

	for (let server of ns.getPurchasedServers()) {
		servers.push(getServerInfo(ns, server));
	}

	return servers;
}

/**
 * @param {NS} ns Netscript.
 */
export async function main(ns) {
	const toastDuration = 12000;
	const waitFor = 300;
	const addSecondNewLine = false;
	const addFirstNewLine = true;
	const isPrint = true;

	const flagsArguments = ns.flags([
		['useHomeServer', false],
	]);

	formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
	formatTextToPrint(ns, "| Get all the servers                            |", addSecondNewLine, addFirstNewLine, isPrint);
	formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
	const allServers = getAllServers(ns);
	if (flagsArguments.useHomeServer) {
		allServers.push("home");
	}
	formatTextToPrint(ns, "allServers #" + allServers.length, addSecondNewLine, addFirstNewLine, isPrint);
	for (let server of allServers) {
		formatTextToPrint(ns, "server: " + server, addSecondNewLine, addFirstNewLine, isPrint);
	}
	formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);
	await ns.sleep(waitFor);

	formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
	formatTextToPrint(ns, "| Split all the servers by type                  |", addSecondNewLine, addFirstNewLine, isPrint);
	formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
	const serversByType = getServersByType(ns, allServers);
	formatTextToPrint(ns, "serversByType:", addSecondNewLine, addFirstNewLine, isPrint);
	formatTextToPrint(ns, JSON.stringify(serversByType), addSecondNewLine, addFirstNewLine, isPrint);
	formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);
	await ns.sleep(waitFor);

	const minRamGbServer = 2;
	const maxRamGbServer = 1024;
	while (true) {
		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "| Buy personal servers                            |", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		serversByType.myServers = buyPersonalServers(ns, minRamGbServer, maxRamGbServer);
		formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);
		await ns.sleep(waitFor);

		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "| Nuke the external servers and open ports       |", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		nukeAndOpenPortsServers(ns, serversByType.externalServers);
		formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);
		await ns.sleep(waitFor);

		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "| Get the available victim servers               |", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "allVictimServers #" + serversByType.externalServersMoney.length, addSecondNewLine, addFirstNewLine, isPrint);
		const victimServers = getVictimServers(ns, serversByType.externalServersMoney);
		formatTextToPrint(ns, "victimServers #" + victimServers.length, addSecondNewLine, addFirstNewLine, isPrint);
		for (let server of victimServers) {
			let information = "";
			information += server.hostname;
			information += " | hasAdminRights: " + server.hasAdminRights;
			information += " | serverGrowth: " + formatNumberToReadable(server.serverGrowth);
			information += " | minDifficulty: " + formatNumberToReadable(server.minDifficulty);
			information += " | hackChances: " + formatNumberToReadable(server.hackChances) + "%";
			information += " | moneyMax: $" + formatNumberToLongReadable(server.moneyMax);
			formatTextToPrint(ns, information, addSecondNewLine, addFirstNewLine, isPrint);
		}
		formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);
		await ns.sleep(waitFor);

		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "| Get the available hacker servers               |", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		const allHackerServers = serversByType.externalServersRam.concat(serversByType.myServers);
		formatTextToPrint(ns, "allHackerServers #" + allHackerServers.length, addSecondNewLine, addFirstNewLine, isPrint);
		const hackerServers = getHackerServers(ns, allHackerServers);
		formatTextToPrint(ns, "hackerServers #" + hackerServers.length, addSecondNewLine, addFirstNewLine, isPrint);
		for (let server of hackerServers) {
			let information = "";
			information += server.hostname;
			information += " | hasAdminRights: " + server.hasAdminRights;
			information += " | cpuCores: " + formatNumberToReadable(server.cpuCores);
			information += " | maxRam: " + formatNumberToBytes(server.maxRam);
			formatTextToPrint(ns, information, addSecondNewLine, addFirstNewLine, isPrint);
		}
		formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);
		await ns.sleep(waitFor);

		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "| Copy script to the hacker servers              |", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		copyScriptsHackerServers(ns, hackerServers);
		formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);
		await ns.sleep(waitFor);

		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "| Weaken the security of the victim servers      |", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		await weakenVictimServers(ns, victimServers, hackerServers);
		formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);
		await ns.sleep(waitFor);

		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "| Grow the money of the victim servers           |", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		await growVictimServers(ns, victimServers, hackerServers);
		formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);
		await ns.sleep(waitFor);

		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, "| Hack the money of the victim servers           |", addSecondNewLine, addFirstNewLine, isPrint);
		formatTextToPrint(ns, " ================================================", addSecondNewLine, addFirstNewLine, isPrint);
		hackVictimServers(ns, victimServers, hackerServers);
		formatTextToPrint(ns, "", addSecondNewLine, addFirstNewLine, isPrint);
		await ns.sleep(waitFor);

		//ns.toast("SUCCESS: Finished the orchestation.", "success", toastDuration);
		await ns.sleep(125000);
		//break;
	}
}