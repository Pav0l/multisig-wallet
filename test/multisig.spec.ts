import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { MockMultisig, MockMultisig__factory } from "../typechain";
import { BigNumber, Wallet } from "ethers";
const MultisigContract = require("../artifacts/contracts/test/MockMultisig.sol/MockMultisig.json");


describe("Multisig", function () {
  let MockMultisigFactory: MockMultisig__factory;
  let contract: MockMultisig;
  let one: Wallet, two: Wallet, three: Wallet, four: Wallet;

  describe("contract creation", function () {
    beforeEach(async () => {
      MockMultisigFactory = (await ethers.getContractFactory("MockMultisig")) as MockMultisig__factory;
      [one, two, three, four] = waffle.provider.getWallets();
    });

    it("should work", async function () {
      contract = await MockMultisigFactory.deploy(2, [one.address, two.address, three.address]);
      expect(await contract.minNumOfSignatures()).to.eql(2);
    });

    it("should crash on invalid inputs: `can't have duplicate owners`", async function () {
      await expect(MockMultisigFactory.deploy(2, [one.address, one.address]))
        .to.revertedWith("can't have duplicate owners");
    });

    it("should crash on invalid inputs: `min number of signatures must be more than 1`", async function () {
      await expect(MockMultisigFactory.deploy(1, [one.address, two.address]))
        .to.revertedWith("min number of signatures must be more than 1");
      await expect(MockMultisigFactory.deploy(0, [one.address, two.address]))
        .to.revertedWith("min number of signatures must be more than 1");
      await expect(MockMultisigFactory.deploy(-1, [one.address, two.address])).to.reverted;
    });

    it("should crash on invalid inputs: `numer of owners must be more/equal than min num of signatures`", async function () {
      await expect(MockMultisigFactory.deploy(3, [one.address, two.address]))
        .to.revertedWith("numer of owners must be more/equal than min num of signatures");
    });

    it("should crash on invalid inputs: `invalid owner address`", async function () {
      await expect(MockMultisigFactory.deploy(2, [one.address, ethers.constants.AddressZero]))
        .to.revertedWith("invalid owner address");
    });

    it("should crash on invalid inputs: minNumOfSignatures uint8 overflow", async function () {
      await expect(MockMultisigFactory.deploy(256, new Array(256).fill(one.address))).to.reverted;
    });
  });

  describe("createTransaction", function () {
    before(async () => {
      MockMultisigFactory = (await ethers.getContractFactory("MockMultisig")) as MockMultisig__factory;
      [one, two, three, four] = waffle.provider.getWallets();
    });

    beforeEach(async () => {
      contract = await MockMultisigFactory.deploy(2, [one.address, two.address, three.address]);
    });

    it("validation: can only be called by one of contract owners", async function () {
      // wallet four will call the contract to create new tx
      const randomContractCaller = (new ethers.Contract(contract.address, MultisigContract.abi, four)) as MockMultisig;
      // and the tx is reverted
      await expect(randomContractCaller.createTransaction(four.address, BigNumber.from(1), "0x"))
        .to.be.revertedWith("this function can be called by one of contract owners");
    });

    it("creates new transaction and stores it in transactions array", async function () {
      await contract.createTransaction(four.address, BigNumber.from(0.5e18.toString()), "0x");

      expect(await contract.getTransactionsLength()).to.eql(BigNumber.from(1));

      const tx = await contract.transactions(0);
      expect(tx.to).to.eql(four.address);
      expect(tx.value).to.eql(BigNumber.from(0.5e18.toString()));
      expect(tx.data).to.eql("0x");
    });


    it("transaction is already confirmed by tx creator", async function () {
      await contract.createTransaction(four.address, BigNumber.from(0.5e18.toString()), "0x");

      const tx = await contract.transactions(0);
      expect(tx.numOfSignatures).to.eql(1);

      expect(await contract.getTransactionsLength()).to.eql(BigNumber.from(1));
      const confirmed = await contract.isConfirmed(0, one.address);
      expect(confirmed).to.eql(true);
    });

    it("emits TransactionCreated event with transaction id", async function () {
      await expect(contract.createTransaction(four.address, BigNumber.from(0.5e18.toString()), "0x"))
        .to.emit(contract, 'TransactionCreated')
        .withArgs(one.address, 0, four.address, 0.5e18.toString(), "0x");
      expect(await contract.getTransactionsLength()).to.eql(BigNumber.from(1));
    });
  });

  describe("confirmTransaction", function () {

    before(async () => {
      MockMultisigFactory = (await ethers.getContractFactory("MockMultisig")) as MockMultisig__factory;
      [one, two, three, four] = waffle.provider.getWallets();
    });

    beforeEach(async () => {
      contract = await MockMultisigFactory.deploy(2, [one.address, two.address, three.address]);
      await contract.createTransaction(four.address, BigNumber.from(0.5e18.toString()), "0x");
    });

    it("validation: can only be called by one of contract owners", async function () {
      // wallet four will call the contract to confirm first tx
      const randomContractCaller = (new ethers.Contract(contract.address, MultisigContract.abi, four)) as MockMultisig;
      // and the tx is reverted
      await expect(randomContractCaller.confirmTransaction(0))
        .to.be.revertedWith("this function can be called by one of contract owners");
    });

    it("validation: transaction exist", async function () {
      await expect(contract.confirmTransaction(10))
        .to.be.revertedWith("transaction does not exist");
    });

    it("validation: transaction is not yet confirmed", async function () {
      await expect(contract.confirmTransaction(0))
        .to.be.revertedWith("transaction is already confirmed");
    });

    it("validation: transaction is not yet executed", async function () {
      // mock executed transaction
      await contract.setTxExecuted(0, true);
      const twoSigner = await contract.connect(two);

      await expect(twoSigner.confirmTransaction(0))
        .to.be.revertedWith("transaction is already executed");
    });

    it("confirms transaction", async () => {
      // original tx is already confirmed by signer (one.address)
      let isTxConfirmed = await contract.isConfirmed(0, one.address);
      expect(isTxConfirmed).to.eql(true);

      // confirm tx with other signer
      const twoSigner = await contract.connect(two);
      await expect(twoSigner.confirmTransaction(0))
        .to.emit(contract, 'TransactionConfirmed')
        .withArgs(two.address, 0);

      const tx = await contract.transactions(0);
      expect(tx.numOfSignatures).to.eql(2);

      isTxConfirmed = await contract.isConfirmed(0, two.address);
      expect(isTxConfirmed).to.eql(true);
    });
  });

  describe("revokeTransaction", function () {

    before(async () => {
      MockMultisigFactory = (await ethers.getContractFactory("MockMultisig")) as MockMultisig__factory;
      [one, two, three, four] = waffle.provider.getWallets();
    });

    beforeEach(async () => {
      contract = await MockMultisigFactory.deploy(2, [one.address, two.address, three.address]);
      await contract.createTransaction(four.address, BigNumber.from(0.5e18.toString()), "0x");
    });

    it("validation: can only be called by one of contract owners", async function () {
      // wallet four will call the contract to confirm first tx
      const randomContractCaller = (new ethers.Contract(contract.address, MultisigContract.abi, four)) as MockMultisig;
      // and the tx is reverted
      await expect(randomContractCaller.revokeTransaction(0))
        .to.be.revertedWith("this function can be called by one of contract owners");
    });

    it("validation: transaction exist", async function () {
      await expect(contract.revokeTransaction(10))
        .to.be.revertedWith("transaction does not exist");
    });

    it("validation: transaction is not confirmed", async function () {
      const twoSigner = await contract.connect(two);
      await expect(twoSigner.revokeTransaction(0))
        .to.be.revertedWith("you have not confirmed this transaction yet");
    });

    it("validation: transaction is not yet executed", async function () {
      await contract.setTxExecuted(0, true);

      await expect(contract.revokeTransaction(0))
        .to.be.revertedWith("transaction is already executed");
    });

    it("revokes transaction", async () => {
      let tx = await contract.transactions(0);
      expect(tx.numOfSignatures).to.eql(1);


      await expect(contract.revokeTransaction(0))
        .to.emit(contract, 'TransactionRevoked')
        .withArgs(one.address, 0);

      tx = await contract.transactions(0);
      expect(tx.numOfSignatures).to.eql(0);

      const isTxConfirmed = await contract.isConfirmed(0, one.address);
      expect(isTxConfirmed).to.eql(false);
    });
  });

  describe("executeTransaction", function () {
    before(async () => {
      MockMultisigFactory = (await ethers.getContractFactory("MockMultisig")) as MockMultisig__factory;
      [one, two, three, four] = waffle.provider.getWallets();
    });

    beforeEach(async () => {
      // deploy contract
      contract = await MockMultisigFactory.deploy(2, [one.address, two.address, three.address]);

      // deposit some Ether for gas costs
      await one.sendTransaction({
        to: contract.address,
        value: ethers.utils.parseUnits((10e18).toString(), "wei")
      });

      // create & confirm transaction
      await contract.createTransaction(four.address, BigNumber.from(0.5e18.toString()), "0x");
      const secondCaller = contract.connect(two);
      await secondCaller.confirmTransaction(0);
    });

    it("validation: can only be called by one of contract owners", async function () {
      // wallet four will call the contract to confirm first tx
      const randomContractCaller = (new ethers.Contract(contract.address, MultisigContract.abi, four)) as MockMultisig;
      // and the tx is reverted
      await expect(randomContractCaller.executeTransaction(0))
        .to.be.revertedWith("this function can be called by one of contract owners");
    });

    it("validation: transaction exist", async function () {
      await expect(contract.executeTransaction(10))
        .to.be.revertedWith("transaction does not exist");
    });

    it("validation: transaction has enough number of signatures", async function () {
      await contract.createTransaction(four.address, BigNumber.from(0.5e18.toString()), "0x");

      await expect(contract.executeTransaction(1))
        .to.be.revertedWith("transaction does not have enough signatures");
    });

    it("validation: transaction is not yet executed", async function () {
      // mock executed transaction
      await contract.setTxExecuted(0, true);

      await expect(contract.executeTransaction(0))
        .to.be.revertedWith("transaction is already executed");
    });

    it("validation: tx execution fails if contract does not have enough ETH for transaction", async () => {
      // contract only has 10ETH. this tx wants to send 50
      await contract.createTransaction(four.address, BigNumber.from(50e18.toString()), "0x");
      const secondCaller = contract.connect(two);
      await secondCaller.confirmTransaction(1);

      await expect(contract.executeTransaction(1))
        .to.be.revertedWith("transaction execution has failed")
    });

    it("executes transaction", async () => {
      let transaction = await contract.transactions(0);
      expect(transaction.executed).to.eql(false);
      expect(transaction.numOfSignatures).to.eql(2);

      await contract.executeTransaction(0);
      await expect(contract.executeTransaction(0))
        .to.emit(contract, 'TransactionExecuted')
        .withArgs(one.address, 0);

      transaction = await contract.transactions(0);
      expect(transaction.executed).to.eql(true);
    });

    // TODO test:
    // - transaction that deploys other contract
    // - re-entrancy attack
  });
});
