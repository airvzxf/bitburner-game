import {BitNodeMultipliers, Player, Server} from "./bitburner";

/**
 * Data with the basic information which is passing to process the
 * hack, weaken and growth.
 * @public
 */
export declare interface InformationBasic {
    // Victim: Object with all the information about the victim server.
    victim: Server;
    // Hacker Server: Object with all the information about the hacker server.
    hacker: Server;
    // Player: Object with all the information about the player.
    player: Player;
    // BitNodeMultipliers: Multiplier for the Bit Node.
    bitNodeMultipliers: BitNodeMultipliers;
}

/**
 * Data representing the growth results.
 * @public
 */
export declare interface GrownData {
    // Threads: Number of thread processed.
    threads: number;
    // Money Start: The amount of money it started with.
    moneyStart: number;
    // Money Available: The amount of money after the growth.
    moneyAvailable: number;
    // Security: The amount of security increased after the growth.
    security: number;
    // Security Total: The total amount of security increased after the growth.
    securityTotal: number;
    // Security Total Remainder: The total amount of increased security, minus the minimum security.
    securityTotalRemainder: number;
}

/**
 * Data representing the hacked results.
 * @public
 */
export declare interface HackedData {
    // Threads: Number of thread processed.
    threads: number;
    // Money Start: The amount of money it started with.
    moneyStart: number;
    // Money Gained: The amount of gained money after the hack.
    moneyGained: number;
    // Money Available: The amount of money after the hack.
    moneyAvailable: number;
    // Security: The amount of security increased after the hack.
    security: number;
    // Security Total: The total amount of security increased after the hack.
    securityTotal: number;
    // Security Total Remainder: The total amount of increased security, minus the minimum security.
    securityTotalRemainder: number;
}

/**
 * Data representing the hacked results.
 * @public
 */
export declare interface HackInfiniteCycleData {
    // Server: Object with all the information about the victim server.
    victim: Server;
    // Hacker Server: Object with all the information about the hacker server.
    hacker: Server;
    // Player: Object with all the information about the player.
    player: Player;
    // The threads used for the hack function. Always set as undefined because it will change
    // until fit with the best number of threads to do a hack cycle.
    threadsToHack: number;
    // Script hack: The name of the script which to the hack function.
    scriptHack: string;
    // Script weaken hack: The name of the script which reduce the security generated from the hack function.
    scriptWeakenHack: string;
    // Script growth: The name of the script which to the growth function.
    scriptGrowth: string;
    // Script weaken growth: The name of the script which reduce the security generated from the growth function.
    scriptWeakenGrowth: string;
}