// ===== IMPORTS ================================
import * as wallet from "/master/character/wallet-ns2.js";

// ===== ARGS ===================================
function getScriptArgs(ns) {
    var scriptArgs = {
        hackTarget : ns.args[0],
        desiredStartingRam : ns.args[1],
    };
    
    return scriptArgs;
}

// ===== VARS ===================================
var sVars = {
    ramIncreaseFactor : 16,
    setupScriptName : "/master/hacking/deployHackBots-ns2.js",
};

var tests = {
	enabled : false, // Master override for all tests
	disableMain : false, // Disables all non-testing logic in main
	testEnabled_exampleFunction : false,
};

// ===== MAIN ===================================
export async function main(ns) {
	var sArgs = getScriptArgs(ns);
	
	// - Tests ----------------------------------
	if (tests.enabled)
		executeTests(ns);
	
	// - Early out ------------------------------
	if (tests.disableMain) {
		ns.tprint("WARNING: SCRIPT IS IN TEST ONLY MODE");
		ns.exit();
	}
	
	// - Real Script Logic ----------------------
	ns.print("Starting script...");
    ns.disableLog("ALL");

    var desiredRam = sArgs.desiredStartingRam;
    
    while(desiredRam <= ns.getPurchasedServerMaxRam()) {
        await fillEmptyServerSlots(ns, sArgs, desiredRam);
        await upgradeExisitngServers(ns, sArgs, desiredRam);
        desiredRam = incrementDesiredRam(desiredRam, sVars.ramIncreaseFactor);

        await ns.sleep(100);
    }
}

// ===== FUNCTIONS ==============================
async function fillEmptyServerSlots(ns, sArgs, desiredRam) {
    while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
        ns.print("DEBUG: Buying at " + desiredRam + "GB");

        // create a server name
        var desiredServerName = "pserv-" + desiredRam + "GB";

        // Attempt to buy a server
        var desiredServerName = "pserv-" + desiredRam + "GB";
        var newHostname = await purchaseNewServer(ns, desiredServerName, desiredRam);

        // Run setup script on the new server
        await ns.run(sVars.setupScriptName, 1, newHostname, sArgs.hackTarget);

        await ns.sleep(100);
    }
}

async function upgradeExisitngServers(ns, sArgs, desiredRam) {
    ns.print("DEBUG: Upgrading to " + desiredRam + "GB");

    // call get purchased servers
    var purchasedServers = ns.getPurchasedServers();

    for (var servIndex = 0; servIndex < purchasedServers.length; servIndex++) {
        var oldHostname = purchasedServers[servIndex];
        ns.print("DEBUG: Evaluating: " + oldHostname);

        var oldHostRam = ns.getServerRam(oldHostname)[0];

        if (oldHostRam < desiredRam) {
            // Wait for enough money
            await waitForEnoughMoney(ns, desiredRam);

            // delete the old server
            await deleteOldServer(ns, oldHostname);

            // buy a server
            var desiredServerName = "pserv-" + desiredRam + "GB";
            var newHostname = await purchaseNewServer(ns, desiredServerName, desiredRam);

            ns.print("DEBUG: New server named: " + newHostname);

            // Run setup script on the new server
            await ns.run(sVars.setupScriptName, 1, newHostname, sArgs.hackTarget);
        }
    }
}

async function deleteOldServer(ns, server) {
    while(ns.serverExists(server)) {
        // kill all scripts on the old server
        // ns.killall returns true if any scripts were killed, false if not. We're ready to move on if we haven't killed anything
        while (ns.killall(server)) {
            ns.print("Sleeping after trying to killall on " + server);
            await ns.sleep(1000);
        }
    
        // delete the old server
        ns.print("DEBUG: Deleting: " + server);
        ns.deleteServer(server);

        await ns.sleep(100);
    }
}

async function purchaseNewServer(ns, desiredServerName, desiredRam) {
    var newHostname = "";

    while (newHostname === "") {
        // Wait for enough money
        await waitForEnoughMoney(ns, desiredRam);

        newHostname = ns.purchaseServer(desiredServerName, desiredRam);
        await ns.sleep(1000);
    }

    return newHostname;
}

async function waitForEnoughMoney(ns, desiredRam) {
    while (wallet.getAvailableMoney(ns, wallet.spendLimits.newServer) < ns.getPurchasedServerCost(desiredRam)) {
        debugDumpMoneyStats(ns, desiredRam);
        await ns.sleep(60 * 1000);
    }
}

function incrementDesiredRam(currentDesiredRam, ramMultiplier) {
    var newDesiredRam = currentDesiredRam * ramMultiplier;

    return newDesiredRam;
}

function debugDumpMoneyStats(ns, desiredRam) {
    var availableMoney = wallet.getAvailableMoney(ns, wallet.spendLimits.newServer);
    var neededMoney = ns.getPurchasedServerCost(desiredRam);
    var percentageOfNeeded = (availableMoney/neededMoney)*100;

    ns.print("DEBUG: Not enough money! Available / Needed / %: " +
        ns.nFormat(availableMoney, "0,0.00") + " / " +
        ns.nFormat(neededMoney, "0,0.00") + " / " +
        ns.nFormat(percentageOfNeeded, "0.0") + "%");
}

// ===== TESTS ==================================
function executeTests(ns) {
	if (tests.testEnabled_exampleFunction)
		test_exampleFunction(ns);
}

function test_exampleFunction(ns) {
	ns.print("==== TEST: test_exampleFunction ====");

}