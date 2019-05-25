// ===== IMPORTS ================================
import * as bsi from "/master/functions/buildServerInfoArray-ns2.js";
import * as hpn from "/master/functions/getNumOpenablePorts-ns2.js";
import * as gsr from "/master/functions/getServerRamObj-ns2.js";
import * as gra from "/master/functions/getRootAccess-ns2.js";
import * as enumLib from "/master/functions/enumLib-ns2.js";
var ePortIndex = enumLib.getEnumPortIndexVersion(1);

// ===== ARGS ===================================
function getScriptArgs(ns) {
    var scriptArgs = {
		deployTarget : ns.args[0],
        fallbackHackTarget : ns.args[1],
    };
    
    return scriptArgs;
}

// ===== VARS ===================================
var sVars = {

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

	// Set the best target
	var bestHackTarget = ns.peek(ePortIndex.PRIMARY_HACKING_TARGET);
	if(bestHackTarget === "NULL PORT DATA") {
		bestHackTarget = sArgs.fallbackHackTarget;
	}

	// Function is built around a server array, so we build a simple one
	var serverInfoArray = [bsi.getTargetInfo(ns, sArgs.hackTarget, null, 0)];

	// Deploy the hackbots
	await deployHackBots(ns, serverInfoArray, bestHackTarget);
}

// ===== FUNCTIONS ==============================
export async function deployHackBots(ns, deployServerListArray, hackTargetServer) {
	ns.print("Beggining to deploy the hack bots! Targeting: " + hackTargetServer);

	// Ensure we have root access on the hack target
	gra.getRootAccess(ns, hackTargetServer);

	var portBreakingLevel = hpn.getNumOpenablePorts(ns);

	for (var i = 0; i < deployServerListArray.length; i++) {
		var deployServer = deployServerListArray[i];
		ns.print("Evaluating server: " + deployServer.name);

		var hackHelperScript = "/master/hacking/helpers/hack_target_loop-ns1.script";
		var growHelperScript = "/master/hacking/helpers/grow_target_loop-ns1.script";
		var weakenHelperScript = "/master/hacking/helpers/weaken_target_loop-ns1.script";

		var minRequiredRam = ns.getScriptRam(hackHelperScript) + ns.getScriptRam(growHelperScript) + ns.getScriptRam(weakenHelperScript);

		if ((portBreakingLevel >= deployServer.numPortsRequired && deployServer.ram >= minRequiredRam && deployServer.isHome === false) || deployServer.isPserv) {
			ns.print("Preparing to deploy the hack bots to: " + deployServer.name);
			gra.getRootAccess(ns, deployServer.name);

			// ns.killall returns true if any scripts were killed, false if not. We're ready to move on if we haven't killed anything
			while (ns.killall(deployServer.name)) {
				ns.print("Sleeping after trying to killall on " + deployServer.name);
				await ns.sleep(1000);
			}

			var freeRam = gsr.getServerRamObject(ns, deployServer.name).free;
			// Algorithm v2
			// Weakening and hacking should make up at least 10% of the RAM pool, the remainder goes towards growing
			var ramPerWeakenHelperThread = ns.getScriptRam(weakenHelperScript);
			var weakenReservedRamMinimumModifier = 0.10;
			var weakenMinThreads = 1;
			var weakenRamMinRequirement = freeRam * weakenReservedRamMinimumModifier;
			var weakenThreads = Math.ceil(weakenRamMinRequirement / ramPerWeakenHelperThread);
			if (weakenThreads < weakenMinThreads) {
				weakenThreads = weakenMinThreads;
			}
			var weakenRamUsage = weakenThreads * ramPerWeakenHelperThread;

			var ramPerHackHelperThread = ns.getScriptRam(hackHelperScript);
			var hackReservedRamMinimumModifier = 0.10;
			var hackMaxStealPercent = 0.01;
			var hackPercentPerThread = ns.hackAnalyzePercent(hackTargetServer)/100;
			var hackMaxThreadsRaw = hackMaxStealPercent/hackPercentPerThread;
			var hackMaxThreads = Math.floor(hackMaxThreadsRaw);
			var hackMinThreads = 1;
			var hackRamMinRequirement = freeRam * hackReservedRamMinimumModifier;
			var hackThreads = Math.ceil(hackRamMinRequirement / ramPerHackHelperThread);
			if (hackThreads > hackMaxThreads) {
				hackThreads = hackMaxThreads;
			}
			if (hackThreads < hackMinThreads) {
				hackThreads = hackMinThreads;
			}
			var hackRamUsage = hackThreads * ramPerHackHelperThread;

			var ramPerGrowHelperThread = ns.getScriptRam(growHelperScript);
			var growRamPool = freeRam - (weakenRamUsage + hackRamUsage);
			var growThreads = Math.floor(growRamPool / ramPerGrowHelperThread);

			ns.print("=========== Thread Count Dump ===========");
			ns.print("weakenThreads: " + weakenThreads);
			ns.print("growThreads: " + growThreads);
			ns.print("hackThreads: " + hackThreads);
			ns.print("============= End Debug Dump ============");

			// Copy the scripts
			ns.print("Copying scripts...");
			ns.scp(hackHelperScript, "home", deployServer.name);
			ns.scp(growHelperScript, "home", deployServer.name);
			ns.scp(weakenHelperScript, "home", deployServer.name);

			// Run the scripts
			ns.print("Launching the hack bots!");
			await ns.exec(weakenHelperScript, deployServer.name, weakenThreads, hackTargetServer);
			await ns.exec(growHelperScript, deployServer.name, growThreads, hackTargetServer);
			await ns.exec(hackHelperScript, deployServer.name, hackThreads, hackTargetServer);
		}

		await ns.sleep(1000);
	}
}


// ===== TESTS ==================================
function executeTests(ns) {
	if (tests.testEnabled_exampleFunction)
		test_exampleFunction(ns);
}

function test_exampleFunction(ns) {
	ns.print("==== TEST: test_exampleFunction ====");

}