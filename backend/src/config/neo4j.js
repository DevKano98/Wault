require('./env');

const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
);

async function verifyConnectivity() {
  try {
    await driver.verifyConnectivity();
    console.log('Neo4j connected');
  } catch (error) {
    console.error('Failed to connect to Neo4j:', error);
    process.exit(1);
  }
}

verifyConnectivity();

function getSession() {
  return driver.session();
}

async function closeDriver() {
  await driver.close();
}

module.exports = {
  driver,
  getSession,
  closeDriver,
};
