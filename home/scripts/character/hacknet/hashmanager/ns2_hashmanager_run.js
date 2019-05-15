// ===== IMPORTS ==============


// ===== ARGS =================
var sArgs = {

};

// ===== VARS =================
var sVars = {
	hashReserve : 0,
};

var tests = {
	enabled : false, // Master override for all tests
	disableMain : false, // Disables all non-testing logic in main
	testEnabled_TotalHacknetProductionEnabled : false,
	testEnabled_getTotalHashCapacity : false,
	testEnabled_evaluateMinimumHacknetProduction : false,
	testEnabled_evaluateImporoveStudying : false,
};

var eUpgradeName = {
	sellForMoney : "Sell for Money",
	sellForCorporationFunds : "Sell for Corporation Funds",
	reduceMinimumSecurity : "Reduce Minimum Security",
	increaseMaximumMoney : "Increase Maximum Money",
	improveStudying : "Improve Studying",
	improveGymTraining : "Improve Gym Training",
	exchangeForCorporationResearch : "Exchange for Corporation Research",
	exchangeForBladeburnerRank : "Exchange for Bladeburner Rank",
	exchangeForBladeburnerSkillPpoints : "Exchange for Bladeburner SP",
	generateCodingContract : "Generate Coding Contract",
};

// ===== MAIN =================
export async function main(ns) {
	// Real Logic
	if (!tests.disableMain) {
		ns.disableLog("ALL");
		ns.print("Starting main function");
		var upgradeToBuy = eUpgradeName.sellForMoney;

		while(true) {
			upgradeToBuy = decideWhatToBuy(ns);
			ns.print("Decided to buy: " + upgradeToBuy);
			await buyUpgrade(ns, upgradeToBuy);
			await ns.sleep(100);
		}
	}
	else {
		ns.tprint("WARNING: SCRIPT IS IN TEST ONLY MODE");
	}
	
	// Tests
	if (tests.enabled)
		executeTests(ns);
}

// ===== FUNCTIONS ============
function getTotalHashCapacity(ns) {
	var hashCapacity = 0;
	var nodeCount = ns.hacknet.numNodes();

	for (var i = 0; i < nodeCount; i++) {
		hashCapacity += 64 * Math.pow(2, ns.hacknet.getNodeStats(i).cache - 1);
	}
	
	
	// see how many hacknet nodes we have 
	// see how many cache upgrades we have 
	
	return hashCapacity;
}

function getTotalHacknetHashProduction(ns) {
	var totalHacknetProduction = 0;
	var nodeCount = ns.hacknet.numNodes();
	
	for (var i = 0; i < nodeCount; i++) {
		totalHacknetProduction += ns.hacknet.getNodeStats(i).production;
	}
	
	return totalHacknetProduction;
}

function decideWhatToBuy(ns) {
	var upgradeNameToPurchase = eUpgradeName.sellForMoney; // if nothing else, we'll decide to convert to cash
	
	/* Purchase Priority goals - Go down the list, and do the first thing that is true
		1) Until our hacknet production is @ 1 hash/sec, we want more money (which will get dumped into more production
		2) We should then start spending some on University upgrades 
		Z) Convert to cash (which we defaulted to when declaring the return variable)
	*/
	
	// 1) Until our hacknet production is @ 1 hash/sec, we want more money (which will get dumped into more production
	if (evaluateMinimumHacknetProduction(ns)) {
		upgradeNameToPurchase = eUpgradeName.sellForMoney; 
		return upgradeNameToPurchase;
	}
	
	// 2) We should then start spending some on University upgrades 
	if (evaluateImporoveStudying(ns)) {
		upgradeNameToPurchase = eUpgradeName.improveStudying; 
		return upgradeNameToPurchase;
	}
	
	return upgradeNameToPurchase;
}

async function buyUpgrade(ns, upgradeToBuy) {
	var upgradeHashCost = ns.hacknet.hashCost(upgradeToBuy);
	var desiredHashCount = ns.hacknet.numHashes() + sVars.hashReserve;

	while (desiredHashCount < upgradeHashCost){
		ns.print("Waiting for more hashes (Have: " + ns.nFormat(desiredHashCount, "0,0") + " / Want: " + ns.nFormat(upgradeHashCost, "0,0") + ")");
		await ns.sleep(10000);
		upgradeHashCost = ns.hacknet.hashCost(upgradeToBuy);
		desiredHashCount = ns.hacknet.numHashes() + sVars.hashReserve;
	}
	
	if ((ns.hacknet.numHashes()-sVars.hashReserve) > ns.hacknet.hashCost(upgradeToBuy)) {
		ns.print("Spending hashes on: " + upgradeToBuy);
		ns.hacknet.spendHashes(upgradeToBuy);
	}
}

function evaluateMinimumHacknetProduction(ns) {
	if (getTotalHacknetHashProduction(ns) < 1) {
		return true;
	}
	else {
		return false;
	}
}

function evaluateImporoveStudying(ns) {
	var imporoveStudyingCost = ns.hacknet.hashCost(eUpgradeName.improveStudying);
	var hashCapacity = getTotalHashCapacity(ns);
	var hashCapacityPcnt = 0.50;

	if (imporoveStudyingCost < hashCapacity * hashCapacityPcnt) {
		return true;
	}
	else {
		return false;
	}
}

// ===== TESTS ================
function executeTests(ns) {
	if (tests.testEnabled_TotalHacknetProductionEnabled)
		test_getTotalHacknetHashProduction(ns);
	if (tests.testEnabled_getTotalHashCapacity)
		test_getTotalHashCapacity(ns);
	if (tests.testEnabled_evaluateMinimumHacknetProduction)
		test_evaluateMinimumHacknetProduction(ns);
	if (tests.testEnabled_evaluateImporoveStudying)
		test_evaluateImporoveStudying(ns);
}

function test_getTotalHacknetHashProduction(ns) {
	ns.print("==== TEST: test_getTotalHacknetHashProduction ====");
	var totalHashProduction = getTotalHacknetHashProduction(ns);
	ns.print("Total Hash Production: " + totalHashProduction);
}

function test_getTotalHashCapacity(ns) {
	ns.print("==== TEST: test_getTotalHashCapacity ====");
	var hashCapactiy = getTotalHashCapacity(ns);
	ns.print("hashCapactiy: " + hashCapactiy);
}

function test_evaluateMinimumHacknetProduction(ns) {
	ns.print("==== TEST: test_evaluateMinimumHacknetProduction ====");
	var resultOfEvaluation = evaluateMinimumHacknetProduction(ns);
	ns.print("resultOfEvaluation: " + resultOfEvaluation);
}

function test_evaluateImporoveStudying(ns) {
	ns.print("==== TEST: test_evaluateImporoveStudying ====");
	
	var imporoveStudyingCost = ns.hacknet.hashCost(eUpgradeName.improveStudying);
	ns.print("imporoveStudyingCost: " + imporoveStudyingCost);
	
	var hashCapacity = getTotalHashCapacity(ns);
	ns.print("hashCapacity: " + hashCapacity);	
	
	var resultOfEvaluation = evaluateImporoveStudying(ns);
	ns.print("resultOfEvaluation: " + resultOfEvaluation);
}

// ===== REFERENCE ============
/* Function Reference
numHashes()
hashCost(upgName)
spendHashes(upgName, upgTarget)
*/

/* Hash Upgrade Table
Sell for Money							Base Cost: 4.000		Sell hashes for $1m
Sell for Corporation Funds				Base Cost: 100.000		Sell hashes for $1b in Corporation funds
Reduce Minimum Security					Base Cost: 50.000		Use hashes to decrease the minimum security of a single server by 2%. Note that a server's minimum security cannot go below 1.
Increase Maximum Money					Base Cost: 50.000		Use hashes to increase the maximum amount of money on a single server by 2%
Improve Studying						Base Cost: 100.000		Use hashes to improve the experience earned when studying at a university by 20%. This effect persists until you install Augmentations
Improve Gym Training					Base Cost: 50.000		Use hashes to improve the experience earned when training at the gym by 20%. This effect persists until you install Augmentations
Exchange for Corporation Research		Base Cost: 200.000		Exchange hashes for 1k Scientific Research in all of your Corporation's Industries
Exchange for Bladeburner Rank			Base Cost: 250.000		Exchange hashes for 100 Bladeburner Rank
Exchange for Bladeburner SP				Base Cost: 250.000		Exchanges hashes for 10 Bladeburner Skill Points
Generate Coding Contract				Base Cost: 200.000		Generate a random Coding Contract somewhere on the network
*/