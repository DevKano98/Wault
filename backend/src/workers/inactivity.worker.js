const jwt = require('jsonwebtoken');
const { Queue, Worker } = require('bullmq');

const prisma = require('../config/db');
const { bullConnection, isBullConfigured } = require('../config/redis');
const resendService = require('../services/resend.service');

const inactivityQueue = isBullConfigured()
  ? new Queue('inactivity-check', { connection: bullConnection })
  : null;
const triggerQueue = isBullConfigured()
  ? new Queue('trigger-queue', { connection: bullConnection })
  : null;

async function processJob() {
  const rules = await prisma.inactivityRule.findMany({
    where: { isActive: true },
    include: { user: true },
  });

  for (const rule of rules) {
    const user = rule.user;
    const daysInactive =
      (Date.now() - new Date(user.lastActiveAt).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysInactive < rule.thresholdDays) {
      continue;
    }

    const existingTrigger = await prisma.triggerEvent.findFirst({
      where: {
        userId: user.id,
        status: { not: 'CANCELLED' },
      },
    });

    if (existingTrigger) {
      continue;
    }

    await prisma.triggerEvent.create({
      data: {
        userId: user.id,
        status: 'WARNING_SENT',
      },
    });

    const pingToken = jwt.sign(
      { userId: user.id, type: 'inactivity-ping' },
      process.env.JWT_SECRET,
      { expiresIn: `${Math.max(rule.warningDays, 1)}d` },
    );
    const backendBaseUrl =
      process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
    const pingUrl = `${backendBaseUrl}/api/activity/ping?token=${pingToken}`;

    await resendService.sendInactivityWarning({
      to: user.email,
      name: user.name,
      daysInactive,
      warningDays: rule.warningDays,
      pingUrl,
    });

    await triggerQueue.add(
      'execute-trigger',
      { userId: user.id },
      {
        delay: rule.warningDays * 24 * 60 * 60 * 1000,
        jobId: `trigger-${user.id}`,
      },
    );

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'INACTIVITY_WARNING_SENT',
      },
    });
  }
}

function initInactivityWorker() {
  if (!isBullConfigured()) {
    console.warn('Inactivity worker skipped: Upstash Redis is not configured.');
    return;
  }

  inactivityQueue
    .add(
      'check',
      {},
      {
        repeat: { every: 6 * 60 * 60 * 1000 },
        jobId: 'inactivity-repeat',
      },
    )
    .catch((error) => {
      console.error('Failed to schedule inactivity worker:', error.message);
    });

  new Worker('inactivity-check', processJob, { connection: bullConnection });
  console.log('Inactivity worker started');
}

module.exports = {
  inactivityQueue,
  initInactivityWorker,
};
