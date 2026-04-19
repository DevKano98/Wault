const jwt = require('jsonwebtoken');

const prisma = require('../config/db');
const { getSession } = require('../config/neo4j');
const blockchainService = require('../services/blockchain.service');
const { decryptData } = require('./vault.controller');

async function grantAccess(req, res, next) {
  const session = getSession();

  try {
    const { vaultItemId, beneficiaryId } = req.body;
    const vaultItem = await prisma.vaultItem.findFirst({
      where: {
        id: vaultItemId,
        userId: req.user.id,
      },
    });

    if (!vaultItem) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: beneficiaryId,
        userId: req.user.id,
      },
    });

    if (!beneficiary) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const grant = await prisma.accessGrant.create({
      data: {
        vaultItemId,
        beneficiaryId,
        status: 'PENDING',
      },
    });

    await session.run(
      'MERGE (b:Beneficiary {id: $bid}) MERGE (v:VaultItem {id: $vid}) MERGE (b)-[:CAN_ACCESS]->(v)',
      {
        bid: beneficiaryId,
        vid: vaultItemId,
      },
    );

    return res.status(201).json(grant);
  } catch (error) {
    return next(error);
  } finally {
    await session.close();
  }
}

async function revokeGrant(req, res, next) {
  const session = getSession();

  try {
    const grant = await prisma.accessGrant.findFirst({
      where: { id: req.params.id },
      include: {
        vaultItem: true,
      },
    });

    if (!grant || grant.vaultItem.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedGrant = await prisma.accessGrant.update({
      where: { id: grant.id },
      data: { status: 'REVOKED' },
    });

    await session.run(
      'MATCH (b:Beneficiary {id: $bid})-[r:CAN_ACCESS]->(v:VaultItem {id: $vid}) DELETE r',
      {
        bid: grant.beneficiaryId,
        vid: grant.vaultItemId,
      },
    );

    return res.status(200).json(updatedGrant);
  } catch (error) {
    return next(error);
  } finally {
    await session.close();
  }
}

async function getGrants(req, res, next) {
  try {
    const grants = await prisma.accessGrant.findMany({
      where: {
        vaultItem: {
          userId: req.user.id,
        },
      },
      include: {
        vaultItem: true,
        beneficiary: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(grants);
  } catch (error) {
    return next(error);
  }
}

async function getBeneficiaryAccess(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');
    const accessToken = scheme === 'Bearer' ? token : req.query.token;

    if (!accessToken) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (decoded.grantId !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const grant = await prisma.accessGrant.findUnique({
      where: { id: req.params.id },
      include: {
        beneficiary: true,
        vaultItem: true,
      },
    });

    if (
      !grant ||
      grant.status !== 'ACTIVE' ||
      grant.beneficiaryId !== decoded.beneficiaryId
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await blockchainService.logAccess({
      userId: grant.vaultItem.userId,
      beneficiaryId: grant.beneficiaryId,
      vaultItemId: grant.vaultItemId,
    });

    return res.status(200).json({
      grant: {
        id: grant.id,
        status: grant.status,
        grantedAt: grant.grantedAt,
      },
      beneficiary: {
        id: grant.beneficiary.id,
        name: grant.beneficiary.name,
        email: grant.beneficiary.email,
      },
      vaultItem: {
        id: grant.vaultItem.id,
        title: grant.vaultItem.title,
        type: grant.vaultItem.type,
        fileUrl: grant.vaultItem.fileUrl,
        data: decryptData(grant.vaultItem.encryptedData, grant.vaultItem.iv),
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getBeneficiaryAccess,
  grantAccess,
  revokeGrant,
  getGrants,
};
