const fs = require('fs');
const bs58 = require('bs58');
const solanaWeb3 = require('@solana/web3.js');

// IF YOU ARE A NOOB JUST EDIT THIS PART
const stopAfter = 30; // setting this to 0 deactivates the limit
const outputFile = "./output/solana_keys.txt"; // output file for keys
const divisionOutputFile = "./output/solana_divisions.txt"; // output file for divisions
const totalSol = 30; // total amount of Solana to be divided
const minSolPerWallet = 0.8; // minimum SOL per wallet
const maxSolPerWallet = 1.5; // maximum SOL per wallet

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
    fs.appendFileSync(divisionOutputFile, `${solAmount.toFixed(2)}`);
    console.log(`Keys and allocation written to ${outputFile} and ${divisionOutputFile}`);
};

// Generate random allocation between minSolPerWallet and maxSolPerWallet
const getRandomSolAmount = (remainingSol) => {
    const minAllocation = Math.min(minSolPerWallet, remainingSol);
    const maxAllocation = Math.min(maxSolPerWallet, remainingSol);
    return Math.random() * (maxAllocation - minAllocation) + minAllocation;
};

const solKeyGen = async () => {
    console.log('Solana Keypair Generator started.');
    let count = 0;
    let remainingSol = totalSol;
    console.log('Please be patient while the computer generates the keypairs.');

    while ((count < stopAfter) && remainingSol >= minSolPerWallet) {
        const keyPair = solanaWeb3.Keypair.generate();
        const solAmount = getRandomSolAmount(remainingSol);

        remainingSol -= solAmount;
        count++;

        // Store allocation
        walletAllocations.push({ keyPair, solAmount });

        console.log(`[${count}] Generated - Public Key: ${keyPair.publicKey.toString()} - Allocation: ${solAmount.toFixed(2)} SOL`);
        await writeSolKey(keyPair, solAmount);
    }

    // Handle any remaining SOL
    if (remainingSol > 0) {
        console.log(`Distributing remaining SOL of ${remainingSol.toFixed(2)} across wallets.`);

        // Divide remaining SOL equally among all wallets
        const additionalAllocation = remainingSol / walletAllocations.length;
        walletAllocations = walletAllocations.map((wallet) => {
            wallet.solAmount += additionalAllocation;
            return wallet;
        });

        // Rewrite divisionOutputFile with final allocations
        fs.writeFileSync(divisionOutputFile, ""); // Clear file before rewriting

        for (const wallet of walletAllocations) {
            const publicKey = wallet.keyPair.publicKey.toString();
            const solAmount = wallet.solAmount;
            fs.appendFileSync(divisionOutputFile, `${solAmount.toFixed(2)}\n`);
        }

        console.log(`All SOL has been successfully allocated.`);
    } else {
        console.log('All SOL has been allocated.');
    }
};

solKeyGen();
