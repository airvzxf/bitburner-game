/**
 * Information about me.
 *
 * @param {NS} ns The net script
 */
export async function main(ns) {
	const player = ns.getPlayer();
	const server = ns.getServer("home");
	const memoryMaxUpgradeNumber = Math.pow(2, 30);
	const memoryCurrentNumber = server.maxRam;

	// JSHint: Identifier Some variables/constants are not in camel case.(W106)
	// jshint camelcase: false
	const memoryCurrent = ns.nFormat(memoryCurrentNumber * 1024 * 1024 * 1024, "0.000 ib");
	const memoryMaxUpgrade = ns.nFormat(memoryMaxUpgradeNumber * 1024 * 1024 * 1024, "0.000 ib");
	const moneyShort = ns.nFormat(player.money, "$0.000a");
	const money = ns.nFormat(player.money, "$0,0.00");
	const hpCurrent = ns.nFormat(player.hp.current, "0,0.00");
	const hpMax = ns.nFormat(player.hp.max, "0,0.00");
	const multiHackingChance = ns.nFormat(player.mults.hacking_chance, "0,0.00%");
	const multiHackingSpeed = ns.nFormat(player.mults.hacking_speed, "0,0.00%");
	const multiHackingGrow = ns.nFormat(player.mults.hacking_grow, "0,0.00%");
	const skillsHacking = ns.nFormat(player.skills.hacking, "0,0");
	const multiHacking = ns.nFormat(player.mults.hacking, "0,0.00%");
	const multiHackingExp = ns.nFormat(player.mults.hacking_exp, "0,0.00%");
	const skillsStrength = ns.nFormat(player.skills.strength, "0,0");
	const multiStrength = ns.nFormat(player.mults.strength, "0,0.00%");
	const multiStrengthExp = ns.nFormat(player.mults.strength_exp, "0,0.00%");
	const skillsDefense = ns.nFormat(player.skills.defense, "0,0");
	const multiDefense = ns.nFormat(player.mults.defense, "0,0.00%");
	const multiDefenseExp = ns.nFormat(player.mults.defense_exp, "0,0.00%");
	const skillsDexterity = ns.nFormat(player.skills.dexterity, "0,0");
	const multiDexterity = ns.nFormat(player.mults.dexterity, "0,0.00%");
	const multiDexterityExp = ns.nFormat(player.mults.dexterity_exp, "0,0.00%");
	const skillsAgility = ns.nFormat(player.skills.agility, "0,0");
	const multiAgility = ns.nFormat(player.mults.agility, "0,0.00%");
	const multiAgilityExp = ns.nFormat(player.mults.agility_exp, "0,0.00%");
	// const bitNodeMultipliersAgilityLevelMultiplier = ns.nFormat(bitNodeMultipliers.AgilityLevelMultiplier, "0,0.00%")
	const skillsCharisma = ns.nFormat(player.skills.charisma, "0,0");
	const multiWorkMoney = ns.nFormat(player.mults.work_money, "0,0.00%");
	const multiCompanyRep = ns.nFormat(player.mults.company_rep, "0,0.00%");
	const multiCrimeMoney = ns.nFormat(player.mults.crime_money, "0,0.00%");
	const multiCrimeSuccess = ns.nFormat(player.mults.crime_success, "0,0.00%");
	const multiHackNetNodePurchaseCost = ns.nFormat(player.mults.hacknet_node_purchase_cost, "0,0.00%");
	const multiHackNetNodeLevelCost = ns.nFormat(player.mults.hacknet_node_level_cost, "0,0.00%");
	const multiHackNetNodeRamCost = ns.nFormat(player.mults.hacknet_node_ram_cost, "0,0.00%");
	const multiHackNetNodeCoreCost = ns.nFormat(player.mults.hacknet_node_core_cost, "0,0.00%");
	const multiHackNetNodeMoney = ns.nFormat(player.mults.hacknet_node_money, "0,0.00%");
	const multiBladeBurnerStaminaGain = ns.nFormat(player.mults.bladeburner_stamina_gain, "0,0.00%");
	const multiBladeBurnerStaminaMax = ns.nFormat(player.mults.bladeburner_max_stamina, "0,0.00%");
	const multiBladeBurnerAnalysis = ns.nFormat(player.mults.bladeburner_analysis, "0,0.00%");
	const multiBladeBurnerSuccessChance = ns.nFormat(player.mults.bladeburner_success_chance, "0,0.00%");
	const multiFactionRep = ns.nFormat(player.mults.faction_rep, "0,0.00%");
	const factions = player.factions.join(", ");
	const jobsKeys = Object.keys(player.jobs);
	const totalPlaytime = ns.tFormat(player.totalPlaytime, true);
	const playtimeSinceLastBitNode = ns.tFormat(player.playtimeSinceLastBitnode, true);
	const playtimeSinceLastAugmentation = ns.tFormat(player.playtimeSinceLastAug, true);
	// jshint camelcase: true

	ns.tprint("====================================");
	ns.tprint("Money: " + moneyShort + " ≡ " + money);
	ns.tprint("HP: " + hpCurrent + " / " + hpMax);
	ns.tprint("---------");
	ns.tprint("Computer: ");
	ns.tprint("  Memory:    " + memoryCurrent + " / " + memoryMaxUpgrade);
	ns.tprint("  CPU cores: " + server.cpuCores + " / " + 8);
	ns.tprint("---------");
	ns.tprint("City:     " + player.city);
	ns.tprint("location: " + player.location);
	ns.tprint("---------");
	ns.tprint("Tor: " + player.tor);
	ns.tprint("Bit node: " + player.bitNodeN);
	ns.tprint("Entropy: " + player.entropy);
	ns.tprint("------------------");
	ns.tprint("Hacking");
	ns.tprint("  Chance:     " + multiHackingChance);
	ns.tprint("  Speed:      " + multiHackingSpeed);
	ns.tprint("  Grow:       " + multiHackingGrow);
	ns.tprint("------------------");
	ns.tprint("Skills");
	ns.tprint("  Hacking:      " + skillsHacking);
	ns.tprint("    Multiplier: " + multiHacking);
	ns.tprint("    Experience: " + multiHackingExp);
	ns.tprint("");
	ns.tprint("  Strength:     " + skillsStrength);
	ns.tprint("    Multiplier: " + multiStrength);
	ns.tprint("    Experience: " + multiStrengthExp);
	ns.tprint("");
	ns.tprint("  Defense:      " + skillsDefense);
	ns.tprint("    Multiplier: " + multiDefense);
	ns.tprint("    Experience: " + multiDefenseExp);
	ns.tprint("");
	ns.tprint("  Dexterity:    " + skillsDexterity);
	ns.tprint("    Multiplier: " + multiDexterity);
	ns.tprint("    Experience: " + multiDexterityExp);
	ns.tprint("");
	ns.tprint("  Agility:      " + skillsAgility);
	ns.tprint("    Multiplier: " + multiAgility);
	ns.tprint("    Experience: " + multiAgilityExp);
	// ns.tprint("    Level mult: " + ns.nFormat(bitNodemulti.AgilityLevelMultiplier, "0,0.00%"));
	ns.tprint("");
	ns.tprint("  Charisma:     " + skillsCharisma);
	ns.tprint("------------------");
	ns.tprint("Work");
	ns.tprint("  Money: " + multiWorkMoney);
	ns.tprint("------------------");
	ns.tprint("Company");
	ns.tprint("  Reputation:       " + multiCompanyRep);
	ns.tprint("  Has corporation?: " + player.hasCorporation);
	ns.tprint("------------------");
	ns.tprint("Crime");
	ns.tprint("  People killed: " + player.numPeopleKilled);
	ns.tprint("  Money:         " + multiCrimeMoney);
	ns.tprint("  Success:       " + multiCrimeSuccess);
	ns.tprint("------------------");
	ns.tprint("Hack net node");
	ns.tprint("  Purchase cost: " + multiHackNetNodePurchaseCost);
	ns.tprint("  Level cost:    " + multiHackNetNodeLevelCost);
	ns.tprint("  RAM cost:      " + multiHackNetNodeRamCost);
	ns.tprint("  Core cost:     " + multiHackNetNodeCoreCost);
	ns.tprint("  Money:         " + multiHackNetNodeMoney);
	ns.tprint("------------------");
	ns.tprint("Blade burner");
	ns.tprint("  In blade burner:   " + player.inBladeburner);
	ns.tprint("  Stamina:           " + multiBladeBurnerStaminaGain + " / " + multiBladeBurnerStaminaMax);
	ns.tprint("    Analysis:        " + multiBladeBurnerAnalysis);
	ns.tprint("    Success chance:  " + multiBladeBurnerSuccessChance);
	ns.tprint("------------------");
	ns.tprint("Factions");
	ns.tprint("  Reputation: " + multiFactionRep);
	ns.tprint("  " + factions);
	ns.tprint("------------------");
	ns.tprint("Jobs: ");
	jobsKeys.forEach(function (job) {
		ns.tprint("  " + job + ": " + player.jobs[job]);
	});
	ns.tprint("------------------");
	ns.tprint("Playtime");
	ns.tprint("  Total:                   " + totalPlaytime);
	ns.tprint("  Since last bit node:     " + playtimeSinceLastBitNode);
	ns.tprint("  Since last augmentation: " + playtimeSinceLastAugmentation);
	ns.tprint("====================================");
}