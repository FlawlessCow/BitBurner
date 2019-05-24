// ===== IMPORTS ==============

// ===== ARGS =================
function getScriptArgs(ns) {
    var scriptArgs = {
        hackingTarget : ns.args[0]
    };
    
    return scriptArgs;
}

// ===== VARS =================
var sVars = {

};

var tests = {
	enabled : true, // Master override for all tests
	disableMain : true, // Disables all non-testing logic in main
	testEnabled_exampleFunction : false,
	testEnabled_nameDump : false,
	testEnabled_nameAndPortsDump : false, 
    testEnabled_dataDump : false,
    testEnabled_testScanArrayDump : false,
    testEnabled_sortByRequiredHackShowMaxMoney : true,
};

// ===== MAIN =================
export async function main(ns) {
    var sArgs = getScriptArgs(ns);
    
	// - Tests ----------------
	if (tests.enabled)
		await executeTests(ns);
	
	// - Early out ------------
	if (tests.disableMain) {
		ns.tprint("WARNING: SCRIPT IS IN TEST ONLY MODE");
		ns.exit();
	}
	
	// - Real Script Logic ----
    ns.disableLog("ALL");
    ns.print("Starting main function");
}

// ===== FUNCTIONS ============
export async function buildServerInfoArray(ns) {
    // Start with the home server
	var serverInfoArray = [getTargetInfo(ns, ns.getHostname(), null, 0)];
	
	var serverListArray = ns.scan(ns.getHostname());
	
	var returnedServerInfo = await processScanResultsRecursive(ns, serverListArray, getTargetInfo(ns, ns.getHostname()), 0);
		
	for (var i=0; i < returnedServerInfo.length; i++) {
		serverInfoArray.push(returnedServerInfo[i]);
	}
    
    return serverInfoArray;
}

export async function buildHackableServerInfoArray(ns) {
    // Start with the home server
	var serverInfoArray = [getTargetInfo(ns, ns.getHostname(), null, 0)];
	
	var serverListArray = ns.scan(ns.getHostname());
	
	var returnedServerInfo = await processScanResultsRecursive(ns, serverListArray, getTargetInfo(ns, ns.getHostname()), 0);
		
	for (var i=0; i < returnedServerInfo.length; i++) {
		if (returnedServerInfo[i].isHackable === true) {
			serverInfoArray.push(returnedServerInfo[i]);
		}
	}
    
    return serverInfoArray;
}

export function getTargetInfo(ns, target, parent, depth) {
	//ns.print("Getting info for " + target + "...");
	var targetIsHacknet = target.startsWith("hacknet");
	var targetIsPserv = target.startsWith("pserv");
    var targetInfo;
	
	if (target === "home") {
		targetInfo = {
			name : target,
			parent : parent,
			depth : depth,
			isHome : true,
			isHacknet : false,
			isPserv : false,
			isPlayerOwned : true,
			isHackable : false,
			ram : ns.getServerRam(target)[0],
			moneyAvailable : ns.getServerMoneyAvailable(target),
			maxMoney : ns.getServerMaxMoney(target),
			growth : ns.getServerGrowth(target),
			securityLevel : ns.getServerSecurityLevel(target),
			baseSecurityLevel : ns.getServerBaseSecurityLevel(target),
			minSecurityLevel : ns.getServerMinSecurityLevel(target),
			requiredHackingLevel : ns.getServerRequiredHackingLevel(target),
			numPortsRequired : ns.getServerNumPortsRequired(target),
		};
	}
	else if (targetIsHacknet) {
		targetInfo = {
			name : target,
			parent : parent,
			depth : depth,
			isHome : false,
			isHacknet : true,
			isPserv : false,
			isPlayerOwned : true,
			isHackable : false,
			ram : ns.getServerRam(target)[0],
			moneyAvailable : 0,
			maxMoney : 0,
			growth : 0,
			securityLevel : Number.MAX_VALUE,
			baseSecurityLevel : Number.MAX_VALUE,
			minSecurityLevel : Number.MAX_VALUE,
			requiredHackingLevel : Number.MAX_VALUE,
			numPortsRequired : Number.MAX_VALUE,
		};
	}
	else if (targetIsPserv) {
		targetInfo = {
			name : target,
			parent : parent,
			depth : depth,
			isHome : false,
			isHacknet : false,
			isPserv : true,
			isPlayerOwned : true,
			isHackable : false,
			ram : ns.getServerRam(target)[0],
			moneyAvailable : ns.getServerMoneyAvailable(target),
			maxMoney : ns.getServerMaxMoney(target),
			growth : ns.getServerGrowth(target),
			securityLevel : ns.getServerSecurityLevel(target),
			baseSecurityLevel : ns.getServerBaseSecurityLevel(target),
			minSecurityLevel : ns.getServerMinSecurityLevel(target),
			requiredHackingLevel : ns.getServerRequiredHackingLevel(target),
			numPortsRequired : ns.getServerNumPortsRequired(target),
		};
	}
	else {
		targetInfo = {
			name : target,
			parent : parent,
			depth : depth,
			isHome : false,
			isHacknet : false,
			isPserv : false,
			isPlayerOwned : false,
			isHackable : true,
			ram : ns.getServerRam(target)[0],
			moneyAvailable : ns.getServerMoneyAvailable(target),
			maxMoney : ns.getServerMaxMoney(target),
			growth : ns.getServerGrowth(target),
			securityLevel : ns.getServerSecurityLevel(target),
			baseSecurityLevel : ns.getServerBaseSecurityLevel(target),
			minSecurityLevel : ns.getServerMinSecurityLevel(target),
			requiredHackingLevel : ns.getServerRequiredHackingLevel(target),
			numPortsRequired : ns.getServerNumPortsRequired(target),
		};
	}
	
	return targetInfo;
}

export async function processScanResultsRecursive(ns, serverListArray, parentServer, calledDepth) {
	// ns.print("---- Calling processScanResultsRecursive @ depth " + calledDepth + " ----"); //DEBUG
	var currentDepth = calledDepth + 1;
	
	var returningTargetInfoArray = [];
	// Loop over all elements of serverListArray
	for (var i = 0; i < serverListArray.length; i++) {
		var currentServerName = serverListArray[i];
	
		// assign it's data to the array we're going to return
		returningTargetInfoArray.push(getTargetInfo(ns, currentServerName, parentServer.name, currentDepth));
		
		// scan for more servers
		var neighboringServerArray = ns.scan(currentServerName);
		// ns.print("== dumping neighboring servers pre-culling ==="); //DEBUG
		// testScanArrayDump(ns, neighboringServerArray); //DEBUG
		
		// remove the parent from the list
		var parentNeighborIndex;
		
		for (var j = 0; j < neighboringServerArray.length; j++) {
			if (neighboringServerArray[j] === parentServer.name) {
				parentNeighborIndex = j;
			}
			// await ns.sleep(100);
		}
		
		// ns.print("parentNeighborIndex: " + parentNeighborIndex); //DEBUG
		var childServerArray = neighboringServerArray;
		childServerArray.splice(parentNeighborIndex, 1);
		
		// ns.print("== dumping childServerArray servers post-culling ==="); //DEBUG
		// testScanArrayDump(ns, childServerArray); //DEBUG
		// ns.print("== childServerArray.length: " + childServerArray.length); //DEBUG
		
		// call process scan results for the children
		var childServerInfoArray;
		
		if (childServerArray.length !== 0) {
			// ns.print("Attempting to call processScanResultsRecursive again"); //DEBUG
			childServerInfoArray = await processScanResultsRecursive(ns, childServerArray, getTargetInfo(ns, currentServerName, parentServer.name, currentDepth), currentDepth);
			// ns.print("childServerInfoArray.length :" + childServerInfoArray.length); //DEBUG
			
			// push all the results from the children into the array
			for (var k = 0; k < childServerInfoArray.length; k++) {
				returningTargetInfoArray.push(childServerInfoArray[k]);
				// await ns.sleep(100);
			}
		}
		else
		{
			// ns.print("== Skipped Recursion ==="); //DEBUG
		}
		
		// await ns.sleep(100);
	}
	
	return returningTargetInfoArray;
}

// ===== TESTS ================
async function executeTests(ns) {
    var serverInfoArray = await buildServerInfoArray(ns);

    if (tests.testEnabled_nameDump) { testNameDump(ns, serverInfoArray); }
	if (tests.testEnabled_nameAndPortsDump) { testNameAndPortsDump(ns, serverInfoArray); }
	if (tests.testEnabled_dataDump) { testDataDump(ns, serverInfoArray); }
	if (tests.testEnabled_testScanArrayDump) { testScanArrayDump(ns, serverInfoArray); }
	if (tests.testEnabled_sortByRequiredHackShowMaxMoney) { test_sortByRequiredHackShowMaxMoney(ns, serverInfoArray); }
}

function testNameDump(ns, serverInfoArray) {
	ns.print("==== TEST: testNameDump ====");
	for (var i=0; i < serverInfoArray.length; i++) {
		ns.print(serverInfoArray[i].name);
	}
} 

function testNameAndPortsDump(ns, serverInfoArray) {
	ns.print("==== TEST: testNameAndPortsDump ====");
	for (var i=0; i < serverInfoArray.length; i++) {
		if(!serverInfoArray[i].isHacknet)
			ns.print("Name: " + serverInfoArray[i].name + "/Ports Needed: " + serverInfoArray[i].numPortsRequired);
	}
}

function testDataDump(ns, serverInfoArray) {
	ns.print("==== TEST: testDataDump ====");
	for (var i=0; i < serverInfoArray.length; i++) {
		if(!serverInfoArray[i].isHacknet)
			ns.print("Name: " + serverInfoArray[i].name + "    /    Parent: " + serverInfoArray[i].parent + "    /    Depth: " + serverInfoArray[i].depth + "    /    Ports Needed: " + serverInfoArray[i].numPortsRequired);
	}
}

function testScanArrayDump(ns, serverListArray) {
	ns.print("==== TEST: testScanArrayDump ====");
	for (var i=0; i < serverListArray.length; i++) {
		ns.print("Index: " + i + "/SeverName: " + serverListArray[i].name);
	}
}

function test_sortByRequiredHackShowMaxMoney(ns, serverListArray) {
	ns.print("==== TEST: test_sortByRequiredHackShowMaxMoney ====");
    
    serverListArray.sort(function(a, b) {
        return a.requiredHackingLevel - b.requiredHackingLevel;
    });

    for (var i=0; i < serverListArray.length; i++) {
		ns.tprint("Index: " + i + " / RequiredHackingLevel: " + serverListArray[i].requiredHackingLevel + " / numPortsRequired: " + serverListArray[i].numPortsRequired + " / MaxMoney: " + ns.nFormat(serverListArray[i].maxMoney, "0,0") + " / SeverName: " + serverListArray[i].name);
	}
}