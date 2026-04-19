const jwt = require('jsonwebtoken');
const { Queue } = require('bullmq');

const prisma = require('../config/db');
const {
  bullConnection,
  cacheGet,
  cacheSet,
  isBullConfigured,
} = require('../config/redis');

const triggerQueue = isBullConfigured()
  ? new Queue('trigger-queue', { connection: bullConnection })
  : null;

function getDaysInactive(lastActiveAt) {
  return (Date.now() - new Date(lastActiveAt).getTime()) / 86400000;
}

function getPingUserId(req) {
  const authorization = req.headers.authorization || '';
  const [scheme, bearerToken] = authorization.split(' ');

  if (scheme === 'Bearer' && bearerToken) {
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    return decoded.userId;
  }

  const token = req.query.token || req.body?.token;
  if (!token) {
    return null;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.type !== 'inactivity-ping') {
    return null;
  }

  return decoded.userId;
}

async function ping(req, res, next) {
  try {
    const userId = getPingUserId(req);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const now = new Date();
    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: now },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PING',
        ipAddress: req.ip,
      },
    });

    if (triggerQueue) {
      const job = await triggerQueue.getJob(`trigger-${userId}`);
      if (job) {
        await job.remove();
      }
    }

    await prisma.triggerEvent.updateMany({
      where: { userId, status: 'WARNING_SENT' },
      data: { status: 'CANCELLED' },
    });

    return res.status(200).json({ status: 'alive', lastActive: now });
  } catch (error) {
    return next(error);
  }
}

async function getRiskScore(req, res, next) {
  try {
    const cacheKey = `risk:${req.user.id}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return res.status(200).json(cached);
    }

    const [loginCount30d, user, prevTriggers] = await Promise.all([
      prisma.activityLog.count({
        where: {
          userId: req.user.id,
          action: 'LOGIN',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: req.user.id },
      }),
      prisma.triggerEvent.count({
        where: {
          userId: req.user.id,
          status: 'TRIGGERED',
        },
      }),
    ]);

    const payload = {
      login_count_30d: loginCount30d,
      days_inactive: getDaysInactive(user.lastActiveAt),
      avg_response_delay: 0,
      prev_triggers: prevTriggers,
    };

    const response = await fetch(`${process.env.ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`);
    }

    const result = await response.json();
    const enrichedResult = {
      ...result,
      details: {
        ...result.details,
        days_inactive: payload.days_inactive,
        login_count_30d: payload.login_count_30d,
        prev_triggers: payload.prev_triggers,
      },
    };
    await cacheSet(cacheKey, enrichedResult, 60 * 60);

    return res.status(200).json(enrichedResult);
  } catch (error) {
    return next(error);
  }
}

async function setRule(req, res, next) {
  try {
    const rule = await prisma.inactivityRule.upsert({
      where: { userId: req.user.id },
      update: {
        thresholdDays: req.body.thresholdDays,
        warningDays: req.body.warningDays,
        isActive: true,
      },
      create: {
        userId: req.user.id,
        thresholdDays: req.body.thresholdDays,
        warningDays: req.body.warningDays,
        isActive: true,
      },
    });

    return res.status(200).json(rule);
  } catch (error) {
    return next(error);
  }
}

async function getRule(req, res, next) {
  try {
    const rule = await prisma.inactivityRule.findUnique({
      where: { userId: req.user.id },
    });

    return res.status(200).json(rule);
  } catch (error) {
    return next(error);
  }
}

async function getLog(req, res, next) {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return res.status(200).json(logs);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  ping,
  getRiskScore,
  setRule,
  getRule,
  getLog,
};
