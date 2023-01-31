import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PaymentChannel", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [deployer, alice, bob] = await ethers.getSigners();

    const PaymentChannel = await ethers.getContractFactory("PaymentChannel");
    const paymentChannel = await PaymentChannel.deploy();

    return { paymentChannel, deployer, alice, bob };
  }

  describe("Channel Setup", () => {
    it("stub test", async () => {
      const { bob } = await loadFixture(deployFixture);
      console.log(bob);
    });
  });
});
