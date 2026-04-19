const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const { ethers } = require('ethers');

const prisma = require('../config/db');

const deploymentPath = path.resolve(
  __dirname,
  '../../../blockchain/deployments/mumbai/WaultLedger.json',
);

let deployment = null;
if (fs.existsSync(deploymentPath)) {
  try {
    deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  } catch (error) {
    deployment = null;
  }
}

const provider = process.env.POLYGON_RPC_URL
  ? new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)
  : null;

function getValidatedPrivateKey() {
  const privateKey = process.env.PRIVATE_KEY || '';
  const normalizedKey = privateKey.startsWith('0x')
    ? privateKey
    : `0x${privateKey}`;

  return /^0x[a-fA-F0-9]{64}$/.test(normalizedKey) ? normalizedKey : null;
}

const validatedPrivateKey = getValidatedPrivateKey();
const wallet =
  provider && validatedPrivateKey
    ? new ethers.Wallet(validatedPrivateKey, provider)
    : null;

const contract =
  wallet && deployment?.abi && process.env.CONTRACT_ADDRESS
    ? new ethers.Contract(process.env.CONTRACT_ADDRESS, deployment.abi, wallet)
    : null;

function hashPayload(data) {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

async function logTrigger({ userId, grantIds }) {
  try {
    if (!contract) {
      return null;
    }

    const payload = {
      type: 'TRIGGER',
      userId,
      grantIds,
      timestamp: Date.now(),
    };
    const hash = hashPayload(payload);
    const tx = await contract.logEvent('TRIGGER', hash);
    const receipt = await tx.wait();

    await prisma.blockchainLog.create({
      data: {
        txHash: receipt.hash,
        eventType: 'TRIGGER',
        data: payload,
      },
    });

    return receipt.hash;
  } catch (error) {
    console.error('Blockchain log failed:', error.message);
    return null;
  }
}

async function logAccess({ userId, beneficiaryId, vaultItemId }) {
  try {
    if (!contract) {
      return null;
    }

    const payload = {
      type: 'ACCESS',
      userId,
      beneficiaryId,
      vaultItemId,
      timestamp: Date.now(),
    };
    const hash = hashPayload(payload);
    const tx = await contract.logEvent('ACCESS', hash);
    const receipt = await tx.wait();

    await prisma.blockchainLog.create({
      data: {
        txHash: receipt.hash,
        eventType: 'ACCESS',
        data: payload,
      },
    });

    return receipt.hash;
  } catch (error) {
    console.error('Blockchain log failed:', error.message);
    return null;
  }
}

async function getAuditTrail(userId) {
  return prisma.blockchainLog.findMany({
    where: {
      data: {
        path: ['userId'],
        equals: userId,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

module.exports = {
  logTrigger,
  logAccess,
  getAuditTrail,
};
