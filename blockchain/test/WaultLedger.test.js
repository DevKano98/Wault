const { expect } = require('chai');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
const { ethers } = require('hardhat');

describe('WaultLedger', function () {
  async function deployFixture() {
    const [owner] = await ethers.getSigners();
    const WaultLedger = await ethers.getContractFactory('WaultLedger');
    const contract = await WaultLedger.deploy();
    await contract.waitForDeployment();

    return { contract, owner };
  }

  it('logs an event for the caller and increments the event count', async function () {
    const { contract, owner } = await deployFixture();
    const dataHash =
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    await expect(contract.logEvent('TRIGGER', dataHash))
      .to.emit(contract, 'EventLogged')
      .withArgs(owner.address, 'TRIGGER', `0x${dataHash}`, anyValue);

    const count = await contract.getEventCount(owner.address);
    expect(count).to.equal(1n);

    const events = await contract.getEvents(owner.address);
    expect(events).to.have.length(1);
    expect(events[0].eventType).to.equal('TRIGGER');
    expect(events[0].dataHash).to.equal(`0x${dataHash}`);
    expect(events[0].caller).to.equal(owner.address);
  });

  it('stores events separately per caller', async function () {
    const { contract, owner } = await deployFixture();
    const [, secondUser] = await ethers.getSigners();
    const ownerHash =
      'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
    const secondHash =
      'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';

    await contract.logEvent('ACCESS', ownerHash);
    await contract.connect(secondUser).logEvent('TRIGGER', secondHash);

    expect(await contract.getEventCount(owner.address)).to.equal(1n);
    expect(await contract.getEventCount(secondUser.address)).to.equal(1n);
  });
});
