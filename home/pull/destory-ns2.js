// ===== IMPORTS ================================

// ===== ARGS ===================================
function getScriptArgs(ns) {
    var scriptArgs = {
        destination : ns.args[0]
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
    if(sArgs.destination === "beta" || sArgs.destination === "master") {
		await destroy(ns, sArgs.destination);
	}
	else {
		ns.tprint("===== ALERT ===== Not a valid argument");
		ns.tprint("===== ALERT ===== sArgs.destination: " + sArgs.destination);
	}
}

// ===== FUNCTIONS ==============================
async function destroy(ns, branch){
	var scripts = [
		// buy_server
		"/buy_server/buy_server-ns1.js",
		// hacknet
		"/character/hacknet/hashmanager-ns2.js",
		"/character/hacknet/node_autobuy-ns2.js",
		"/character/hacknet/server_autobuy-ns2.js",
		// deploy
		"/deploy/kill_all-ns2.js",
		"/deploy/server_teal_basic-ns2.js",
		// templates
		"/templates/ns1_template.js",
		"/templates/ns2_template.js",
	];
	// bitBurner setup
	var bitBurnerBranchPath = "/" + branch;
	
	for(i = 0; i < scripts.length; i++) {
		var scriptPath = scripts[i];
		var destPath = bitBurnerBranchPath + scriptPath;

		await ns.rm(destPath);
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