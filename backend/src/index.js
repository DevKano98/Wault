require('./config/env');

const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

require('./config/db');
require('./config/neo4j');

const { initInactivityWorker } = require('./workers/inactivity.worker');
const { initTriggerWorker } = require('./workers/trigger.worker');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/vault', require('./routes/vault.routes'));
app.use('/api/beneficiary', require('./routes/beneficiary.routes'));
app.use('/api/access', require('./routes/access.routes'));
app.use('/api/activity', require('./routes/activity.routes'));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(require('./middleware/errorHandler'));

initInactivityWorker();
initTriggerWorker();

app.listen(PORT, () => console.log(`WAULT API on port ${PORT}`));
