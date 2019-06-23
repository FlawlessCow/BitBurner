// ===== IMPORTS ================================
import * as wallet from "/master/character/wallet-ns2.js";

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
        // $TODO: Someday name a gang member "Android-function getMilliseconds() { [native code] }", for the funny
        var newGangMemberName = "Android-" + currentDateTime.getTime();
        ns.gang.recruitMember(newGangMemberName);

        await ns.sleep(100);
    }
}

function updateGangMemberCombatEquipment(ns) {
    if(ns.gang.getGangInformation().isHacking === false) {
        ns.print("Buying combat equipment");

        // Get a list of possible equipment
        var equipmentNamesArray = ns.gang.getEquipmentNames();
        
        for(var i=0; i < equipmentNamesArray.length; i++) {
            var equipment = equipmentNamesArray[i];

            if(ns.gang.getEquipmentType(equipment) !== "Rootkit" && ns.gang.getEquipmentType(equipment) !== "Augmentation") {
                purchaseEquipmentForAllGangMembers(ns, equipment);
            }
        }
    }
}

function updateGangMemberHackingEquipment(ns) {
    if(ns.gang.getGangInformation().isHacking === true) {
        ns.print("Buying hacking equipment");

        // Get a list of possible equipment
        var equipmentNamesArray = ns.gang.getEquipmentNames();
        
        for(var i=0; i < equipmentNamesArray.length; i++) {
            var equipment = equipmentNamesArray[i];
    
            if(ns.gang.getEquipmentType(equipment) === "Rootkit" && ns.gang.getEquipmentType(equipment) !== "Augmentation") {
                purchaseEquipmentForAllGangMembers(ns, equipment);
            }
        }
    }
}

function updateGangMemberTasks(ns) {
    // Determine if the gang is a hacking gang or not

    if (ns.gang.getGangInformation().isHacking === true) {
        assignHackingTasks(ns);
    }
    else if (ns.gang.getGangInformation().isHacking === false) {
        assignCombatTasks(ns);
    }
}

function assignHackingTasks(ns) {

}

function assignCombatTasks(ns) {
    // Task will be "Unassigned" if not assigned
    // Build a list of gang members
    var gangMemberNamesArray = ns.gang.getMemberNames()

    // iterate thru the gang members
    for(var i=0; i < gangMemberNamesArray.length; i++) {
        var gangMemberName = gangMemberNamesArray[i];
        var gangMemberTask = ns.gang.getMemberInformation(gangMemberName).task;
        // if "Unassigned" set to "Vigalante Justice"
        if (gangMemberTask === "Unassigned") {
            ns.gang.setMemberTask(gangMemberName, "Vigalante Justice")
        }

    }    
}

function purchaseEquipmentForAllGangMembers(ns, equipment) {
    var gangMemberNamesArray = ns.gang.getMemberNames();

    var equipmentCost = ns.gang.getEquipmentCost(equipment);

    for(var i=0; i < gangMemberNamesArray.length; i++) {
        var gangMember = gangMemberNamesArray[i];
        var availableMoney = wallet.getAvailableMoney(ns, wallet.spendLimits.gangEquipment)

        if(availableMoney > equipmentCost) {
            ns.gang.purchaseEquipment(gangMember, equipment);
        }
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