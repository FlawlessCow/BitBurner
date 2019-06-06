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
        updateGangMemberEquipment(ns);
        updateGangMemberTasks(ns);

        await ns.sleep(100);
    }
}

// ===== FUNCTIONS ==============================
async function recruitmentMembers(ns) {
    while (ns.gang.canRecruitMember()) {
        var currentDateTime = new Date();
        var newGangMemberName = "Android-" + currentDateTime.getMilliseconds;
        ns.gang.recruitMember(newGangMemberName);

        await ns.sleep(100);
    }
}

function updateGangMemberEquipment(ns) {

}

function updateGangMemberTasks(ns) {

}

// ===== TESTS ==================================
function executeTests(ns) {
	if (tests.testEnabled_exampleFunction)
		test_exampleFunction(ns);
}

function test_exampleFunction(ns) {
	ns.print("==== TEST: test_exampleFunction ====");

}