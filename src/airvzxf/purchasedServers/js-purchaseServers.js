/**
 * Buy the maximum servers available.
 *
 * @param {NS} ns The net script.
 */
export async function main(ns) {
	const serverNamePrefix = "mrRobot-";

	ns.tprint(" ========================================");
	ns.tprint(" = PURCHASE SERVERS                     =");
	ns.tprint(" ========================================");

	const serversLimit = ns.getPurchasedServerLimit();
	const purchasedServers = ns.getPurchasedServers().length;
	const serversAvailable = serversLimit - purchasedServers;
	const maxRam = ns.getPurchasedServerMaxRam();
	ns.tprint("serversLimit: " + serversLimit);
	ns.tprint("purchasedServers: " + purchasedServers);
	ns.tprint("serversAvailable: " + serversAvailable);
	ns.tprint("maxRam: " + maxRam);

	let purchaseIndex = purchasedServers;
	while (purchaseIndex < serversLimit) {
		purchaseIndex += 1;
		let serverName;
		for (let serverIndex = 0; serverIndex < serversLimit; serverIndex += 1) {
			serverName = serverNamePrefix + (serverIndex + 1);
			if (!ns.serverExists(serverName)) {
				ns.tprint("Buy server #" + (serverIndex + 1) + " | Hostname: " + serverName);
				break;
			}
		}
		ns.purchaseServer(serverName, maxRam);
		await ns.sleep(100);
	}
}