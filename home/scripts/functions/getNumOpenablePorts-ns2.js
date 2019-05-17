// ========= IMPORTS  ========= 

// ========== ARGS ============ 
var sArgs = {

};

// ========== VARS ============
var sVars = {

};

var tests = {
   
};

// ========== MAIN ============
export async function main(ns) {
	ns.disableLog("ALL");
    
    var hackablePortNumber = getNumOpenablePorts(ns);

    // figure out how many ports I can steal
    // build get the list of servers
    // based on how many ports I can open, use the install and run script    

    ns.print(hackablePortNumber);
}

// ========= FUNCTIONS ========= 
export function getNumOpenablePorts(ns) {
    var numOpenablePorts = 0;
    
    if(ns.fileExists("BruteSSH.exe", "home"))
        numOpenablePorts++;
    if(ns.fileExists("FTPCrack.exe", "home"))
        numOpenablePorts++;
    if(ns.fileExists("relaySMTP.exe", "home"))
        numOpenablePorts++;
    if(ns.fileExists("HTTPWorm.exe", "home"))
        numOpenablePorts++;
    if(ns.fileExists("SQLInject.exe", "home"))
        numOpenablePorts++;
    
    return numOpenablePorts;
}

// =========== TESTS ===========