// ===== IMPORTS ================================

// ===== ARGS ===================================
function getScriptArgs(ns) {
    var scriptArgs = {
        firstArg : ns.args[0]
    };
    
    return scriptArgs;
}

// ===== VARS ===================================
export var spendLimits = {
    newServer : 0.70,
    hacknet : 0.20,
    gangEquipment : 0.10,
};

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
}

// ===== FUNCTIONS ==============================
export function getMyMoney(ns) {
    return ns.getServerMoneyAvailable("home");
}

export function getAvailableMoney(ns, spendLimit) {
    var myMoney = getMyMoney(ns);
    var availableMoney = myMoney * spendLimit;

    return availableMoney;
}

export function getSpendLimits() {
    return spendLimits;
}

export async function async_waitForEnoughMoney(ns, spendLimitModifier, desiredMoney) {
    while (getAvailableMoney(ns, spendLimitModifier) < ns.getPurchasedServerCost(desiredMoney)) {
        debugDumpMoneyStats(ns, desiredMoney);
        await ns.sleep(60 * 1000);
    }
}

export function debugDumpMoneyStats(ns, spendLimitModifier, desiredMoney) {
    var availableMoney = getAvailableMoney(ns, spendLimitModifier);
    var desiredMoney = ns.getPurchasedServerCost(desiredRam);
    var percentageOfNeeded = (availableMoney/desiredMoney)*100;

    ns.print("DEBUG: Not enough money! " +
        "Available: " + ns.nFormat(availableMoney, "0,0.00") + " / " +
        "Desired: " + ns.nFormat(desiredMoney, "0,0.00") + " / " +
        ns.nFormat(percentageOfNeeded, "0.0") + "%");
}

// ===== TESTS ==================================
function executeTests(ns) {
	if (tests.testEnabled_exampleFunction)
		test_exampleFunction(ns);
}

function test_exampleFunction(ns) {
	ns.print("==== TEST: test_exampleFunction ====");

}