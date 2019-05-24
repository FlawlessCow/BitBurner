// ===== IMPORTS ================================

// ===== ARGS ===================================
function getScriptArgs(ns) {
    var scriptArgs = {
        firstArg: ns.args[0]
    };

    return scriptArgs;
}

// ===== VARS ===================================
var sVars = {

};

var tests = {
    enabled: false, // Master override for all tests
    disableMain: false, // Disables all non-testing logic in main
    testEnabled_exampleFunction: false,
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
export function getServerRamObject(ns, server) {
    // Get the server's RAM, total and used
    var targetServRam = getServerRam(target);
    var targetServTotalRam = targetServRam[0];
    var targetServUsedRam = targetServRam[1];

    // Use the RAM info to get the free ram
    var targetServFreeRam = targetServTotalRam - targetServUsedRam;

    var serverRamObj = {
        total: targetServRam,
        used: targetServUsedRam,
        free: targetServFreeRam,
    }

    return serverRamObj;
}

// ===== TESTS ==================================
function executeTests(ns) {
    if (tests.testEnabled_exampleFunction)
        test_exampleFunction(ns);
}

function test_exampleFunction(ns) {
    ns.print("==== TEST: test_exampleFunction ====");

}