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
    
    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/pull/_getScriptList-ns2.js", "/pull/_getScriptList-ns2.js");
    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/pull/pull_scripts-ns2.js", "/pull/pull_scripts-ns2.js");
    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/pull/destroy_scripts-ns2.js", "/pull/destroy_scripts-ns2.js");

    if(sArgs.destination === "beta" || sArgs.destination === "master") {
		await ns.run("/pull/pull_scripts-ns2.js", 1, sArgs.destination);
	}
	else {
		ns.tprint("===== ALERT ===== Not a valid argument");
		ns.tprint("===== ALERT ===== sArgs.destination: " + sArgs.destination);
		ns.tprint("===== ALERT ===== Valid values: master, beta");
	}

	ns.tprint("Pull complete!");
}

// ===== FUNCTIONS ==============================

// ===== TESTS ==================================
function executeTests(ns) {
	if (tests.testEnabled_exampleFunction)
		test_exampleFunction(ns);
}

function test_exampleFunction(ns) {
	ns.print("==== TEST: test_exampleFunction ====");

}