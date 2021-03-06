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
	nodeCountLimit: 24,
	nodeLevelLimit: 200,
	nodeRamLimit: 64,
	nodeCoresLimit: 16,
	recoupTimeCap: 6*60*60, // 6 hours in seconds
};

var buy = {
	nothing: -1,
	node: 0,
	level: 1,
	ram: 2,
	cores: 3,
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
	ns.print("Starting main function");
	ns.disableLog("getServerMoneyAvailable");
	ns.disableLog("sleep");

	var done = false;
	var thingToBuy = buy.nothing;
	var playerMultipliers = ns.getHacknetMultipliers();
	var nodeCost = ns.hacknet.getPurchaseNodeCost();

	// I bet this script will break horribly if I don't have at least one node to start off with
	if (ns.hacknet.numNodes() === 0) {
		ns.print("Buying the first node");
		nodeCost = ns.hacknet.getPurchaseNodeCost();

		ns.print("Waiting for more money to buy a node!");

		// Wait for enough money
		await wallet.async_waitForEnoughMoney(ns, wallet.spendLimits.hacknet, nodeCost);
		
		// Buy the node
		ns.hacknet.purchaseNode();
	}

	await upgradeAllToMatchBaseNodeAsync(ns);

	while (!done) {
		// check to see what to buy
		thingToBuy = evaluateHacknetPurchaseOptions(ns, sVars.nodeCountLimit, sVars.nodeLevelLimit, sVars.nodeRamLimit, sVars.nodeCoresLimit, playerMultipliers, sVars.recoupTimeCap);

		// buy the right thing
		switch(thingToBuy){
			case buy.node:
				nodeCost = ns.hacknet.getPurchaseNodeCost();

				ns.print("Waiting for more money to buy a node!");
				
				// Wait for enough money
				await wallet.async_waitForEnoughMoney(ns, wallet.spendLimits.hacknet, nodeCost);

				ns.print("Buying a node");
				await purchaseAndUpgradeNode(ns);
				break;
			case buy.level:
				ns.print("Upgrading LEVELS of all nodes");
				await upgradeAllHacknetNodeLevelAsync(ns);
				break;
			case buy.ram:
				ns.print("Upgrading RAM of all nodes");
				await upgradeAllHacknetNodeRamAsync(ns);
				break;
			case buy.cores:
				ns.print("Upgrading CORES of all nodes");
				await upgradeAllHacknetNodeCoresAsync(ns);
				break;
			case buy.nothing:
				done = true;
				break;
		}
		
		await ns.sleep(1000);
	}
}

// ===== FUNCTIONS ==============================
function getHacknetNodeProduction(level, ram, cores, playerMultipliers) {
    var baseProduction = 1.6;
    var ramModifier = Math.pow(1.035, ram-1);
    var coresModifier = (cores + 5) / 6;
    var playerModifier = playerMultipliers.production;

    return baseProduction * level * ramModifier * coresModifier * playerModifier;
}

function getCostToReachLevelFromScratch (desiredLevel, playerMultipliers) { 
	// Note: I think this formula might be off, but it's close enough
	var baseCost = 520;
	var increasePerLevel = 1.04;
	var playerLevelCostModifier = playerMultipliers.levelCost;
	var totalCostForDesiredLevel = 0;

	for(var intermediateLevel = 1; intermediateLevel < desiredLevel; intermediateLevel++) {
		totalCostForDesiredLevel += baseCost * Math.pow(increasePerLevel, intermediateLevel-1) * playerLevelCostModifier;
	}

	return totalCostForDesiredLevel;
}

function getCostToReachRamFromScratch (desiredRam, playerMultipliers) {
	// Note: I think this formula might be off, but it's close enough
	var desiredRamLevel = (Math.log(desiredRam)/Math.log(2)) + 1;
	var baseCost = 30000;
	var increasePerRamLevel = 2.56;
	var playerRamCostModifier = playerMultipliers.ramCost;
	var totalCostForDesiredRamLevel = 0;

	for(var intermediateRamLevel = 1; intermediateRamLevel < desiredRamLevel; intermediateRamLevel++) {
		totalCostForDesiredRamLevel += baseCost * Math.pow(increasePerRamLevel, intermediateRamLevel-1) * playerRamCostModifier;
	}

	return totalCostForDesiredRamLevel;
}

function getCostToReachCoresFromScratch (desiredCores, playerMultipliers) {
	// Note: I think this formula might be off, but it's close enough
	var baseCost = 500000;
	var increasePerCore = 1.48;
	var playerCoresCostModifier = playerMultipliers.coreCost;
	var totalCostForDesiredCores = 0;

	for(var intermediateCores = 1; intermediateCores < desiredCores; intermediateCores++) {
		totalCostForDesiredCores += baseCost * Math.pow(increasePerCore, intermediateCores-1) * playerCoresCostModifier;
	}

	return totalCostForDesiredCores;
}

function getLowestLevelHacknetNodeStats(ns) {
    ns.print("Finding node with lowest level");
    var lowestLevelNodeStats = ns.hacknet.getNodeStats(0);

    for (var i = 0; i < ns.hacknet.numNodes(); i++) {
        var thisNodesStats = ns.hacknet.getNodeStats(i);

        if (thisNodesStats.level < lowestLevelNodeStats.level) {
            lowestLevelNodeStats = thisNodesStats;
        }
    }

    return lowestLevelNodeStats;
}

function getLowestRamHacknetNodeStats(ns) {
	ns.print("Finding node with lowest ram");
    var lowestRamNodeStats = ns.hacknet.getNodeStats(0);

    for (var i = 0; i < ns.hacknet.numNodes(); i++) {
        var thisNodesStats = ns.hacknet.getNodeStats(i);

        if (thisNodesStats.ram < lowestRamNodeStats.ram) {
            lowestRamNodeStats = thisNodesStats;
        }
    }

    return lowestRamNodeStats;
}

function getLowestCoresHacknetNodeStats(ns) {
    ns.print("Finding node with lowest cores");
    var lowestCoresNodeStats = ns.hacknet.getNodeStats(0);

    for (var i = 0; i < ns.hacknet.numNodes(); i++) {
        var thisNodesStats = ns.hacknet.getNodeStats(i);

        if (thisNodesStats.cores < lowestCoresNodeStats.cores) {
            lowestCoresNodeStats = thisNodesStats;
        }
    }

    return lowestCoresNodeStats;
}

function getAllLowestHacknetNodeStats(ns) {
	ns.print("Scanning thru all nodes to find ones with the lowest of each stat");
    var allLowestNodeStats = {
		lowestLevelNodeStats : ns.hacknet.getNodeStats(0),
		lowestRamNodeStats : ns.hacknet.getNodeStats(0),
		lowestCoresNodeStats : ns.hacknet.getNodeStats(0),
	};
	allLowestNodeStats.lowestLevelNodeStats.nodeIndex = 0;
	allLowestNodeStats.lowestRamNodeStats.nodeIndex = 0;
	allLowestNodeStats.lowestCoresNodeStats.nodeIndex = 0;

    for (var i = 0; i < ns.hacknet.numNodes(); i++) {
		ns.print("Evaluating if node " + i + " is lowest stat for anything");
        var thisNodesStats = ns.hacknet.getNodeStats(i);

        if (thisNodesStats.cores < allLowestNodeStats.lowestLevelNodeStats.cores) {
            allLowestNodeStats.lowestLevelNodeStats = thisNodesStats;
			allLowestNodeStats.lowestLevelNodeStats.nodeIndex = i;
        }
		
        if (thisNodesStats.cores < allLowestNodeStats.lowestRamNodeStats.cores) {
            allLowestNodeStats.lowestRamNodeStats = thisNodesStats;
			allLowestNodeStats.lowestRamNodeStats.nodeIndex = i;
        }
		
        if (thisNodesStats.cores < allLowestNodeStats.lowestCoresNodeStats.cores) {
            allLowestNodeStats.lowestCoresNodeStats = thisNodesStats;
			allLowestNodeStats.lowestCoresNodeStats.nodeIndex = i;
        }
    }

    return allLowestNodeStats;
}

function evaluateHacknetPurchaseOptions(ns, maxNodes, maxLevel, maxRam, maxCores, playerMultipliers, recoupTimeCap) {
    ns.print("Evaluationg what to buy...");
	// we're just going to go off the first node, assuming all others are updgraded
	var currentNodeCount = ns.hacknet.numNodes();
	var baseNodeIndex = 0;
	var allLowestHacknetNodeStats = getAllLowestHacknetNodeStats(ns);
	var lowestLevelNodeStats = allLowestHacknetNodeStats.lowestLevelNodeStats;
	var lowestRamNodeStats = allLowestHacknetNodeStats.lowestRamNodeStats;
	var lowestCoresNodeStats = allLowestHacknetNodeStats.lowestCoresNodeStats;
	var newNodeCost = ns.hacknet.getPurchaseNodeCost();
	    
	// the math to truely evaluate a new node would be a PITA so instead,
	// if we aren't at the max, and it's cheaper than the cost to upgrade
	// the 1st node we just say fuck it and buy a new node
    if (currentNodeCount < maxNodes) {
		ns.print("Checking to see if buying a node is cheaper than anything else");
		if ( newNodeCost < ns.hacknet.getLevelUpgradeCost(baseNodeIndex, 1) &&
			newNodeCost < ns.hacknet.getRamUpgradeCost(baseNodeIndex, 1) &&
			newNodeCost < ns.hacknet.getCoreUpgradeCost(baseNodeIndex, 1)
		) {
            ns.print("Choosing to buy a node");
			return buy.node;
		}
	}
	
	// get the recoup time of buying a node w/o upgrading it
	var bareNodeRecoupTime = getBareNodeRecoupTime(ns, maxNodes, playerMultipliers);	
	
	// get the recoup time of buying a node and upgrading it to match node zero
    var upgradedNodeRecoupTime = getUpgradedNodeRecoupTime(ns, maxNodes, playerMultipliers);
	
	// get the recoup time of buying a level
	var levelRecoupTime = getLevelRecoupTime(ns, lowestLevelNodeStats, maxLevel, playerMultipliers);
	
	// get the recoup time of buying RAM
    var ramRecoupTime = getRamRecoupTime(ns, lowestRamNodeStats, maxRam, playerMultipliers);
	
	// get the recoup time of buying a core
	var coresRecoupTime = getCoresRecoupTime(ns, lowestCoresNodeStats, maxCores, playerMultipliers);
	
	// Do comparisons to see what to buy
	ns.print("=========================== Ready to make a decision ===========================");
	ns.print("--- maxRecoupTime:" + ns.nFormat(sVars.recoupTimeCap, "0,0") + " seconds (" + ns.nFormat(sVars.recoupTimeCap/60, "0,0") + " minutes)");
	ns.print("--------------------------------------------------------------------------------");
	ns.print("Getting the minimum of: ");
	ns.print("--- bareNodeRecoupTime:" + ns.nFormat(bareNodeRecoupTime, "0,0") + " seconds (" + ns.nFormat(bareNodeRecoupTime/60, "0,0") + " minutes)");
	ns.print("--- upgradedNodeRecoupTime:" + ns.nFormat(upgradedNodeRecoupTime, "0,0") + " seconds (" + ns.nFormat(upgradedNodeRecoupTime/60, "0,0") + " minutes)");
	ns.print("--- levelRecoupTime:" + ns.nFormat(levelRecoupTime, "0,0") + " seconds (" + ns.nFormat(levelRecoupTime/60, "0,0") + " minutes)");
	ns.print("--- ramRecoupTime:" + ns.nFormat(ramRecoupTime, "0,0") + " seconds (" + ns.nFormat(ramRecoupTime/60, "0,0") + " minutes)");
	ns.print("--- coresRecoupTime:" + ns.nFormat(coresRecoupTime, "0,0") + " seconds (" + ns.nFormat(coresRecoupTime/60, "0,0") + " minutes)");
	ns.print("================================================================================");

	var minRecoupTime = Math.min(bareNodeRecoupTime, upgradedNodeRecoupTime, levelRecoupTime, ramRecoupTime, coresRecoupTime);
	
	if (bareNodeRecoupTime === minRecoupTime && bareNodeRecoupTime < recoupTimeCap)
	{
        ns.print("Choosing to buy a node");
        return buy.node;
	}	
	else if (upgradedNodeRecoupTime === minRecoupTime && upgradedNodeRecoupTime < recoupTimeCap)
	{
        ns.print("Choosing to buy a node");
        return buy.node;
	}	
    else if (levelRecoupTime === minRecoupTime && levelRecoupTime < recoupTimeCap)
    {
        ns.print("Choosing to buy a level");
        return buy.level;
    }
    else if (ramRecoupTime === minRecoupTime && ramRecoupTime < recoupTimeCap)
    {
        ns.print("Choosing to buy ram");
        return buy.ram;
    }
    else if (coresRecoupTime === minRecoupTime && coresRecoupTime < recoupTimeCap)
    {
        ns.print("Choosing to buy cores");
        return buy.cores;
    }
    
    return buy.nothing;
}

function getBareNodeRecoupTime(ns, maxNodes, playerMultipliers) {
	var bareNodeRecoupTime = Number.MAX_VALUE;
	var newNodeCost = ns.hacknet.getPurchaseNodeCost();
	var currentNodeCount = ns.hacknet.numNodes();
	
    if (currentNodeCount < maxNodes) {
		ns.print("=== Determining bareNodeRecoupTime ===");
		
		var bareNodeProduction = getHacknetNodeProduction(1, 1, 1, playerMultipliers);
		ns.print("bareNodeProduction: " + bareNodeProduction);
		
		ns.print("newNodeCost: " + newNodeCost);
		
		bareNodeRecoupTime = newNodeCost/bareNodeProduction;
		ns.print("bareNodeRecoupTime: " + bareNodeRecoupTime);
	}
	
	return bareNodeRecoupTime;
}

function  getUpgradedNodeRecoupTime(ns, maxNodes, playerMultipliers) {
	var upgradedNodeRecoupTime = Number.MAX_VALUE;
	var newNodeCost = ns.hacknet.getPurchaseNodeCost();
	var currentNodeCount = ns.hacknet.numNodes();
	var baseNodeIndex = 0;
	var baseNodeStats = ns.hacknet.getNodeStats(baseNodeIndex);
	
    if (currentNodeCount < maxNodes) {
		ns.print("=== Determining upgradedNodeRecoupTime ===");
		
		var upgradedNodeProduction = baseNodeStats.production;
		ns.print("upgradedNodeProduction/baseNodeProduction: " + upgradedNodeProduction);
		
		ns.print("newNodeCost: " + newNodeCost);
		
		var levelUpgradeCost = getCostToReachLevelFromScratch(baseNodeStats.level, playerMultipliers);
		ns.print("levelUpgradeCost: " + levelUpgradeCost);
		
		var ramUpgradeCost = getCostToReachRamFromScratch(baseNodeStats.ram, playerMultipliers);
		ns.print("ramUpgradeCost: " + ramUpgradeCost);
		
		var coresUpgradeCost = getCostToReachCoresFromScratch(baseNodeStats.cores, playerMultipliers);
		ns.print("coresUpgradeCost: " + coresUpgradeCost);
		
		var upgradedNodeTotalCost = newNodeCost + levelUpgradeCost + ramUpgradeCost + coresUpgradeCost;
		ns.print("upgradedNodeTotalCost: " + upgradedNodeTotalCost);
		
		upgradedNodeRecoupTime = upgradedNodeTotalCost/upgradedNodeProduction;
		ns.print("upgradedNodeRecoupTime: " + upgradedNodeRecoupTime);
		
	}
	
	return upgradedNodeRecoupTime;
}

function  getLevelRecoupTime(ns, lowestLevelNodeStats, maxLevel, playerMultipliers) {
	var levelRecoupTime = Number.MAX_VALUE;
	
    if (lowestLevelNodeStats.level < maxLevel) {
		ns.print("=== Determining levelRecoupTime ===");
		
		ns.print("lowestLevelNodeStats.production: " + lowestLevelNodeStats.production);
	
        var nextLevelProduction = getHacknetNodeProduction(lowestLevelNodeStats.level+1, lowestLevelNodeStats.ram, lowestLevelNodeStats.cores, playerMultipliers);
        ns.print("nextLevelProduction: " + nextLevelProduction);
        
        var nextLevelProductionDelta = nextLevelProduction - lowestLevelNodeStats.production;
        ns.print("nextLevelProductionDelta: " + nextLevelProductionDelta);
        
		var nextLevelCost = ns.hacknet.getLevelUpgradeCost(lowestLevelNodeStats.nodeIndex, 1);
        ns.print("nextLevelCost: " + nextLevelCost);
        
		levelRecoupTime = nextLevelCost/nextLevelProductionDelta;
		ns.print("levelRecoupTime:" + levelRecoupTime);
	}
	
	return levelRecoupTime;
}

function  getRamRecoupTime(ns, lowestRamNodeStats, maxRam, playerMultipliers) {
	var ramRecoupTime = Number.MAX_VALUE;
	
    if (lowestRamNodeStats.ram < maxRam) {
		ns.print("=== Determining ramRecoupTime ===");
		ns.print("lowestRamNodeStats.production: " + lowestRamNodeStats.production);
	
        var nextRamProduction = getHacknetNodeProduction(lowestRamNodeStats.level, lowestRamNodeStats.ram+1, lowestRamNodeStats.cores, playerMultipliers);
        ns.print("nextRamProduction: " + nextRamProduction);
        
        var nextRamProductionDelta = nextRamProduction - lowestRamNodeStats.production;
        ns.print("nextRamProductionDelta: " + nextRamProductionDelta);
        
		var nextRamCost = ns.hacknet.getRamUpgradeCost(lowestRamNodeStats.nodeIndex, 1);
        ns.print("nextRamCost: " + nextRamCost);
        
		ramRecoupTime = nextRamCost/nextRamProductionDelta;
		ns.print("ramRecoupTime:" + ramRecoupTime);
	}
	
	return ramRecoupTime;
}

function  getCoresRecoupTime(ns, lowestCoresNodeStats, maxCores, playerMultipliers) {
	var coresRecoupTime = Number.MAX_VALUE;
	
    if (lowestCoresNodeStats.cores < maxCores) {
		ns.print("=== Determining coresRecoupTime ===");
		
		ns.print("lowestCoresNodeStats.production: " + lowestCoresNodeStats.production);
		ns.print("lowestCoresNodeStats.level: " + lowestCoresNodeStats.level);
		ns.print("lowestCoresNodeStats.ram: " + lowestCoresNodeStats.ram);
		ns.print("lowestCoresNodeStats.cores: " + lowestCoresNodeStats.cores);
		
        var nextCoreProduction = getHacknetNodeProduction(lowestCoresNodeStats.level, lowestCoresNodeStats.ram, lowestCoresNodeStats.cores+1, playerMultipliers);
        ns.print("nextCoreProduction: " + nextCoreProduction);
        
		var nextCoreProductionDelta = nextCoreProduction - lowestCoresNodeStats.production;
        ns.print("nextCoreProductionDelta: " + nextCoreProductionDelta);
        
		var nextCoreCost = ns.hacknet.getCoreUpgradeCost(lowestCoresNodeStats.nodeIndex, 1);
        ns.print("nextCoreCost: " + nextCoreCost);
		
		coresRecoupTime = nextCoreCost/nextCoreProductionDelta;
		ns.print("coresRecoupTime:" + coresRecoupTime);
	}
	
	return coresRecoupTime;
}

async function upgradeAllHacknetNodeLevelAsync(ns) {
    // we're keying desired amount off of the starting node
    var desiredLevel = ns.hacknet.getNodeStats(0).level + 1;
    
    // iterate thru all of our hacknet nodes
    for (var i = 0; i < ns.hacknet.numNodes(); i++) {
        await upgradeNodeToDesiredLevelAsync(ns, i, desiredLevel);
    }
}

async function upgradeAllHacknetNodeRamAsync(ns) {
    // we're keying desired amount off of the starting node
    var desiredRam = ns.hacknet.getNodeStats(0).ram + 1;
    
    // iterate thru all of our hacknet nodes
    for (var i = 0; i < ns.hacknet.numNodes(); i++) {
        await upgradeNodeToDesiredRamAsync(ns, i, desiredRam);
    }
}

async function upgradeAllHacknetNodeCoresAsync(ns) {
    // we're keying desired amount off of the starting cores
    var desiredCores = ns.hacknet.getNodeStats(0).cores + 1;
    
    // iterate thru all of our hacknet cores
    for (var i = 0; i < ns.hacknet.numNodes(); i++) {
        await upgradeNodeToDesiredCoresAsync(ns, i, desiredCores);
    }
}

async function upgradeNodeToDesiredLevelAsync(ns, nodeIndex, desiredLevel) {
    // Keep going until we hit the desired level
    while (ns.hacknet.getNodeStats(nodeIndex).level < desiredLevel) {
        var cost = ns.hacknet.getLevelUpgradeCost(nodeIndex, 1);
        
        // Wait to have enough money to buy the next level
		ns.print("Waiting for more money to buy a level");

		await wallet.async_waitForEnoughMoney(ns, wallet.spendLimits.hacknet, cost);
        
        ns.hacknet.upgradeLevel(nodeIndex, 1);
    }
}

async function upgradeNodeToDesiredRamAsync(ns, nodeIndex, desiredRam) {
    // Keep going until we hit the desired ram
    while (ns.hacknet.getNodeStats(nodeIndex).ram < desiredRam) {
        var cost = ns.hacknet.getRamUpgradeCost(nodeIndex, 1);
        
        // Wait to have enough money to buy the next ram
		ns.print("Waiting for more money to buy a RAM");
		
		await wallet.async_waitForEnoughMoney(ns, wallet.spendLimits.hacknet, cost);
        
        ns.hacknet.upgradeRam(nodeIndex, 1);
    }
}

async function upgradeNodeToDesiredCoresAsync(ns, nodeIndex, desiredCores) {
    // Keep going until we hit the desired cores
    while (ns.hacknet.getNodeStats(nodeIndex).cores < desiredCores) {
        var cost = ns.hacknet.getCoreUpgradeCost(nodeIndex, 1);
        
        // Wait to have enough money to buy the next cores
		ns.print("Waiting for more money to buy a core");

		await wallet.async_waitForEnoughMoney(ns, wallet.spendLimits.hacknet, cost);
        
        ns.hacknet.upgradeCore(nodeIndex, 1);
    }
}

async function purchaseAndUpgradeNode(ns) {
    // buy a new node and get it's stats
    var newNodeIndex = ns.hacknet.purchaseNode();
    
    // get stats for node 0, which should have the latest upgrades
    var baseNodeStats = ns.hacknet.getNodeStats(0);
    
    var desiredLevel = baseNodeStats.level;
    var desiredRam = baseNodeStats.ram;
    var desiredCores = baseNodeStats.cores;
    
    await upgradeNodeToDesiredLevelAsync(ns, newNodeIndex, desiredLevel);
    await upgradeNodeToDesiredRamAsync(ns, newNodeIndex, desiredRam);
    await upgradeNodeToDesiredCoresAsync(ns, newNodeIndex, desiredCores);
}

async function upgradeAllToMatchBaseNodeAsync(ns) {
    var baseNodeStats = ns.hacknet.getNodeStats(0);
    
    var desiredLevel = baseNodeStats.level;
    var desiredRam = baseNodeStats.ram;
    var desiredCores = baseNodeStats.cores;
    
    // // iterate thru all of our hacknet cores
	for (var nodeIndex = 0; nodeIndex < ns.hacknet.numNodes(); nodeIndex++) {
		ns.print("Bringing node " + nodeIndex + " up to spec with base node");
		await upgradeNodeToDesiredLevelAsync(ns, nodeIndex, desiredLevel);
		await upgradeNodeToDesiredRamAsync(ns, nodeIndex, desiredRam);
		await upgradeNodeToDesiredCoresAsync(ns, nodeIndex, desiredCores);
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