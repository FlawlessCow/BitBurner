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
    ns.print("Starting script...");
    
    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/scripts/character/hacknet/hashmanager/ns2_hashmanager_run.js", "/pull.js");

    pullBeta(ns)
}

// ===== FUNCTIONS ==============================
async function pullBeta(ns){
    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/scripts/character/hacknet/hashmanager/ns2_hashmanager_run.js", "/beta/character/hacknet/hashmanager/run.js");
}

// ===== TESTS ==================================
function executeTests(ns) {
	if (tests.testEnabled_exampleFunction)
		test_exampleFunction(ns);
}

function test_exampleFunction(ns) {
	ns.print("==== TEST: test_exampleFunction ====");

}