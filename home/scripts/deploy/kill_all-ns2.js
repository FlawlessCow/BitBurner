// ===== IMPORTS ==============
import * as bsi from "/master/functions/buildServerInfoArray-ns2.js";
import * as hpn from "/master/functions/getNumOpenablePorts-ns2.js";
import * as gra from "/master/functions/getRootAccess-ns2.js";

// ===== ARGS =================
var sArgs = {
    
};

// ===== VARS =================
var sVars = {
    installScript : "/master/hacking/basic/install_and_run-ns1.script",
    hackingTarget : "max-hardware",
};

var tests = {
	enabled : false, // Master override for all tests
	testExampleEnabled : false,
};

// ===== MAIN =================
export async function main(ns) {
	ns.disableLog("ALL");

    // figure out how many ports I can steal
    var hackablePortNum = await hpn.getNumOpenablePorts(ns);
    ns.print("I can hack this many ports: " + hackablePortNum);
    
    // build get the list of servers
    var serverList = await bsi.buildServerInfoArray(ns);
    
    // based on how many ports I can open, use the install and run script
    for (var i = 0; i < serverList.length; i++){
        var thisServer = serverList[i];
        
        if(thisServer.numPortsRequired <= hackablePortNum &&
		  thisServer.name !== "home") {
            // get root access
			if (ns.hasRootAccess(thisServer.name) === false) {
				ns.print("getting access on " + thisServer.name + " which needs ports: " + thisServer.numPortsRequired);
				await gra.getRootAccess(ns, thisServer.name);
			}
            
            // install the hack script
			ns.killall(thisServer.name);
        }
    }
	
	// Tests
	if (tests.enabled)
		executeTests(ns);
}

// ===== FUNCTIONS ============


// ===== TESTS ================
function executeTests(ns) {
	if (tests.testExampleEnabled)
		testExample(ns);
}

function testExample(ns) {
	ns.print("==== TEST: testExample ====");

}