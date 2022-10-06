/** @param {NS} ns */
export async function main(ns) {
	let maxMemoryUsed = 0;

	while (true) {
		const server = ns.getServer("mrRobot-1");

		if (server.ramUsed > maxMemoryUsed) {
			maxMemoryUsed = server.ramUsed;
			ns.tprint("Max memory used: " + ns.nFormat(maxMemoryUsed, "0,0.00") + " GiB");
		}

		await ns.sleep(10);
	}
}