const fs = require('fs');
const bs58 = require('bs58');
const solanaWeb3 = require('@solana/web3.js');

// IF YOU ARE A NOOB JUST EDIT THIS PART
const stopAfter = 1; // setting this to 0 deactivates the limit
const outputFile = "./output/solana_keys.txt"; // output file for keys
const divisionOutputFile = "./output/solana_divisions.txt"; // output file for divisions
const totalSol = 20; // total amount of Solana to be divided
const minSolPerWallet = 0.4; // minimum SOL per wallet
const maxSolPerWallet = 0.7; // maximum SOL per wallet

// Create output files if they do not exist
if (!fs.existsSync(outputFile)) {
    fs.writeFileSync(outputFile, ""); // Create an empty file for keys if it does not exist
}
if (!fs.existsSync(divisionOutputFile)) {
    fs.writeFileSync(divisionOutputFile, ""); // Create an empty file for divisions if it does not exist
}

// Store allocations for final adjustment
let walletAllocations = [];

// Write key to file
const writeSolKey = async (keyPair, solAmount) => {
    const publicKey = keyPair.publicKey.toString();
    const secretKey = bs58.encode(keyPair.secretKey);
    const content = `${publicKey}\n${secretKey}\n\n`;

    fs.appendFileSync(outputFile, content);
    const solAmountFormatted = solAmount.toFixed(2).replace('.', ',');
    fs.appendFileSync(divisionOutputFile, `${solAmountFormatted}\n`);
    console.log(`Keys and allocation written to ${outputFile} and ${divisionOutputFile}`);
};

// Generate distinct SOL allocations
const generateUniqueAllocations = (walletsCount, totalSol, minSol, maxSol) => {
    let allocations = new Set();

    while (allocations.size < walletsCount) {
        const amount = Math.random() * (maxSol - minSol) + minSol;
        allocations.add(parseFloat(amount.toFixed(2))); // Round to 2 decimal places for uniqueness
    }

    allocations = Array.from(allocations);
    const totalAllocations = allocations.reduce((sum, amount) => sum + amount, 0);

    // Scale allocations to match totalSol exactly
    const scale = totalSol / totalAllocations;
    return allocations.map(amount => amount * scale);
};

const solKeyGen = async () => {
    console.log('Solana Keypair Generator started.');
    const allocations = generateUniqueAllocations(stopAfter, totalSol, minSolPerWallet, maxSolPerWallet);
    let count = 0;

    for (const solAmount of allocations) {
        const keyPair = solanaWeb3.Keypair.generate();
        walletAllocations.push({ keyPair, solAmount });

        console.log(`[${count + 1}] Generated - Public Key: ${keyPair.publicKey.toString()} - Allocation: ${solAmount.toFixed(2)} SOL`);
        await writeSolKey(keyPair, solAmount);

        count++;
    }

    console.log('All SOL has been allocated uniquely.');
};

solKeyGen();
