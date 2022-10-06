/**
 * Execute the hack function.
 *
 * @param {NS} ns The net script
 */
export async function main(ns) {
	const serverTarget = ns.args[0];
	await ns.hack(serverTarget);

	// const currentTime = Date.now();
	// const processId = ns.args[1];
	// const startTime = ns.args[2];
	// const timeNext = ns.args[3];
	// const time = ns.args[4];
	// const timeWait = ns.args[5];
	// const timeDelay = ns.args[6];
	// const serverBeforeHack = ns.getServer(serverTarget);
	// const securityBeforeHack = serverBeforeHack.hackDifficulty - serverBeforeHack.minDifficulty;
	// const moneyMissingBeforeHack = serverBeforeHack.moneyMax - serverBeforeHack.moneyAvailable;
	// const moneyAvailableBeforeHack = serverBeforeHack.moneyAvailable;
	// if (securityBeforeHack !== 0 || moneyMissingBeforeHack !== 0) {
	// 	const startTimeReal = currentTime - startTime;
	// 	console.warn("WARNING: " + serverTarget + " -> Hacked" +
	// 		" | ID: " + processId +
	// 		" | time: " + time +
	// 		" | timeDelay: " + timeDelay +
	// 		" | timeWait: " + timeWait +
	// 		" | timeNext: " + timeNext +
	// 		" | start: " + timeNext +
	// 		" vs " + startTimeReal +
	// 		" = " + (startTimeReal - timeNext) +
	// 		" | action: " + time +
	// 		" | total: " + (timeNext + time) +
	// 		" | 💰 " + ns.nFormat(moneyAvailableBeforeHack, "0,0.00") +
	// 		" / " + ns.nFormat(moneyMissingBeforeHack, "0,0.00") +
	// 		" | 🛡️ " + ns.nFormat(securityBeforeHack, "0,0.00"));
	// 	return;
	// }
	// const hackPromise = await ns.hack(serverTarget);
	// const currentTimeAfterAction = Date.now();
	// const startTimeReal = currentTime - startTime;
	// const actionTimeReal = currentTimeAfterAction - currentTime;
	// const totalTimeReal = currentTimeAfterAction - startTime;
	// const totalTimeExcess = totalTimeReal - (timeNext + time);
	// const errorMargin = 0.9;
	// const server = ns.getServer(serverTarget);
	// const security = server.hackDifficulty - server.minDifficulty;
	// const moneyMissing = server.moneyMax - server.moneyAvailable;
	// const player = ns.getPlayer();
	// const message = serverTarget + " -> Hacked | " + ns.nFormat(hackPromise, "0,0.00") +
	// 	" | ID: " + processId +
	// 	" | time: " + time +
	// 	" | timeDelay: " + timeDelay +
	// 	" | timeWait: " + timeWait +
	// 	" | timeNext: " + timeNext +
	// 	" | start: " + timeNext +
	// 	" vs " + startTimeReal +
	// 	" = " + (startTimeReal - timeNext) +
	// 	" | action: " + time +
	// 	" vs " + actionTimeReal +
	// 	" = " + (actionTimeReal - time) +
	// 	" | total: " + (timeNext + time) +
	// 	" vs " + totalTimeReal +
	// 	" = " + totalTimeExcess +
	// 	" | 💰 " + ns.nFormat(server.moneyAvailable, "0,0.00") +
	// 	" / " + ns.nFormat(moneyMissing, "0,0.00") +
	// 	" | 🛡️ " + ns.nFormat(security, "0,0.00") +
	// 	" | 💰 " + ns.nFormat(player.money, "0,0.00")
	// ;
	// if (hackPromise > 0) {
	// 	console.log(message);
	// 	// ns.print(message);
	// } else {
	// 	console.warn(" BEFORE: 💰 " + ns.nFormat(moneyAvailableBeforeHack, "0,0.00") +
	// 		" / " + ns.nFormat(moneyMissingBeforeHack, "0,0.00") +
	// 		" | 🛡️ " + ns.nFormat(securityBeforeHack, "0,0.00") +
	// 		" | AFTER: " + message);
	// }
	// if (totalTimeExcess >= timeDelay * errorMargin) {
	// 	console.error("The total time excess the expected by " + totalTimeExcess + ".\n" + message);
	// }
}