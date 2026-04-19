const fs = require('fs');
const path = require('path');
const { ethers, network } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with:', deployer.address);
  console.log(
    'Balance:',
    ethers.formatEther(await deployer.provider.getBalance(deployer.address)),
    'MATIC',
  );

  const WaultLedger = await ethers.getContractFactory('WaultLedger');
  const contract = await WaultLedger.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log('WaultLedger deployed to:', address);

  const deployDir = path.join(__dirname, '../deployments', network.name);
  fs.mkdirSync(deployDir, { recursive: true });
  fs.writeFileSync(
    path.join(deployDir, 'WaultLedger.json'),
    JSON.stringify(
      {
        address,
        abi: JSON.parse(WaultLedger.interface.formatJson()),
        network: network.name,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  console.log('Deployment saved to deployments/', network.name);
  console.log(`Add to .env: CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
