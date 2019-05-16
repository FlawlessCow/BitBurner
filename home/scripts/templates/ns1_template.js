// ===== IMPORTS ================================

// ===== ARGS ===================================
function getScriptArgs() {
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
main();

function main() {
	var sArgs = getScriptArgs();
	
	// - Tests ----------------------------------
	if (tests.enabled)
		executeTests();
	
	// - Early out ------------------------------
	if (tests.disableMain) {
		tprint("WARNING: SCRIPT IS IN TEST ONLY MODE");
		exit();
	}
	
	// - Real Script Logic ----------------------
	print("Starting script...");
	disableLog("ALL");
}

// ===== FUNCTIONS ==============================


// ===== TESTS ==================================
function executeTests() {
    if (tests.testEnabled_exampleFunction)
        test_exampleFunction();
}

function test_exampleFunction() {
	ns.print("==== TEST: test_exampleFunction ====");

}