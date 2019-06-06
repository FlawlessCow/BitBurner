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
    equipmentSpendLimit : 0.20,
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
        await recruitmentMembers(ns);
        updateGangMemberCombatEquipment(ns);
        updateGangMemberHackingEquipment(ns);
        updateGangMemberTasks(ns);

        await ns.sleep(100);
    }
}

// ===== FUNCTIONS ==============================
async function recruitmentMembers(ns) {
    while (ns.gang.canRecruitMember()) {
        var currentDateTime = new Date();
        var newGangMemberName = "Android-" + currentDateTime.getTime();
        ns.gang.recruitMember(newGangMemberName);

        await ns.sleep(100);
    }
}

function updateGangMemberCombatEquipment(ns) {

}

function updateGangMemberHackingEquipment(ns) {

}

function updateGangMemberTasks(ns) {
    // Task will be "Unassigned" if not assigned
}

// ===== TESTS ==================================
function executeTests(ns) {
	if (tests.testEnabled_exampleFunction)
		test_exampleFunction(ns);
}

function test_exampleFunction(ns) {
	ns.print("==== TEST: test_exampleFunction ====");

}