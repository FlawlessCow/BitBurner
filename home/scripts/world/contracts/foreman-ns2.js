// ===== IMPORTS ================================
import * as bsi from "/master/functions/buildServerInfoArray-ns2.js";

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

var e_contractTypes = {
	findLargestPrimeFactor : "Find Largest Prime Factor",
	subarrayWithMaximumSum : "Subarray with Maximum Sum",
	totalWaysToSum : "Total Ways to Sum",
	spiralizeMatrix : "Spiralize Matrix",
	arrayJumpingGame : "Array Jumping Game",
	mergeOverlappingIntervals : "Merge Overlapping Intervals",
	generateIPAddresses : "Generate IP Addresses",
	algorithmicStockTraderI : "Algorithmic Stock Trader I",
	algorithmicStockTraderII : "Algorithmic Stock Trader II",
	algorithmicStockTraderIII : "Algorithmic Stock Trader III",
	algorithmicStockTraderIV : "Algorithmic Stock Trader IV",
	minimumPathSumInATriangle : "Minimum Path Sum in a Triangle",
	uniquePathsInAGridI : "Unique Paths in a Grid I",
	uniquePathsInAGridI : "Unique Paths in a Grid II",
	sanitizeParenthesesInExpression : "Sanitize Parentheses in Expression",
	findAllValidMathExpressions : "Find All Valid Math Expressions",
}

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
		await async_reportContracts(ns);

		await ns.sleep(60*1000);
	}
}

// ===== FUNCTIONS ==============================
async function async_reportContracts(ns) {
	// Build a server list
	var serverListArray = await bsi.buildServerInfoArray(ns);
	
	// Iterate thru the list of servers
	for(var i=0; i<serverListArray.length; i++) {
		var server = serverListArray[i].name;

		// Do an ls() on the server
		var lsResults = ns.ls(server, ".cct");

		// If there are results matching the contract extension, spit info out to the terminal window
		if(lsResults.length > 0) {
			for(var j=0; j<lsResults.length; j++) {
				var contractName = lsResults[j];
				var contractType = ns.codingcontract.getContractType(contractName, server);
				ns.tprint("Server: " + server + " / Contract: " + contractName + " / Contract Type: " + contractType);
			}
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