import {allFiles} from "importFromGitHub/js-allFiles";

/**
 * Import this scripts to the game Bitburner.
 *
 * Optional:
 * You can create these two files manually 'nano js-gitHubToBitburner.js'
 * and 'nano js-allFiles.js' in the home directory. Then copy and paste
 * the content and execute 'run js-gitHubToBitburner.js'.
 *
 * @param {NS} ns The net script
 */
export async function main(ns) {
	const url = "https://raw.githubusercontent.com/airvzxf/bitburner-game/main/src";
	for (const file of allFiles) {
		await ns.wget(url + file, file, "home");
	}
}
