const crypto = require('crypto');

const prisma = require('../config/db');
const b2Service = require('../services/b2.service');

const ALGO = 'aes-256-gcm';

function getCipherKey() {
  return crypto.scryptSync(process.env.JWT_SECRET, 'wault-salt', 32);
}

function encryptData(text) {
  const iv = crypto.randomBytes(16);
  const key = getCipherKey();
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: Buffer.concat([authTag, encrypted]).toString('base64'),
    iv: iv.toString('base64'),
  };
}

function decryptData(encryptedData, iv) {
  const payload = Buffer.from(encryptedData, 'base64');
  const authTag = payload.subarray(0, 16);
  const encrypted = payload.subarray(16);
  const decipher = crypto.createDecipheriv(
    ALGO,
    getCipherKey(),
    Buffer.from(iv, 'base64'),
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

function extractB2Key(fileUrl) {
  if (!fileUrl) {
    return null;
  }

  try {
    const pathname = new URL(fileUrl).pathname.replace(/^\/+/, '');
    const [, ...keyParts] = pathname.split('/');
    return keyParts.join('/');
  } catch (error) {
    return null;
  }
}

async function getAll(req, res, next) {
  try {
    const items = await prisma.vaultItem.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const decryptedItems = items.map((item) => ({
      ...item,
      data: decryptData(item.encryptedData, item.iv),
    }));

    return res.status(200).json(decryptedItems);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { type, title, data } = req.body;
    const encrypted = encryptData(data);
    let fileUrl = null;

    if (req.file) {
      const key = b2Service.generateKey(req.user.id, req.file.originalname);
      fileUrl = await b2Service.uploadFile(
        req.file.buffer,
        key,
        req.file.mimetype,
      );
    }

    const item = await prisma.vaultItem.create({
      data: {
        userId: req.user.id,
        type,
        title,
        encryptedData: encrypted.encryptedData,
        iv: encrypted.iv,
        fileUrl,
      },
    });

    return res.status(201).json({
      ...item,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function getOne(req, res, next) {
  try {
    const item = await prisma.vaultItem.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!item) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.status(200).json({
      ...item,
      data: decryptData(item.encryptedData, item.iv),
    });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const existingItem = await prisma.vaultItem.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingItem) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};

    if (typeof req.body.type === 'string') {
      updateData.type = req.body.type;
    }

    if (typeof req.body.title === 'string') {
      updateData.title = req.body.title;
    }

    if (typeof req.body.data === 'string') {
      const encrypted = encryptData(req.body.data);
      updateData.encryptedData = encrypted.encryptedData;
      updateData.iv = encrypted.iv;
    }

    if (req.file) {
      if (existingItem.fileUrl) {
        const existingKey = extractB2Key(existingItem.fileUrl);
        if (existingKey) {
          await b2Service.deleteFile(existingKey);
        }
      }

      const key = b2Service.generateKey(req.user.id, req.file.originalname);
      updateData.fileUrl = await b2Service.uploadFile(
        req.file.buffer,
        key,
        req.file.mimetype,
      );
    }

    const updatedItem = await prisma.vaultItem.update({
      where: { id: existingItem.id },
      data: updateData,
    });

    return res.status(200).json({
      ...updatedItem,
      data:
        typeof req.body.data === 'string'
          ? req.body.data
          : decryptData(updatedItem.encryptedData, updatedItem.iv),
    });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const item = await prisma.vaultItem.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!item) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (item.fileUrl) {
      const key = extractB2Key(item.fileUrl);
      if (key) {
        await b2Service.deleteFile(key);
      }
    }

    await prisma.vaultItem.delete({
      where: { id: item.id },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  encryptData,
  decryptData,
  getAll,
  create,
  getOne,
  update,
  delete: remove,
};
