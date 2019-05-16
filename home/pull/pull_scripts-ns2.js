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
		await pull(ns, sArgs.destination);
	}
	else {
		ns.tprint("===== ALERT ===== Not a valid argument");
		ns.tprint("===== ALERT ===== sArgs.destination: " + sArgs.destination);
	}
}

// ===== FUNCTIONS ==============================
async function pull(ns, rootPath){
    rootPath = "/" + rootPath;
    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/scripts/buy_server/buy_server-ns1.js", rootPath + "/buy_server/buy_server-ns1.js");

    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/scripts/character/hacknet/hashmanager-ns2.js", rootPath + "/character/hacknet/hashmanager-ns2.js");
    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/scripts/character/hacknet/node_autobuy-ns2.js", rootPath + "/character/hacknet/node_autobuy-ns2.js");
    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/scripts/character/hacknet/server_autobuy-ns2.js", rootPath + "/character/hacknet/server_autobuy-ns2.js");
    
    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/scripts/deploy/kill_all-ns2.js", rootPath + "/deploy/kill_all-ns2.js");
    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/scripts/deploy/server_teal_basic-ns2.js", rootPath + "/deploy/server_teal_basic-ns2.js");
    
    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/scripts/templates/ns1_template.js", rootPath + "/templates/ns1_template.js");
    await ns.wget("https://raw.githubusercontent.com/FlawlessCow/BitBurner/master/home/scripts/templates/ns2_template.js", rootPath + "/templates/ns2_template.js");
}

// ===== TESTS ==================================
function executeTests(ns) {
	if (tests.testEnabled_exampleFunction)
		test_exampleFunction(ns);
}

function test_exampleFunction(ns) {
	ns.print("==== TEST: test_exampleFunction ====");

}