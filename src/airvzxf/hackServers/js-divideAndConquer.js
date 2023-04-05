import {jsGetVictimsFiltered} from "airvzxf/helpers/js-getVictimsFiltered";

const Constants = {
	// Server-related constants
	HomeComputerMaxRam: 1073741824, // 2 ^ 30
	ServerBaseGrowthRate: 1.03, // Unadjusted Growth rate
	ServerMaxGrowthRate: 1.0035, // Maximum possible growth rate (max rate accounting for server security)
	ServerFortifyAmount: 0.002, // Amount by which server's security increases when its hacked/grown
	ServerWeakenAmount: 0.05, // Amount by which server's security decreases when weakened
	PurchasedServerLimit: 25,
	PurchasedServerMaxRam: 1048576, // 2^20
};

/**
 * It will calculate the number of threads to growth some specific server,
 * given the started money and target. The hacker server is not needed, only its CPU cores.
 *
 * @param {InformationBasic} informationBasic Object with all the information for this process.
 * @returns {number} The number of threads needed to grow a server from some amount to another.
 */
function calculateGrowThreads(informationBasic) {
	const victim = informationBasic.victim;
	const player = informationBasic.player;
	const hacker = informationBasic.hacker;
	const bitNodeMultipliers = informationBasic.bitNodeMultipliers;

	const serverBaseGrowthRate = 1.03;
	const serverMaxGrowthRate = 1.0035;
	const serverHackDifficulty = victim.hackDifficulty;
	const adjGrowthRate = 1 + (serverBaseGrowthRate - 1) / serverHackDifficulty;
	const exponentialBase = Math.min(adjGrowthRate, serverMaxGrowthRate);
	const serverGrowth = victim.serverGrowth;
	const serverGrowthPercentage = serverGrowth / 100.0;
	const coreMultiplier = 1 + (hacker.cpuCores - 1) / 16;
	// JSHint: Identifier 'hacking_grow' is not in camel case.(W106)
	// jshint camelcase: false
	const playerHackingGrow = player.mults.hacking_grow;
	// jshint camelcase: true
	const threadMultiplier = serverGrowthPercentage * playerHackingGrow * coreMultiplier * bitNodeMultipliers.ServerGrowthRate;
	const x = threadMultiplier * Math.log(exponentialBase);
	const y = victim.moneyAvailable * x + Math.log(victim.moneyMax * x);

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

	let cycles = w / x - victim.moneyAvailable;
	const bt = Math.pow(exponentialBase, threadMultiplier);

	let corr = Infinity;
	do {
		const bct = Math.pow(bt, cycles);
		const opc = victim.moneyAvailable + cycles;
		const diff = opc * bct - victim.moneyMax;
		corr = diff / (opc * x + 1.0) / bct;
		cycles -= corr;
	} while (Math.abs(corr) >= 1);

	let threads;
	const fca = Math.floor(cycles);
	const cca = Math.ceil(cycles);
	if (victim.moneyMax <= (victim.moneyAvailable + fca) * Math.pow(exponentialBase, fca * threadMultiplier)) {
		threads = fca;
	} else if (victim.moneyMax <= (victim.moneyAvailable + cca) * Math.pow(exponentialBase, cca * threadMultiplier)) {
		threads = cca;
	} else {
		threads = cca + 1;
	}

	return threads;
}

/**
 * Calculate the percent of hacked money for some specific server.
 * This percent is used for example to get the max number of threads to hack all the money.
 *
 * @param {Server} server Object with the server information.
 * @param {Player} player Object with the player information.
 * @param {number} hackDifficulty The security value which suppose the server has.
 * @returns {number} Decimal number representing percent between 0% to 100%. For example:
 * 58.26% is returned as 0.5826.
 */
function calculatePercentMoneyHacked(server, player) {
	const bitNodeMultipliers = {ScriptHackMoney: 1,};
	const balanceFactor = 240;

	const difficultyMultiplier = (100 - server.hackDifficulty) / 100;
	const skillMultiplier = (player.skills.hacking - (server.requiredHackingSkill - 1)) / player.skills.hacking;
	// JSHint: Identifier 'hacking_money' is not in camel case.(W106)
	// jshint camelcase: false
	let percentMoneyHacked = difficultyMultiplier * skillMultiplier * player.mults.hacking_money * bitNodeMultipliers.ScriptHackMoney / balanceFactor;
	// jshint camelcase: true

	if (percentMoneyHacked < 0) {
		percentMoneyHacked = 0;
	}
	if (percentMoneyHacked > 1) {
		percentMoneyHacked = 1;
	}

	return percentMoneyHacked;
}

/**
 * Calculate the intelligence bonus.
 *
 * @param {Player} player Object with all the information about the player.
 * @param {number} weight The weight of this bonus, usually is 1.
 * @returns {number} A decimal number which represent the percent of the intelligence bonus.
 */
function calculateIntelligenceBonus(player, weight = 1) {
	const exponent = 0.8;
	const baseFactor = 600;
	return 1 + weight * Math.pow(player.skills.intelligence, exponent) / baseFactor;
}

/**
 * Calculate the time spent for the hack action.
 *
 * @param {Server} server Object with all the information about the server target.
 * @param {Player} player Object with all the information about the player.
 * @returns {number} The hack time in milliseconds.
 */
function calculateHackingTime(server, player) {
	const baseDiff = 500;
	const baseSkill = 50;
	const diffFactor = 2.5;
	const difficultyMultiplier = server.requiredHackingSkill * server.hackDifficulty;
	const skillFactor = (diffFactor * difficultyMultiplier + baseDiff) / (player.skills.hacking + baseSkill);
	const hackTimeMultiplier = 5;
	// JSHint: Identifier 'hacking_speed' is not in camel case.(W106)
	// jshint camelcase: false
	const hackingTime = hackTimeMultiplier * skillFactor / (player.mults.hacking_speed * calculateIntelligenceBonus(player, 1)) * 1000;
	// jshint camelcase: true
	return Math.ceil(hackingTime);
}

/**
 * Calculate the time spent for the growth action.
 *
 * @param {Server} server Object with all the information about the server target.
 * @param {Player} player Object with all the information about the player.
 * @returns {number} The growth time in milliseconds.
 */
function calculateGrowthTime(server, player) {
	const growTimeMultiplier = 3.2;
	const growthTime = growTimeMultiplier * calculateHackingTime(server, player);

	return Math.ceil(growthTime);
}

/**
 * Calculate the time spent for the weakened action.
 *
 * @param {Server} server Object with all the information about the server target.
 * @param {Player} player Object with all the information about the player.
 * @returns {number} The weaken time in milliseconds.
 */
function calculateWeakenTime(server, player) {
	const weakenTimeMultiplier = 4;
	const weakenTime = weakenTimeMultiplier * calculateHackingTime(server, player);

	return Math.ceil(weakenTime);
}

/**
 * Calculate the growth percent of the server.
 *
 * @param {InformationBasic} informationBasic Object with all the information for this process.
 * @param {number} threads Number of threads which will be executed in the growth function.
 * @returns {number} The growth percent.
 */
function calculatePercentServerGrowth(informationBasic, threads) {
	const victim = informationBasic.victim;
	const player = informationBasic.player;
	const bitNodeMultipliers = informationBasic.bitNodeMultipliers;
	const cores = informationBasic.hacker.cpuCores;

	const threadsUnit = Math.floor(threads);
	const numServerGrowthCycles = Math.max(threadsUnit, 0);

	const growthRate = Constants.ServerBaseGrowthRate;
	let adjGrowthRate = 1 + (growthRate - 1) / victim.hackDifficulty;
	if (adjGrowthRate > Constants.ServerMaxGrowthRate) {
		adjGrowthRate = Constants.ServerMaxGrowthRate;
	}

	const serverGrowthPercentage = victim.serverGrowth / 100;
	const numServerGrowthCyclesAdjusted =
		numServerGrowthCycles * serverGrowthPercentage * bitNodeMultipliers.ServerGrowthRate;

	const coreBonus = 1 + (cores - 1) / 16;

	// JSHint: Identifier 'hacking_grow' is not in camel case.(W106)
	// jshint camelcase: false
	return Math.pow(adjGrowthRate, numServerGrowthCyclesAdjusted * player.mults.hacking_grow * coreBonus);
	// jshint camelcase: true
}

/**
 * Calculate how much money will be grown.
 *
 * @param {InformationBasic} information Object with all the information for this process.
 * @param {number} threads Number of threads to process.
 * @returns {GrownData} Information about the growth. For example: the started and available money
 * after the growth action, the security increased.
 */
function emulateServerGrowth(information, threads) {
	const victim = information.victim;

	const percentServerGrowth = calculatePercentServerGrowth(information, threads);
	const serverGrowth = Math.max(1, percentServerGrowth);
	victim.moneyAvailable += threads;
	victim.moneyAvailable *= serverGrowth;
	victim.moneyAvailable = Math.min(victim.moneyAvailable, victim.moneyMax);
	victim.hackDifficulty += 2 * Constants.ServerFortifyAmount * threads;

	return information;
}

/**
 * Calculate how much money will be hacked.
 *
 * @param {InformationBasic} informationBasic Object with all the information for this process.
 * @param {number} threads Number of threads to process.
 * @returns {HackedData} Information about the hack. For example: the started and available money
 * after the growth action, the security increased.
 */
function emulateServerHacked(informationBasic, threads) {
	const victim = informationBasic.victim;
	const player = informationBasic.player;

	const percentHacked = calculatePercentMoneyHacked(victim, player);
	let maxThreadNeeded = Math.ceil(1 / percentHacked);
	if (isNaN(maxThreadNeeded)) {
		// Server has a 'max money' of 0 (probably). We'll set this to an arbitrarily large value
		maxThreadNeeded = 1.0e6;
	}
	let moneyDrained = Math.floor(victim.moneyAvailable * percentHacked) * threads;
	victim.moneyAvailable -= moneyDrained;
	if (victim.moneyAvailable < 0) {
		victim.moneyAvailable = 0;
	}
	victim.hackDifficulty += Constants.ServerFortifyAmount * Math.min(threads, maxThreadNeeded);

	return informationBasic;
}

/**
 * Calculate and generate information about the all process which include: hack the money,
 * weaken the security generated by the hack action, growth the money to the maximum,
 * weaken the security generated by the growth action.
 *
 * @param {NS} ns The net script.
 * @param {HackInfiniteCycleData} information Data which is used in the function to retrieve information
 * and complete the process.
 */
function emulateHackedCycle(ns, information) {
	const victim = information.victim;
	const hacker = information.hacker;
	const player = information.player;
	const hackerWeakenPower = ns.weakenAnalyze(1, hacker.cpuCores);
	const errors = [];

	// Emulate and retrieve the data of the hack process.
	victim.moneyAvailable = victim.moneyMax;
	victim.hackDifficulty = victim.minDifficulty;
	const threadToHack = Math.ceil(information.threadsToHack);
	emulateServerHacked(information, threadToHack);

	// Emulate and retrieve the data of the weaken process after the hack.
	const victimHackedSecurityIncreased = victim.hackDifficulty - victim.minDifficulty;
	const threadsWeakenAfterHack = Math.ceil(victimHackedSecurityIncreased / hackerWeakenPower);
	victim.hackDifficulty = victim.minDifficulty;

	// Emulate and retrieve the data of the growth process.
	const threadToGrowth = calculateGrowThreads(information);
	emulateServerGrowth(information, threadToGrowth);

	// Emulate and retrieve the data of the weaken process after the growth.
	const victimGrownSecurityIncreased = victim.hackDifficulty - victim.minDifficulty;
	const threadsWeakenAfterGrowth = Math.ceil(victimGrownSecurityIncreased / hackerWeakenPower);
	victim.hackDifficulty = victim.minDifficulty;

	let requiredMemory = 0;
	const scriptHackMemory = ns.getScriptRam(information.scriptHack);
	requiredMemory += scriptHackMemory * threadToHack;
	const scriptWeakenHackMemory = ns.getScriptRam(information.scriptWeakenHack);
	requiredMemory += scriptWeakenHackMemory * threadsWeakenAfterHack;
	const scriptGrowthMemory = ns.getScriptRam(information.scriptGrowth);
	requiredMemory += scriptGrowthMemory * threadToGrowth;
	const scriptWeakenGrowthMemory = ns.getScriptRam(information.scriptWeakenGrowth);
	requiredMemory += scriptWeakenGrowthMemory * threadsWeakenAfterGrowth;
	const hackerMemoryAvailable = Math.floor(hacker.maxRam - hacker.ramUsed);
	if (requiredMemory > hackerMemoryAvailable) {
		const requiredMemoryText = ns.nFormat(requiredMemory, "0,0.00");
		const hackerMemoryAvailableText = ns.nFormat(hackerMemoryAvailable, "0,0.00");
		errors.push("WARNING: Not enough memory to run one hack cycle." +
			" The victim server required " +
			requiredMemoryText + " GiB, but the hacker server has " +
			hackerMemoryAvailableText + " GiB.");
	}

	const victimHackingTime = calculateHackingTime(victim, player);
	const victimGrowthTime = calculateGrowthTime(victim, player);
	const victimWeakenTime = calculateWeakenTime(victim, player);

	const timeline = {
		hack: {
			time: victimHackingTime,
			timeDelay: information.timelineDelayMs,
			timeWait: 0,
			timeNext: 0,
			timeTotal: 0,
			isFirstProcess: true,
			threads: threadToHack,
			victim: victim.hostname,
			hacker: hacker.hostname,
			script: information.scriptHack,
		},
		weakenHack: {
			time: victimWeakenTime,
			timeDelay: information.timelineDelayMs,
			timeWait: 0,
			timeNext: 0,
			timeTotal: 0,
			isFirstProcess: true,
			threads: threadsWeakenAfterHack,
			victim: victim.hostname,
			hacker: hacker.hostname,
			script: information.scriptWeakenHack,
		},
		growth: {
			time: victimGrowthTime,
			timeDelay: information.timelineDelayMs,
			timeWait: 0,
			timeNext: 0,
			timeTotal: 0,
			isFirstProcess: true,
			threads: threadToGrowth,
			victim: victim.hostname,
			hacker: hacker.hostname,
			script: information.scriptGrowth,
		},
		weakenGrowth: {
			time: victimWeakenTime,
			timeDelay: information.timelineDelayMs,
			timeWait: 0,
			timeNext: 0,
			timeTotal: 0,
			isFirstProcess: true,
			threads: threadsWeakenAfterGrowth,
			victim: victim.hostname,
			hacker: hacker.hostname,
			script: information.scriptWeakenGrowth,
		},
	};

	const timelineKeys = Object.keys(timeline);
	let firstKey = timelineKeys[0];
	timeline[firstKey].timeTotal = timeline[firstKey].time;

	for (let index = 1; index < timelineKeys.length; index += 1) {
		const currentKey = timelineKeys[index];
		const lastKey = timelineKeys[index - 1];
		const totalTime = timeline[lastKey].timeTotal;
		const processTime = timeline[currentKey].time;
		const processWaitTime = totalTime - processTime + information.timelineDelayMs;

		if (processWaitTime < 0) {
			timeline[lastKey].timeWait = Math.abs(processWaitTime);
			timeline[lastKey].timeNext = Math.abs(processWaitTime);
			timeline[lastKey].timeTotal = timeline[lastKey].time + timeline[lastKey].timeWait;
			timeline[currentKey].timeWait = 0;
			timeline[currentKey].timeNext = 0;
			timeline[currentKey].timeTotal = processTime;
		} else {
			timeline[currentKey].timeWait = processWaitTime;
			timeline[currentKey].timeNext = processWaitTime;
			timeline[currentKey].timeTotal = timeline[lastKey].timeTotal + information.timelineDelayMs;
		}
	}

	const lastKey = timelineKeys[timelineKeys.length - 1];
	const totalOfActions = Object.keys(timeline).length;
	const totalRequiredMemory = timeline[lastKey].timeTotal * requiredMemory / (totalOfActions * information.timelineDelayMs);

	if (totalRequiredMemory > hackerMemoryAvailable) {
		const requiredMemoryText = ns.nFormat(totalRequiredMemory, "0,0.00");
		const hackerMemoryAvailableText = ns.nFormat(hackerMemoryAvailable, "0,0.00");
		errors.push("WARNING: Not enough memory to run all the hack cycle for ever." +
			" The victim server required " +
			requiredMemoryText + " GiB, but the hacker server has " +
			hackerMemoryAvailableText + " GiB.");
	}

	return {
		timeline: timeline,
		requiredMemory: requiredMemory,
		totalRequiredMemory: totalRequiredMemory,
		errors: errors,
	};
}

/**
 * Emulate all the cycles based on the amount of money hacked going from 1 to the max money in the server.
 *
 * @param {NS} ns The net script.
 * @param {HackInfiniteCycleData} information The information to calculate of the victim server, hacker, and more.
 * @returns {object|undefined} The hack cycles information. Otherwise, it returns an undefined value.
 */
function calculateBestHackMoney(ns, information) {
	const victim = information.victim;
	const hacker = information.hacker;
	const player = information.player;
	victim.moneyAvailable = victim.moneyMax;

	let hackedCycle;
	const percentHacked = calculatePercentMoneyHacked(victim, player);
	const maxThreadNeeded = Math.ceil(1 / percentHacked);
	for (information.threadsToHack = 1; information.threadsToHack <= maxThreadNeeded; information.threadsToHack += 1) {
		hackedCycle = emulateHackedCycle(ns, information);
		if (hackedCycle.errors.length > 0) {
			break;
		}
	}

	information.threadsToHack -= 1;
	hackedCycle = emulateHackedCycle(ns, information);

	const moneyDrained = Math.floor(victim.moneyAvailable * percentHacked) * information.threadsToHack;
	const moneyGainPercent = moneyDrained / victim.moneyMax * 100;
	const message = hacker.hostname + " -> " + victim.hostname +
		" | 🧵 " + ns.nFormat(information.threadsToHack, "0,0") +
		" / " + ns.nFormat(maxThreadNeeded, "0,0") +
		" | 💰 " + ns.nFormat(moneyGainPercent, "0.00%") +
		" / " + ns.nFormat(victim.moneyMax, "$0,0.00") +
		" | 💻️📀 " + ns.nFormat(hackedCycle.requiredMemory, "0,0") +
		" ~ " + ns.nFormat(hackedCycle.totalRequiredMemory, "0,0") +
		" | 💻️ " + hackedCycle.timeline.hack.time + " ms" +
		" 🛡️ " + hackedCycle.timeline.weakenHack.time + " ms" +
		" 💰️ " + hackedCycle.timeline.growth.time + " ms";
	ns.tprint(message);

	if (information.threadsToHack > 0) {
		hackedCycle.errors = [];
	}

	return hackedCycle;
}

/**
 * Entry point of the script.
 * Divide and conquer is a script which take the information for all the victim servers,
 * then calculate the number of resources needed to run the weak, grow and hack with
 * a finish delay of 1 second.
 *
 * @param {NS} ns Net Script.
 */
export async function main(ns) {
	const timelineDelayMs = 250;

	const hackers = ns.getPurchasedServers();
	const victims = [];

	for (let hostname of jsGetVictimsFiltered(ns)) {
		victims.push({victim: hostname, hacker: "",});
	}

	const scriptHack = "airvzxf/hackServers/js-hack.js";
	const scriptWeakenHack = "airvzxf/hackServers/js-weakenHack.js";
	const scriptGrowth = "airvzxf/hackServers/js-grow.js";
	const scriptWeakenGrowth = "airvzxf/hackServers/js-weakenGrow.js";

	const execution = {
		hack: [],
		weakenHack: [],
		growth: [],
		weakenGrowth: [],
	};

	const serversMin = Math.min(hackers.length, victims.length);

	for (let serverIndex = 0; serverIndex < serversMin; serverIndex += 1) {
		ns.killall(hackers[serverIndex]);
		ns.scp(
			[scriptHack, scriptWeakenHack, scriptGrowth, scriptWeakenGrowth, "airvzxf/hackServers/js-weaken.js",],
			hackers[serverIndex],
			"home"
		);
	}

	let hackerIndex = 0;
	let hackerMemoryFree = ns.getServer(hackers[hackerIndex]).maxRam - ns.getServer(hackers[hackerIndex]).ramUsed;

	for (let victimInformation of victims) {
		victimInformation.hacker = hackers[hackerIndex];

		if (victimInformation.hacker === "") {
			break;
		}

		const victim = ns.getServer(victimInformation.victim);
		const hacker = ns.getServer(victimInformation.hacker);

		// Weaken and Growth
		// - Init with zero security and the max money.
		if (victim.moneyAvailable < victim.moneyMax ||
			victim.hackDifficulty > victim.minDifficulty) {
			ns.tprint("INFO: Needs to decrease the security and increase the money to maximum.");
			const victimSecurity = 100 - victim.minDifficulty;
			if (victim.moneyAvailable === 0) {
				victim.moneyAvailable = 1;
			}
			if (victimSecurity > 0) {
				const weakenPower = ns.weakenAnalyze(1, hacker.cpuCores);
				const weakenThreads = Math.ceil(victimSecurity / weakenPower);
				ns.exec(scriptWeakenGrowth, hacker.hostname, weakenThreads, victim.hostname);
			}
			const growMultiplier = Math.max(1, victim.moneyMax / victim.moneyAvailable);
			const growthTimes = ns.growthAnalyze(victim.hostname, growMultiplier, hacker.cpuCores);
			const growthThreads = Math.ceil(growthTimes);
			if (growthThreads > 0) {
				ns.exec(scriptGrowth, hacker.hostname, growthThreads, victim.hostname);
			}
			return;
		}

		const information = {
			victim: ns.getServer(victim.hostname),
			hacker: ns.getServer(hacker.hostname),
			player: ns.getPlayer(),
			timelineDelayMs: timelineDelayMs,
			bitNodeMultipliers: {
				ScriptHackMoneyGain: 1,
				ServerGrowthRate: 1,
			},
			scriptHack: scriptHack,
			scriptWeakenHack: scriptWeakenHack,
			scriptGrowth: scriptGrowth,
			scriptWeakenGrowth: scriptWeakenGrowth,
		};

		const hackedCycle = calculateBestHackMoney(ns, information);
		hackerMemoryFree -= hackedCycle.requiredMemory;
		if (hackerMemoryFree < 0) {
			hackerIndex += 1;
			hackerMemoryFree = ns.getServer(hackers[hackerIndex]).maxRam - ns.getServer(hackers[hackerIndex]).ramUsed;
		}

		if (hackedCycle.errors.length > 0) {
			for (let error of hackedCycle.errors) {
				ns.tprint(error);
			}
			return;
		}

		execution.hack.push(hackedCycle.timeline.hack);
		execution.weakenHack.push(hackedCycle.timeline.weakenHack);
		execution.growth.push(hackedCycle.timeline.growth);
		execution.weakenGrowth.push(hackedCycle.timeline.weakenGrowth);
	}

	ns.tprint("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
	ns.tprint("~ EXECUTE");
	ns.tprint("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

	let processId = 1;
	const startTime = Date.now();
	const nameOfActions = Object.keys(execution);
	const numberOfActions = Object.keys(execution).length;

	while (true) {
		const hackers = execution.hack;
		for (let processIndex = 0; processIndex < hackers.length; processIndex += 1) {
			for (let actionType of nameOfActions) {
				const action = execution[actionType][processIndex];
				const currentTime = Date.now() - startTime;
				if (currentTime >= action.timeNext) {
					const actionTypeIndex = nameOfActions.indexOf(actionType);
					const actionTypeIndexInverse = numberOfActions - 1 - actionTypeIndex;
					const timeDelayByPosition = action.timeDelay * actionTypeIndexInverse;
					action.timeNext += action.time + action.timeWait + timeDelayByPosition;
					if (action.isFirstProcess) {
						action.isFirstProcess = false;
						action.timeNext = action.timeTotal + action.timeWait + timeDelayByPosition;
					}

					const pid = ns.exec(action.script, action.hacker, action.threads, action.victim);
					const actionDescription = JSON.stringify(action);
					if (pid < 1) {
						ns.tprint("WARNING: This process is not executed: " + actionDescription);
						return;
					}
					processId += 1;
				}
			}
		}
		await ns.sleep(1);
	}
}