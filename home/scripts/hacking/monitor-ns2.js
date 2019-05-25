// ===== IMPORTS ================================
import * as enumLib from "/master/functions/enumLib-ns2.js";
var ePortIndex = enumLib.getEnumPortIndexVersion(1);

// ===== ARGS ===================================
function getScriptArgs(ns) {
    var scriptArgs = {
        scanFrequency : ns.args[0],
        mode : ns.args[1],
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
    
    if (sArgs.mode === "print") {
        await monitorModePrint(ns);
    }
    else if (sArgs.mode === "tprint") {
        await monitorModeTPrint(ns);
    }
    else {
        await monitorModePrint(ns);
    }
}

// ===== FUNCTIONS ==============================
async function monitorModePrint(ns) {
    while(true) {
        if (ns.peek(ePortIndex.PRIMARY_HACKING_TARGET) !== "NULL PORT DATA") {
            var scanTarget = ns.peek(ePortIndex.PRIMARY_HACKING_TARGET);
            var securityCurrent = ns.getServerSecurityLevel(scanTarget);
            var securityMinimum = ns.getServerMinSecurityLevel(scanTarget);
            var moneyCurrent = ns.nFormat(ns.getServerMoneyAvailable(scanTarget), "0,0.00");
            var moneyMax = ns.nFormat(ns.getServerMaxMoney(scanTarget), "0,0.00");

            ns.print("scanTarget: " + scanTarget);
            ns.print("Security (Minimum): " + securityCurrent + "(" + securityMinimum + ")");
            ns.print("Money (Max): " + moneyCurrent + "(" + moneyMax + ")");
        }
        else {
            ns.print("Bad peek results: " + ns.peek(ePortIndex.PRIMARY_HACKING_TARGET));
        }

        await ns.sleep(sArgs.scanFrequency * 1000);
    }
}

async function monitorModeTPrint(ns) {
    while(true) {
        if (ns.peek(ePortIndex.PRIMARY_HACKING_TARGET) !== "NULL PORT DATA") {
            var scanTarget = ns.peek(ePortIndex.PRIMARY_HACKING_TARGET);
            var securityCurrent = ns.getServerSecurityLevel(scanTarget);
            var securityMinimum = ns.getServerMinSecurityLevel(scanTarget);
            var moneyCurrent = ns.nFormat(ns.getServerMoneyAvailable(scanTarget), "0,0.00");
            var moneyMax = ns.nFormat(ns.getServerMaxMoney(scanTarget), "0,0.00");

            ns.tprint("scanTarget: " + scanTarget);
            ns.tprint("Security (Minimum): " + securityCurrent + "(" + securityMinimum + ")");
            ns.tprint("Money (Max): " + moneyCurrent + "(" + moneyMax + ")");
        }
        else {
            ns.print("Bad peek results: " + ns.peek(ePortIndex.PRIMARY_HACKING_TARGET));
        }

        await ns.sleep(sArgs.scanFrequency * 1000);
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