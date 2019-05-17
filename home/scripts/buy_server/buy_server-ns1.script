// TODO
// add validation that desiredRam is a power of 2
// protect against scripts failing to install/launch on the new server
// write out info to a log file?

// args
var hackTarget = args[0];
var desiredRam = args[1];
var availableCashMod = 0.70;
var ramIncreaseFactor = 16;
var setupScriptName = "/scripts/hacking/basic/install_and_run.script";

if(desiredRam > getPurchasedServerMaxRam()) {
	tprint("buy_server.script: desiredRam (args[1]) exceeds getPurchasedServerMaxRam. Exiting.");
	exit();
}

// loop to buy initial round of servers
// while: server count < max servers
print("DEBUG: server count:" + getPurchasedServers().length);
print("DEBUG: server limit:" + getPurchasedServerLimit());
while(getPurchasedServers().length < getPurchasedServerLimit())
{
    print("DEBUG: Buying at " + desiredRam +"GB");
    
    // wait to have enough money to buy
    if(getServerMoneyAvailable("home") > getPurchasedServerCost(desiredRam))
    {
        // create a server name
        var servName = "pserv-" + desiredRam + "GB";
        
        // buy a server
        var hostname = purchaseServer(servName, desiredRam);
        
        // copy and run script
        run(setupScriptName, 1, hostname, hackTarget);
    }
}

//increase the desireRam count as a one off
desiredRam = desiredRam*ramIncreaseFactor;

// loop to upgrade servers
while (desiredRam <= getPurchasedServerMaxRam())
{
    print("DEBUG: Buying at " + desiredRam +"GB");
    
    // call get purchased servers
    var purchasedServers = getPurchasedServers();
    
    for (var servIndex = 0; servIndex < purchasedServers.length; servIndex++)
    {
        var oldHostname = purchasedServers[servIndex];
        print("DEBUG: Evaluating: " + oldHostname);
        
        if(getServerRam(oldHostname)[0] < desiredRam)
        {
            while(getServerMoneyAvailable("home")*availableCashMod < getPurchasedServerCost(desiredRam))
            {
                print("DEBUG: Not enough money! Have/Need:" + Math.floor(getServerMoneyAvailable("home")) + "/" + getPurchasedServerCost(desiredRam));
                sleep(60*1000);
            }
            
            // kill all scripts on the old server
            print("DEBUG: Killing all scripts on: " + oldHostname);
            killall(oldHostname);
            sleep(10000);
            
            // delete the old server
            print("DEBUG: Deleting: " + oldHostname);
            deleteServer(oldHostname);
            
            // buy a server
            var servName = "pserv-" + desiredRam + "GB";
            var newHostname = purchaseServer(servName, desiredRam);
            print("DEBUG: New server named: " + newHostname);
            
            // copy and run scripts
            run(setupScriptName, 1, newHostname, hackTarget);
        }
    }
    
    // increase ram for the next loop
    desiredRam = desiredRam*ramIncreaseFactor;
    
}


// Useful functions:
// ==================
// getPurchasedServers - array of servers that you won
// getPurchasedServerLimit - max number of servers you can purchase
// getPurchasedServerCost - cost of a server based on a RAM amount
// getPurchasedServerMaxRam - max ram you can purchse
// purchaseServer(name, RAM) - buys a server with the specified RAM
// getServerRam - returns max ram, used ram
// getServerMoneyAvailable("home")
// ==================