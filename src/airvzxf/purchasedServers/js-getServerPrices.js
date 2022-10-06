/**
 * Get the prices for all the possible purchased servers based on the memory increase.
 *
 * @param {NS} ns The net script.
 */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.clearLog();

	ns.print(" ========================================");
	ns.print(" = GET SERVER COSTS                     =");
	ns.print(" ========================================");

	const maxPurchasedServers = ns.getPurchasedServerLimit();
	const maxRam = ns.getPurchasedServerMaxRam();
	const maxExponent = Math.log2(maxRam);
	const bytesToGiB = 1024 * 1024 * 1024;

	let message = "";
	for (let exponent = 0; exponent <= maxExponent; exponent += 1) {
		const ram = Math.pow(2, exponent);
		const serverCost = ns.getPurchasedServerCost(ram);
		if (serverCost !== Infinity) {
			message += "Server with " + ns.nFormat(ram * bytesToGiB, "0 ib");
			message += " | " + ns.nFormat(serverCost, "$0.000 a");
			message += " | " + maxPurchasedServers + " Servers: ";
			message += ns.nFormat(serverCost * maxPurchasedServers, "$0.000 a");
			message += "\n";
		}
	}
	ns.print(message);

	const scriptName = ns.getScriptName();
	ns.tail(scriptName);

	/*
	Server with 1 GiB | $55.000 k | 25 Servers: $1.375 m
	Server with 2 GiB | $110.000 k | 25 Servers: $2.750 m
	Server with 4 GiB | $220.000 k | 25 Servers: $5.500 m
	Server with 8 GiB | $440.000 k | 25 Servers: $11.000 m
	Server with 16 GiB | $880.000 k | 25 Servers: $22.000 m
	Server with 32 GiB | $1.760 m | 25 Servers: $44.000 m
	Server with 64 GiB | $3.520 m | 25 Servers: $88.000 m
	Server with 128 GiB | $7.040 m | 25 Servers: $176.000 m
	Server with 256 GiB | $14.080 m | 25 Servers: $352.000 m
	Server with 512 GiB | $28.160 m | 25 Servers: $704.000 m
	Server with 1 TiB | $56.320 m | 25 Servers: $1.408 b
	Server with 2 TiB | $112.640 m | 25 Servers: $2.816 b
	Server with 4 TiB | $225.280 m | 25 Servers: $5.632 b
	Server with 8 TiB | $450.560 m | 25 Servers: $11.264 b
	Server with 16 TiB | $901.120 m | 25 Servers: $22.528 b
	Server with 32 TiB | $1.802 b | 25 Servers: $45.056 b
	Server with 64 TiB | $3.604 b | 25 Servers: $90.112 b
	Server with 128 TiB | $7.209 b | 25 Servers: $180.224 b
	Server with 256 TiB | $14.418 b | 25 Servers: $360.448 b
	Server with 512 TiB | $28.836 b | 25 Servers: $720.896 b
	Server with 1 PiB | $57.672 b | 25 Servers: $1.442 t
	*/
}