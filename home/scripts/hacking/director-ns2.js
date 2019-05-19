// ===== IMPORTS ================================
import * as bsi from "/master/functions/buildServerInfoArray-ns2.js";
import * as hpn from "/master/functions/getNumOpenablePorts-ns2.js";
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
	enabled : true, // Master override for all tests
	disableMain : true, // Disables all non-testing logic in main
	testEnabled_exampleFunction : false,
	testEnabled_serverArrayBuilder : true,
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

	// 1. Build a server list
	var serverListArray = bsi.buildHackableServerInfoArray(ns);
	var primaryHackTarget = ns.peek(ePortIndex.PRIMARY_HACKING_TARGET); // Could start out as NULL PORT DATA; that's ok. Other scripts need to deal with that.

	// 2. Sort the server list by money, high -> low
    serverListArray.sort(function(a, b) {
        return b.maxMoney - a.maxMoney;
    });

	// 3. Start loopin' to find & update target
	while(true) {
		// 3a. Figure out my hacking ability & port opening ability
		var hackingSkillLevel = ns.getHackingLevel();
		var portBreakingLevel = hpn.getNumOpenablePorts(ns);

		// 3b. Iterate thru the list, finding the first option that can be hacked (skill & ports opening
		var currentBestTarget = getBestHackableTarget(serverListArray, hackingSkillLevel, portBreakingLevel);

		// 3c. If the best option is different from our current option, update the port
		if (currentBestTarget !== primaryHackTarget)
		{
			primaryHackTarget = currentBestTarget;
			ns.clear(ePortIndex.PRIMARY_HACKING_TARGET);
			ns.write(ePortIndex.PRIMARY_HACKING_TARGET, currentBestTarget);
		}

		// 3d. Sleep for like...a minute or something.
		await ns.sleep(sVars.scanFrequency);
	}
}

// ===== FUNCTIONS ==============================
function getBestHackableTarget(serverListArray, hackingSkillLevel, portBreakingLevel) {
	for (var i=0; i<serverListArray.length; i++) {
		server = serverListArray[i];

		if(hackingSkillLevel >= server.requiredHackingLevel && portBreakingLevel >= server.numPortsRequired) {
			return server.name;
		}
	}
}

// ===== TESTS ==================================
function executeTests(ns) {
	if (tests.testEnabled_exampleFunction)
		test_exampleFunction(ns);
	if (testEnabled_serverArrayBuilder)
		test_serverArrayBuilder(ns);
}

function test_exampleFunction(ns) {
	ns.print("==== TEST: test_exampleFunction ====");

}

function test_serverArrayBuilder(ns) {
	ns.print("==== TEST: test_serverArrayBuilder ====");

	var serverListArray = bsi.buildHackableServerInfoArray(ns);
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