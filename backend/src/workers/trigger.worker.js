const jwt = require('jsonwebtoken');
const { Worker } = require('bullmq');

const prisma = require('../config/db');
const { bullConnection, isBullConfigured } = require('../config/redis');
const resendService = require('../services/resend.service');
const blockchainService = require('../services/blockchain.service');

async function processJob(job) {
  const { userId } = job.data;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { inactivityRule: true },
  });

  if (!user || !user.inactivityRule) {
    return;
  }

  const daysInactive =
    (Date.now() - new Date(user.lastActiveAt).getTime()) / 86400000;

  if (daysInactive < user.inactivityRule.thresholdDays) {
    await prisma.triggerEvent.updateMany({
      where: { userId, status: 'WARNING_SENT' },
      data: { status: 'CANCELLED' },
    });
    return;
  }

  const grants = await prisma.accessGrant.findMany({
    where: {
      vaultItem: { userId },
      status: 'PENDING',
    },
    include: {
      beneficiary: true,
      vaultItem: true,
    },
  });

  for (const grant of grants) {
    await prisma.accessGrant.update({
      where: { id: grant.id },
      data: {
        status: 'ACTIVE',
        grantedAt: new Date(),
      },
    });

    const signedToken = jwt.sign(
      {
        grantId: grant.id,
        beneficiaryId: grant.beneficiaryId,
      },
      process.env.JWT_SECRET,
      { expiresIn: '72h' },
    );

    await resendService.sendTriggerNotification({
      to: grant.beneficiary.email,
      beneficiaryName: grant.beneficiary.name,
      ownerName: user.name,
      accessUrl: `${process.env.FRONTEND_URL}/access/${grant.id}?token=${signedToken}`,
    });
  }

  await prisma.triggerEvent.updateMany({
    where: { userId, status: 'WARNING_SENT' },
    data: {
      status: 'TRIGGERED',
      triggeredAt: new Date(),
    },
  });

  await blockchainService.logTrigger({
    userId,
    grantIds: grants.map((grant) => grant.id),
  });

  await prisma.activityLog.create({
    data: {
      userId,
      action: 'INHERITANCE_TRIGGERED',
    },
  });
}

function initTriggerWorker() {
  if (!isBullConfigured()) {
    console.warn('Trigger worker skipped: Upstash Redis is not configured.');
    return;
  }

  new Worker('trigger-queue', processJob, { connection: bullConnection });
  console.log('Trigger worker started');
}

module.exports = {
  initTriggerWorker,
};
