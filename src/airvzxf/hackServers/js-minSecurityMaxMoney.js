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
 * Given the money start and target, it will calculate the number of threads
 * for some specific server. The hacker server is not needed, only its CPU cores.
 *
 * @param {InformationBasic} informationBasic Object with all the information for this process.
 * @param {number} moneyStart Money it starts with.
 * @param {number} moneyTarget Money to get retrieve.
 * @returns {number} The number of threads needed to grow a server from some amount to another.
 */
function calculateGrowThreads(informationBasic, moneyStart, moneyTarget) {
	const victim = informationBasic.victim;
	const player = informationBasic.player;
	const bitNodeMultipliers = informationBasic.bitNodeMultipliers;
	const cores = informationBasic.hacker.cpuCores;

	const serverBaseGrowthRate = 1.03;
	const serverMaxGrowthRate = 1.0035;
	const serverHackDifficulty = victim.hackDifficulty;
	const adjGrowthRate = 1 + (serverBaseGrowthRate - 1) / serverHackDifficulty;
	const exponentialBase = Math.min(adjGrowthRate, serverMaxGrowthRate);
	const serverGrowth = victim.serverGrowth;
	const serverGrowthPercentage = serverGrowth / 100.0;
	const coreMultiplier = 1 + (cores - 1) / 16;
	// JSHint: Identifier 'hacking_grow' is not in camel case.(W106)
	// jshint camelcase: false
	const playerHackingGrow = player.mults.hacking_grow;
	// jshint camelcase: true
	const threadMultiplier = serverGrowthPercentage * playerHackingGrow * coreMultiplier * bitNodeMultipliers.ServerGrowthRate;
	const x = threadMultiplier * Math.log(exponentialBase);
	const y = moneyStart * x + Math.log(moneyTarget * x);

	let w;
	const diffFactor = 2.5;
	if (y < Math.log(diffFactor)) {
		const ey = Math.exp(y);
		//w = (ey + (4 / 3) * ey * ey) / (1 + (7 / 3) * ey + (5 / 6) * ey * ey);
		w = (ey + 4 / 3 * ey * ey) / (1 + 7 / 3 * ey + 5 / 6 * ey * ey);
	} else {
		w = y;
		if (y > 0) {
			w -= Math.log(y);
		}
	}

	let cycles = w / x - moneyStart;
	const bt = Math.pow(exponentialBase, threadMultiplier);

	let corr = Infinity;
	do {
		const bct = Math.pow(bt, cycles);
		const opc = moneyStart + cycles;
		const diff = opc * bct - moneyTarget;
		corr = diff / (opc * x + 1.0) / bct;
		cycles -= corr;
	} while (Math.abs(corr) >= 1);

	let threads;
	const fca = Math.floor(cycles);
	const cca = Math.ceil(cycles);
	if (moneyTarget <= (moneyStart + fca) * Math.pow(exponentialBase, fca * threadMultiplier)) {
		threads = fca;
	} else if (moneyTarget <= (moneyStart + cca) * Math.pow(exponentialBase, cca * threadMultiplier)) {
		threads = cca;
	} else {
		threads = cca + 1;
	}

	return threads;
}

/**
 * This is a recursive function which is connecting node by node thought the network.
 * It will connect all the available nodes in the network.
 *
 * @param {NS} ns The Net Script.
 * @param {string} host The name of the host which will be scanned.
 * @param {string} parentHost The name of the parent host to be removed from the scan.
 * @param {number} depth In what level in the network is now.
 * @param {boolean} displayInformation show the information.
 * @returns {string[]} All the servers in the network.
 */
function getAllServers(ns, host = "home", parentHost = "") {
	const servers = ns.scan(host);

	const filteredServers = servers.filter(function (filterHost) {
		const server = ns.getServer(filterHost);
		return server.purchasedByPlayer !== true &&
			filterHost !== parentHost;
	});

	if (filteredServers.length === 0) {
		return [];
	}

	let childrenServers = [];
	for (let hostname of filteredServers) {
		const children = getAllServers(ns, hostname, host);
		if (children.length > 0) {
			childrenServers = [].concat(childrenServers, children);
		}
	}

	return filteredServers.concat(childrenServers);
}

/**
 * Weaken the security to maximum.
 *
 * @param {NS} ns The Net Script.
 * @param {string} victim The hostname of the victim server.
 * @param {string} hacker The hostname of the hacker server.
 * @param {boolean} forceWeaken If it is true, it will execute the weak funciton.
 */
function weakenSecurity(ns, victim, hacker, forceWeaken = false) {
	let victimServer = ns.getServer(victim);

	if (victimServer.hackDifficulty > victimServer.minDifficulty || forceWeaken) {
		const hackerServer = ns.getServer(hacker);
		const hackerWeakPower = ns.weakenAnalyze(1, hackerServer.cpuCores);
		const weakenScriptName = "airvzxf/hackServers/js-weaken.js";
		const victimSecurity = 100 - victimServer.minDifficulty;
		const victimThreadsRequired = Math.ceil(victimSecurity / hackerWeakPower);
		ns.exec(weakenScriptName, hacker, victimThreadsRequired, victim);
	}
}

/**
 * Growth the money to maximum.
 *
 * @param {NS} ns The Net Script.
 * @param {string} victim The hostname of the victim server.
 * @param {string} hacker The hostname of the hacker server.
 */
function growthMoney(ns, victim, hacker) {
	let victimServer = ns.getServer(victim);

	if (victimServer.moneyAvailable < victimServer.moneyMax) {
		const hackerServer = ns.getServer(hacker);
		const growthScriptName = "airvzxf/hackServers/js-grow.js";
		const growthScriptMemory = ns.getScriptRam(growthScriptName);
		const hackerMemoryAvailable = hackerServer.maxRam - hackerServer.ramUsed;
		const player = ns.getPlayer();
		const informationForMaxThreads = {
			victim: victimServer,
			hacker: hackerServer,
			player: player,
			bitNodeMultipliers: {ServerGrowthRate: 1,},
		};
		const victimThreadsRequired = calculateGrowThreads(informationForMaxThreads, victimServer.moneyAvailable, victimServer.moneyMax);
		const hackerThreadsAvailable = Math.floor(hackerMemoryAvailable / growthScriptMemory);
		const threads = Math.min(victimThreadsRequired, hackerThreadsAvailable);
		ns.exec(growthScriptName, hacker, threads, victim);
	}

	return victimServer.moneyAvailable < victimServer.moneyMax;
}

/**
 * Weaken the security to minimum and growth the money to maximum.

 * @param {NS} ns The Net Script.
 */
export async function main(ns) {
	// ns.disableLog("ALL");
	// ns.clearLog();
	const thisScript = ns.getScriptName();
	ns.tail(thisScript);

	const host = "home";
	const servers = getAllServers(ns);

	for (let server of servers) {
		const victimServer = ns.getServer(server);
		if (victimServer.hasAdminRights) {
			const isGrowthMoney = growthMoney(ns, server, host);
			weakenSecurity(ns, server, host, isGrowthMoney);
		}
	}
}