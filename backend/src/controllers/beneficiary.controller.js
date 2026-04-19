const crypto = require('crypto');

const prisma = require('../config/db');
const { getSession } = require('../config/neo4j');
const resendService = require('../services/resend.service');

async function addBeneficiary(req, res, next) {
  const session = getSession();

  try {
    const verificationToken = crypto.randomUUID();
    const beneficiary = await prisma.beneficiary.create({
      data: {
        userId: req.user.id,
        email: req.body.email,
        name: req.body.name,
        verificationToken,
      },
    });

    await session.run(
      'MERGE (u:User {id: $uid}) MERGE (b:Beneficiary {id: $bid}) SET b.email = $email, b.name = $name MERGE (u)-[:HAS_BENEFICIARY]->(b)',
      {
        uid: req.user.id,
        bid: beneficiary.id,
        email: beneficiary.email,
        name: beneficiary.name,
      },
    );

    await resendService.sendBeneficiaryInvite({
      to: beneficiary.email,
      name: beneficiary.name,
      ownerName: req.user.name,
      verifyUrl: `${process.env.FRONTEND_URL}/verify/${verificationToken}`,
    });

    return res.status(201).json(beneficiary);
  } catch (error) {
    return next(error);
  } finally {
    await session.close();
  }
}

async function verifyBeneficiary(req, res, next) {
  try {
    const token = req.params.token;
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { verificationToken: token },
    });

    if (!beneficiary) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await prisma.beneficiary.update({
      where: { id: beneficiary.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return res.status(200).json({ message: 'Verified successfully' });
  } catch (error) {
    return next(error);
  }
}

async function getAll(req, res, next) {
  try {
    const beneficiaries = await prisma.beneficiary.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(beneficiaries);
  } catch (error) {
    return next(error);
  }
}

async function removeBeneficiary(req, res, next) {
  const session = getSession();

  try {
    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!beneficiary) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.beneficiary.delete({
      where: { id: beneficiary.id },
    });

    await session.run(
      'MATCH (b:Beneficiary {id: $bid}) DETACH DELETE b',
      { bid: beneficiary.id },
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  } finally {
    await session.close();
  }
}

module.exports = {
  addBeneficiary,
  verifyBeneficiary,
  getAll,
  removeBeneficiary,
};
