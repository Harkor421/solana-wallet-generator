const fs = require('fs');
const bs58 = require('bs58');
const solanaWeb3 = require('@solana/web3.js');

// IF YOU ARE A NOOB JUST EDIT THIS PART
const stopAfter = 20; // setting this to 0 deactivates the limit
const outputFile = "./output/solana_keys.txt"; // output file

// FUNCTION PART

// Create output file if it does not exist
if (!fs.existsSync(outputFile)) {
    fs.writeFileSync(outputFile, ""); // Create an empty file if it does not exist
}

// Write key to file
const writeSolKey = async (keyPair) => {
    const publicKey = keyPair.publicKey.toString();
    const secretKey = bs58.encode(keyPair.secretKey);
    const content = `Public Key: ${publicKey}\nPrivate Key: ${secretKey}\n\n`; // Added \n for separation

    fs.appendFileSync(outputFile, content);
    console.log(`Keys written to ${outputFile}`);
}

const solKeyGen = async () => {
    console.log('Solana Keypair Generator started.');
    let count = 0;
    console.log('Please be patient while the computer generates the keypairs.');

    while ((count < stopAfter) || stopAfter === 0) {
        // Generate new keypair
        const keyPair = solanaWeb3.Keypair.generate();

        count++;
        console.log(`[${count}] Generated - Public Key: ${keyPair.publicKey.toString()}`);
        await writeSolKey(keyPair);
    }
};

solKeyGen();
