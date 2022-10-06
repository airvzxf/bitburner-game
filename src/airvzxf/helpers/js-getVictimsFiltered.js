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
 * Return the victim servers filtered by hack chance and money.

 * @param {NS} ns The Net Script.
 */
export function jsGetVictimsFiltered(ns) {
	const player = ns.getPlayer();
	const servers = getAllServers(ns);

	return servers
		.filter(function (filterHost) {
			const server = ns.getServer(filterHost);
			let shouldContinue = true;
			shouldContinue = shouldContinue && !server.purchasedByPlayer;
			shouldContinue = shouldContinue && player.skills.hacking >= server.requiredHackingSkill;
			shouldContinue = shouldContinue && server.hasAdminRights;
			shouldContinue = shouldContinue && server.openPortCount >= server.numOpenPortsRequired;
			shouldContinue = shouldContinue && server.moneyMax > 0;
			return shouldContinue;
		})
		.sort(function (a, b) {
			const serverA = ns.getServer(a);
			const serverB = ns.getServer(b);
			const chanceHackA = ns.hackAnalyzeChance(a);
			const chanceHackB = ns.hackAnalyzeChance(b);
			return chanceHackB - chanceHackA ||
				serverB.moneyMax - serverA.moneyMax ||
				serverB.minDifficulty - serverA.minDifficulty;
		});
}
