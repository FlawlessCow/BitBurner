// ===== IMPORTS ================================

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
	enabled : true, // Master override for all tests
	disableMain : false, // Disables all non-testing logic in main
	testEnabled_getScriptList : true,
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
}

// ===== FUNCTIONS ==============================
export function getScriptList(){
	var scripts = [
		// buy_server
		"/buy_server/buy_server-ns1.script",
		"/buy_server/buy_server-ns2.js",
		// hacknet
		"/character/hacknet/hashmanager-ns2.js",
		"/character/hacknet/node_autobuy-ns2.js",
		"/character/hacknet/server_autobuy-ns2.js",
		// walet
		"/character/wallet-ns2.js",
		// deploy
		"/deploy/kill_all-ns2.js",
		"/deploy/server_steal_basic-ns2.js",
		// functions
		"/functions/buildServerInfoArray-ns2.js",
		"/functions/enumLib-ns1.script",
		"/functions/enumLib-ns2.js",
		"/functions/getNumOpenablePorts-ns2.js",
		"/functions/getRootAccess-ns1.script",
		"/functions/getRootAccess-ns2.js",
		"/functions/getServerRamObj-ns2.js",
		// hacking
		"/hacking/advanced/install_and_run-ns1.script",
		"/hacking/advanced/run-ns1.script",
		"/hacking/basic/install_and_run-ns1.script",
		"/hacking/basic/run-ns1.script",
		"/hacking/guided_basic/install_and_run-ns1.script",
		"/hacking/guided_basic/run-ns1.script",
		"/hacking/early/early_hack_harakiri-sushi-ns1.script",
		"/hacking/early/early_hack_joesguns-ns1.script",
		"/hacking/early/early_hack_template-ns1.script",
		"/hacking/helpers/grow_target_loop-ns1.script",
		"/hacking/helpers/grow_target-ns1.script",
		"/hacking/helpers/hack_target_loop-ns1.script",
		"/hacking/helpers/hack_target-ns1.script",
		"/hacking/helpers/weaken_target_loop-ns1.script",
		"/hacking/helpers/weaken_target-ns1.script",
		"/hacking/deployHackBots-ns2.js",
		"/hacking/director-ns2.js",
		"/hacking/monitor-ns2.js",
		// pserv
		"/pserv/deploy-ns1.script",
		"/pserv/killall_and_deploy-ns1.script",
		"/pserv/killall-ns1.script",
		// restart_run
		"/restart_run/restart_run-ns1.script",
		// templates
		"/templates/ns1_template.js",
		"/templates/ns2_template.js",
		// world
		"/world/gang/godfather-ns2.js",
	];

	return scripts;
}

export function getDrecatedScriptList(){
	var scripts = [
		// hacking
		"/hacking/director-ns1.script",
	];

	return scripts;
}

// ===== TESTS ==================================
function executeTests(ns) {
	if (tests.testEnabled_getScriptList)
		test_getScriptList(ns);
}

function test_getScriptList(ns) {
	ns.print("==== TEST: test_getScriptList ====");

	scripts = getScriptList();
	for (var i = 0; i < scripts.length; i++) {
		ns.print(scripts[i]);
	}
}