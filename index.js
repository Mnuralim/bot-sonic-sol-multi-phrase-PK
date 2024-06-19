const {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
} = require('@solana/web3.js')
const bip39 = require('bip39')
const { derivePath } = require('ed25519-hd-key')
const bs58 = require('bs58')
require('dotenv').config()

const DEVNET_URL = 'https://devnet.sonic.game/'
const connection = new Connection(DEVNET_URL, 'confirmed')

async function sendSol(fromKeypair, toPublicKey, amount) {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  )

  const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair])

  console.log('Transaction confirmed with signature:', signature)
}

function generateRandomAddresses(count) {
  const addresses = []
  for (let i = 0; i < count; i++) {
    const keypair = Keypair.generate()
    addresses.push(keypair.publicKey.toString())
  }
  return addresses
}

async function getKeypairFromSeed(seedPhrase) {
  const seed = await bip39.mnemonicToSeed(seedPhrase)
  const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key
  return Keypair.fromSeed(derivedSeed.slice(0, 32))
}

function getKeypairFromPrivateKey(privateKey) {
  const decoded = bs58.decode(privateKey)
  return Keypair.fromSecretKey(decoded)
}

function parseEnvArray(envVar) {
  try {
    return JSON.parse(envVar)
  } catch (e) {
    console.error('Failed to parse environment variable:', envVar, e)
    return []
  }
}

;(async () => {
  const seedPhrases = parseEnvArray(process.env.SEED_PHRASES)
  const privateKeys = parseEnvArray(process.env.PRIVATE_KEYS)

  const keypairs = []

  for (const seedPhrase of seedPhrases) {
    keypairs.push(await getKeypairFromSeed(seedPhrase))
  }

  for (const privateKey of privateKeys) {
    keypairs.push(getKeypairFromPrivateKey(privateKey))
  }

  if (keypairs.length === 0) {
    throw new Error('No valid SEED_PHRASES or PRIVATE_KEYS found in the .env file')
  }

  const randomAddresses = generateRandomAddresses(100)
  console.log('Generated 100 random addresses:', randomAddresses)

  const amountToSend = 0.001
  let currentKeypairIndex = 0

  for (const address of randomAddresses) {
    const toPublicKey = new PublicKey(address)
    try {
      await sendSol(keypairs[currentKeypairIndex], toPublicKey, amountToSend)
      console.log(`Successfully sent ${amountToSend} SOL to ${address}`)
    } catch (error) {
      console.error(`Failed to send SOL to ${address}:`, error)
    }

    currentKeypairIndex = (currentKeypairIndex + 1) % keypairs.length
  }
})()
