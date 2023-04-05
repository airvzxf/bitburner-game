import {encryptionICaesarCipher} from "airvzxf/contracts/js-codingContract-Encryption1-CaesarCipher";

/**
 * Experiment 1 about the Net Script Coding Contract API.
 *
 * @param {NS} ns The net script
 */
export async function main(ns) {
	const hostname = "n00dles";

	const contracts = [
		// "contract-833671-FoodNStuff.cct",
		// "contract-901782-Joe'sGuns.cct",
		"contract-937151-Joe'sGuns.cct",
	];

	for (const contractFile of contracts) {
		const cctType = ns.codingcontract.getContractType(contractFile, hostname);
		const cctDescription = ns.codingcontract.getDescription(contractFile, hostname);
		const cctData = ns.codingcontract.getData(contractFile, hostname);
		const cctDataStringify = JSON.stringify(cctData);
		const cctTriesRemaining = ns.codingcontract.getNumTriesRemaining(contractFile, hostname);

		if (cctType === "Encryption I: Caesar Cipher") {
			ns.tprint("====================================================");
			ns.tprint("File: " + contractFile);
			ns.tprint("Type: " + cctType);
			ns.tprint("Tries remaining: " + cctTriesRemaining);
			ns.tprint("Description:\n" + cctDescription);
			ns.tprint("Data:\n" + cctDataStringify);
			const answer = encryptionICaesarCipher(cctData);
			ns.tprint("answer:\n" + answer);
			const cctReward = ns.codingcontract.attempt(answer, contractFile, hostname, {returnReward: true,});
			ns.tprint("cctReward: " + cctReward);
		}
	}
}