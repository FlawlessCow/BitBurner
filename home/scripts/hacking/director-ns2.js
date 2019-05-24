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
        firstArg : ns.args[0]
    };
    
    return scriptArgs;
}

// ===== VARS ===================================
var sVars = {
	scanFrequency : 60 * 1000, // 60 seconds in milliseconds
};

var tests = {
	enabled : false, // Master override for all tests
	disableMain : false, // Disables all non-testing logic in main
	testEnabled_exampleFunction : false,
	testEnabled_serverArrayBuilder : false,
};

// ===== MAIN ===================================
export async function main(ns) {
	var sArgs = getScriptArgs(ns);
	
	// - Tests ----------------------------------
	if (tests.enabled)
		await executeTests(ns);
	
	// - Early out ------------------------------
	if (tests.disableMain) {
		ns.tprint("WARNING: SCRIPT IS IN TEST ONLY MODE");
		ns.exit();
	}
	
	// - Real Script Logic ----------------------
	ns.print("Starting script...");
	ns.disableLog("ALL");

	// Build a server list
	var hackableServerListArray = await bsi.buildHackableServerInfoArray(ns);
	var deployServerListArray = await bsi.buildServerInfoArray(ns);
	var primaryHackTarget = ns.peek(ePortIndex.PRIMARY_HACKING_TARGET); // Could start out as NULL PORT DATA; that's ok. Other scripts need to deal with that.

	// Sort the server list by money, high -> low
    hackableServerListArray.sort(function(a, b) {
        return b.maxMoney - a.maxMoney;
    });

	// Start loopin' to find & update target
	while(true) {
		var currentBestTarget = getBestHackableTarget(ns, hackableServerListArray);

		// If the best option is different from our current option, update the port
		if (currentBestTarget !== primaryHackTarget)
		{
			primaryHackTarget = currentBestTarget;
			ns.clear(ePortIndex.PRIMARY_HACKING_TARGET);
			ns.write(ePortIndex.PRIMARY_HACKING_TARGET, currentBestTarget);

			for (var i = 0; i < deployServerListArray.length; i++) {
				deployServer = deployServerListArray[i];

				if (portBreakingLevel >= deployServer.numPortsRequired) {
					gra.getRootAccess(ns, deployServer);
					await deployHackBots(ns, deployServer, primaryHackTarget);
				}
			}
		}

		// Sleep for like...a minute or something.
		await ns.sleep(sVars.scanFrequency);
	}
}

// ===== FUNCTIONS ==============================
function getBestHackableTarget(ns, serverListArray) {
	// Figure out my hacking ability & port opening ability
	var hackingSkillLevel = ns.getHackingLevel();
	var portBreakingLevel = hpn.getNumOpenablePorts(ns);

	// Iterate thru the list, finding the first option that can be hacked (skill & ports opening
	for (var i=0; i<serverListArray.length; i++) {
		var server = serverListArray[i];

		if(hackingSkillLevel >= server.requiredHackingLevel && portBreakingLevel >= server.numPortsRequired) {
			return server.name;
		}
	}
}

async function deployHackBots(ns, runningServer, hackTargetServer) {
	// ns.killall returns true if any scripts were killed, false if not. We're ready to move on if we haven't killed anything
	while(!ns.killall(runningServer)){ 
		sleep(1000);
	}

	var hackHelperScript = "/master/scripts/hacking/helpers/hack_target_loop-ns1.script";
	var growHelperScript = "/master/scripts/hacking/helpers/grow_target_loop-ns1.script";
	var weakenHelperScript = "/master/scripts/hacking/helpers/weaken_target_loop-ns1.script";

	var freeRam = gsr.getServerRamObject.freeRam;
	var ramPerHelperThread = 1.7;
	var hackThreads = 1;
	var weakenAndGrowRamPool = freeRam - (hackThreads * ramPerHelperThread); // Reserved for 1 hack thread
	var weakenAndGrowAvailableThreads = weakenAndGrowRamPool / ramPerHelperThread;
	var weakenThreads = Math.ceil(weakenAndGrowAvailableThreads / 10);
	var growAvailableRamPool = weakenAndGrowRamPool - (weakenThreads * ramPerHelperThread);
	var growThreads = Math.floor(growAvailableRamPool / ramPerHelperThread);

	// Copy the scripts
	ns.scp(hackHelperScript, "home", runningServer);
	ns.scp(growHelperScript, "home", runningServer);
	ns.scp(weakenHelperScript, "home", runningServer);

	// Run the scripts
	await ns.exec(weakenHelperScript, runningServer, weakenThreads, hackTargetServer);
	await ns.exec(growHelperScript, runningServer, growThreads, hackTargetServer);
	await ns.exec(hackHelperScript, runningServer, hackThreads, hackTargetServer);
}

// ===== TESTS ==================================
async function executeTests(ns) {
	if (tests.testEnabled_exampleFunction)
		test_exampleFunction(ns);
	if (tests.testEnabled_serverArrayBuilder)
		await test_serverArrayBuilder(ns);
}

function test_exampleFunction(ns) {
	ns.print("==== TEST: test_exampleFunction ====");

}

async function test_serverArrayBuilder(ns) {
	ns.print("==== TEST: test_serverArrayBuilder ====");

	var serverListArray = await bsi.buildHackableServerInfoArray(ns);
	print(typeof serverListArray);

    serverListArray.sort(function(a, b) {
        return a.requiredHackingLevel - b.requiredHackingLevel;
    });

    for (var i=0; i < serverListArray.length; i++) {
		ns.tprint("Index: " + i + " / RequiredHackingLevel: " + serverListArray[i].requiredHackingLevel + " / MaxMoney: " + ns.nFormat(serverListArray[i].maxMoney, "0,0") + " / SeverName: " + serverListArray[i].name);
	}
}

/* ===== REFERENCE ==============================
ns.write()
ns.trywrite()
ns.read()
ns.peek()
ns.clear()
	*/