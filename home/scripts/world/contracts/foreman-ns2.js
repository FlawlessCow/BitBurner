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
	uniquePathsInAGridII : "Unique Paths in a Grid II",
	sanitizeParenthesesInExpression : "Sanitize Parentheses in Expression",
	findAllValidMathExpressions : "Find All Valid Math Expressions",
};

var e_allowedToSolve = {
	findLargestPrimeFactor : true,
	subarrayWithMaximumSum : true,
	totalWaysToSum : true,
	spiralizeMatrix : true,
	arrayJumpingGame : true,
	mergeOverlappingIntervals : true,
	generateIPAddresses : true,
	algorithmicStockTraderI : true,
	algorithmicStockTraderII : true,
	algorithmicStockTraderIII : true,
	algorithmicStockTraderIV : true,
	minimumPathSumInATriangle : true,
	uniquePathsInAGridI : true,
	uniquePathsInAGridII : true,
	sanitizeParenthesesInExpression : true,
	findAllValidMathExpressions : true,
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
		await async_findContractsAndLaunchSolver(ns);

		await ns.sleep(60*1000);
	}
}

// ===== FUNCTIONS ==============================
async function async_findContractsAndLaunchSolver(ns) {
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
				launchRelevantSolver(ns, contractName, server);
			}
		}
	}
}

function launchRelevantSolver (ns, contractName, server) {
	var contractType = ns.codingcontract.getContractType(contractName, server);

	// buy the right thing
	switch(contractType){
		case e_contractTypes.algorithmicStockTraderI:
			solver_algorithmicStockTraderI(ns, contractName, server);
			break;
		default:
			ns.tprint("No solver for type [" + contractType + "] on server [" + server + "] for contract [" + contractName + "]");
	}
}

function solver_findLargestPrimeFactor(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_subarrayWithMaximumSum(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_totalWaysToSum(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_spiralizeMatrix(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_arrayJumpingGame(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_mergeOverlappingIntervals(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_generateIPAddresses(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_algorithmicStockTraderI(ns, contractName, server) {
	/* ===== Problem Definition ====================================================================================================== **
	You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:
		Ex. 169,81,124,99,97,182,81,176,32,172,135
	Determine the maximum possible profit you can earn using at most one transaction (i.e. you can only buy and sell the stock once).
	If no profit can be made then the answer should be 0. Note that you have to buy the stock before you can sell it
	** =============================================================================================================================== */
	if (e_allowedToSolve.algorithmicStockTraderI) {
		var contractType = ns.codingcontract.getContractType(contractName, server);
		var contractData = ns.codingcontract.getData(contractName, server);
	
		var stockPriceList = contractData;
		var maxBuyIndex = stockPriceList.length - 1;
		var maxSellIndex = stockPriceList.length;
	
		var bestProfit = 0;
	
		for(var buyPriceIndex = 0; buyPriceIndex < maxBuyIndex; buyPriceIndex++) {
			for(var sellPriceIndex = buyPriceIndex + 1; sellPriceIndex < maxSellIndex; sellPriceIndex++) {
				var buyPrice = stockPriceList[buyPriceIndex];
				var sellPrice = stockPriceList[sellPriceIndex];
				var testProfit = sellPrice - buyPrice;
	
				if (testProfit > bestProfit) {
					bestProfit = testProfit;
				}
			}
		}
	
		var result = ns.codingcontract.attempt(bestProfit, contractName, server, {returnReward : true});

		if(result === false || result === "") {
			e_allowedToSolve.algorithmicStockTraderI = false;
			ns.tprint("CONTRACT FAILED: Type: [" + contractType + "], FileName: [" + contractName + "], Server: [" + server + "]");
		}
		else {
			ns.tprint("Completed Completed: Type: [" + contractType + "], fileName: [" + contractName + "], Server [" + server + "]");
			ns.tprint(result);
		}
	}
	else {
		ns.tprint("Solver disabled for type: [" + contractType + "]");
		ns.tprint("There is a contract of this type named [" + contractName + "] on server [" + server + "]");
	}
}

function solver_algorithmicStockTraderII(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_algorithmicStockTraderIII(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_algorithmicStockTraderIV(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_minimumPathSumInATriangle(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_uniquePathsInAGridI(ns, contractName, server) {
	/* ===== Problem Definition ====================================================================================================== **
	You are given an array with two numbers: [m, n]. These numbers represent a
	m x n grid. Assume you are initially positioned in the top-left corner of that
	grid and that you are trying to reach the bottom-right corner. On each step,
	you may only move down or to the right.
	
	Determine how many unique paths there are from start to finish.
	** =============================================================================================================================== */
	

	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_uniquePathsInAGridII(ns, contractName, server) {
	/* ===== Problem Definition ====================================================================================================== **
	You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.

	You are located in the top-left corner of the following grid:
	
	0,0,
	0,0,
	0,1,
	0,1,
	0,0,
	0,0,
	0,0,
	
	You are trying reach the bottom-right corner of the grid, but you can only move down or right on each step. Furthermore, are
	obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.

	Determine how many unique paths there are from start to finish.
	NOTE: The data returned for this contract is an 2D array of numbers representing the grid.
	** =============================================================================================================================== */
	if (e_allowedToSolve.uniquePathsInAGridII) {
		var contractType = ns.codingcontract.getContractType(contractName, server);
		var contractData = ns.codingcontract.getData(contractName, server);
		



		var answer;
		var result = "Solver in testing! Not actually complete!" //ns.codingcontract.attempt(answer, contractName, server, {returnReward : true});

		if(result === false || result === "") {
			e_allowedToSolve.uniquePathsInAGridII = false;
			ns.tprint("CONTRACT FAILED: Type: [" + contractType + "], FileName: [" + contractName + "], Server: [" + server + "]");
		}
		else {
			ns.tprint("Completed Completed: Type: [" + contractType + "], fileName: [" + contractName + "], Server [" + server + "]");
			ns.tprint(result);
		}
	}
	else {
		ns.tprint("Solver disabled for type: [" + contractType + "]");
		ns.tprint("There is a contract of this type named [" + contractName + "] on server [" + server + "]");
	}


	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_sanitizeParenthesesInExpression(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

function solver_findAllValidMathExpressions(ns, contractName, server) {
	ns.tprint("No solver for: " + server + " / " + contractName);
}

// ===== TESTS ==================================
function executeTests(ns) {
	if (tests.testEnabled_exampleFunction)
		test_exampleFunction(ns);
}

function test_exampleFunction(ns) {
	ns.print("==== TEST: test_exampleFunction ====");

}