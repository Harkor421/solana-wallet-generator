const fs = require('fs');
const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const bs58 = require('bs58');

// Configuration
const FILE_PATH = './output/wallets.txt'; // Path to your text file with wallet public/private key pairs
const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=23150a1e-f265-475f-b9e7-1d39d2ff422f'; // Your node URL

// Initialize connection to Solana
const connection = new Connection(RPC_URL, 'confirmed');

// Function to fetch SOL balance of a wallet
async function getSolBalance(wallet) {
  try {
    const publicKey = new PublicKey(wallet);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error(`Failed to fetch balance for wallet ${wallet}:`, error.message);
    return null;
  }
}

// Function to send SOL from one wallet to another
async function transferSol(fromPrivateKey, toWallet, amount) {
  try {
    // Create sender Keypair from private key
    const sender = Keypair.fromSecretKey(fromPrivateKey);

    const recipient = new PublicKey(toWallet);

    // Check if the sender has enough balance to cover the transaction amount + transaction fee
    const senderBalance = await connection.getBalance(sender.publicKey);
    const transactionFee = 5000; // Estimated fee (adjustable)

    // Check if sender balance is enough to cover the transaction fee and desired transfer amount


    // Subtract the transaction fee to get the actual transfer amount
    const transferAmount = amount * 1e9 - transactionFee; // Amount to send in lamports

    // Ensure the transfer amount is not negative
    if (transferAmount <= 0) {
      console.error('Insufficient funds to transfer after subtracting fee.');
      return;
    }

    // Create a transaction to send SOL from sender to recipient
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: recipient,
        lamports: transferAmount, // Transfer the calculated amount in lamports
      })
    );

    // Sign and send the transaction
    const signature = await connection.sendTransaction(transaction, [sender]);

    // Confirm the transaction
    await connection.confirmTransaction(signature);
    console.log(`Transferred ${transferAmount / 1e9} SOL from ${sender.publicKey.toBase58()} to ${toWallet}`);
  } catch (error) {
    console.error(`Failed to transfer SOL from wallet ${fromPrivateKey.toString('base64')}:`, error.message);
  }
}

// Function to add a delay (in milliseconds)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to process wallets and perform the transfer
async function fetchBalancesAndTransfer() {
  try {
    // Read file and split by newlines
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    const walletLines = data.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);

    // Loop over wallets
    for (let i = 0; i < walletLines.length; i += 2) {
      const publicKey = walletLines[i];
      const privateKey = walletLines[i + 1];

      // Convert private key from base58 string to Uint8Array
      const privateKeyBuffer = bs58.decode(privateKey); // Decode the private key from base58 format

      // Fetch the SOL balance for the wallet
      const balance = await getSolBalance(publicKey);
      if (balance !== null) {
        console.log(`Wallet: ${publicKey}, Balance: ${balance.toFixed(4)} SOL`);
      }

      // Transfer all balance to a single wallet (replace with your target wallet)
      const targetWallet = '4ypyAV3aaEMgGrKzdHxXMEWjokvSBTWLWEdFxmAbBJYm'; // Replace with the address you want to transfer to
      await transferSol(privateKeyBuffer, targetWallet, balance); // Transfer all balance to target wallet

      // Wait for a brief moment (to limit the number of requests to 10 per second)
      if ((i / 2 + 1) % 10 === 0) {
        console.log('Rate limit: waiting for 100ms...');
        await delay(100); // Wait for 100ms after every 10 requests
      }
    }
  } catch (error) {
    console.error('Error processing wallets file:', error.message);
  }
}

// Run the script
fetchBalancesAndTransfer();
