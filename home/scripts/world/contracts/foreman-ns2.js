// ===== IMPORTS ================================
import * as bsi from "/master/functions/buildServerInfoArray-ns2.js";

// ===== ARGS ===================================
function getScriptArgs(ns) {
    var scriptArgs = {
        firstArg : ns.args[0]
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

	while(true) {
		reportContracts(ns);

		await ns.sleep(60*1000);
	}
}

// ===== FUNCTIONS ==============================
function reportContracts(ns) {
	// Build a server list
	var serverListArray = await bsi.buildServerInfoArray(ns);
	
	// Iterate thru the list of servers
	for(i=0; i<serverListArray.length; i++) {
		var server = serverListArray[i].name;

		// Do an ls() on the server
		var lsResults = ns.ls(server, ".cct");

		// If there are results matching the contract extension, spit info out to the terminal window
		if(lsResults.length > 0) {
			ns.tprint("Found contract(s) on server: " + server);
		}
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