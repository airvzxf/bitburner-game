import {jsGetVictimsFiltered} from "airvzxf/helpers/js-getVictimsFiltered";

/**
 * Return the information about the victim servers.

 * @param {NS} ns The Net Script.
 */
export async function main(ns) {
	ns.disableLog("ALL");

	const thisScript = ns.getScriptName();
	ns.tail(thisScript);

	const victims = jsGetVictimsFiltered(ns);

	let message = "";
	let hostnameSize = 0;
	let serverGrowthSize = 0;
	let moneyMaxSize = 0;
	let chanceHackSize = 0;
	let timeWeakenSize = 0;
	let timeGrowthSize = 0;
	let timeHackSize = 0;

	for (let hostname of victims) {
		const victim = ns.getServer(hostname);
		const chanceHack = ns.hackAnalyzeChance(hostname);
		const timeWeaken = ns.getWeakenTime(hostname);
		const timeGrowth = ns.getGrowTime(hostname);
		const timeHack = ns.getHackTime(hostname);

		const hostnameFormatted = victim.hostname;
		if (hostnameFormatted.length > hostnameSize) {
			hostnameSize = hostnameFormatted.length;
		}

		const serverGrowthFormatted = ns.nFormat(victim.serverGrowth, "0,0");
		if (serverGrowthFormatted.length > serverGrowthSize) {
			serverGrowthSize = serverGrowthFormatted.length;
		}

		const moneyMaxFormatted = ns.nFormat(victim.moneyMax, "$0,0");
		if (moneyMaxFormatted.length > moneyMaxSize) {
			moneyMaxSize = moneyMaxFormatted.length;
		}

		const chanceHackFormatted = ns.nFormat(chanceHack, "0,0.00%");
		if (chanceHackFormatted.length > chanceHackSize) {
			chanceHackSize = chanceHackFormatted.length;
		}

		const timeWeakenFormatted = ns.tFormat(timeWeaken, true);
		if (timeWeakenFormatted.length > timeWeakenSize) {
			timeWeakenSize = timeWeakenFormatted.length;
		}

		const timeGrowthFormatted = ns.tFormat(timeGrowth, true);
		if (timeGrowthFormatted.length > timeGrowthSize) {
			timeGrowthSize = timeGrowthFormatted.length;
		}

		const timeHackFormatted = ns.tFormat(timeHack, true);
		if (timeHackFormatted.length > timeHackSize) {
			timeHackSize = timeHackFormatted.length;
		}
	}

	for (let hostname of victims) {
		const victim = ns.getServer(hostname);
		const chanceHack = ns.hackAnalyzeChance(hostname);
		const securityMin = victim.minDifficulty;
		const timeWeaken = ns.getWeakenTime(hostname);
		const timeGrowth = ns.getGrowTime(hostname);
		const timeHack = ns.getHackTime(hostname);

		message += "🖥️ " + victim.hostname.padEnd(hostnameSize, " ");
		message += " | 💰 " + ns.nFormat(victim.serverGrowth, "0,0").padStart(serverGrowthSize, " ");
		message += " | 💰 " + ns.nFormat(victim.moneyMax, "$0,0").padStart(moneyMaxSize, " ");
		message += " | 💻️ " + ns.nFormat(chanceHack, "0,0.00%").padStart(chanceHackSize, " ");
		message += " | 🛡 " + ns.nFormat(securityMin, "0,0").padStart(3, " ");
		message += " | ⏱️️ Weaken: " + ns.tFormat(timeWeaken, true).padStart(timeWeakenSize, " ");
		// message += " | ⏱️ Growth: " + ns.tFormat(timeGrowth, true).padStart(timeGrowthSize, " ");
		// message += " | ⏱️ Hack: " + ns.tFormat(timeHack, true).padStart(timeHackSize, " ");
		message += "\n";
	}
	ns.clearLog();
	ns.print(message);
}