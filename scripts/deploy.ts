import { ethers } from "hardhat";

async function main() {
  const PaymentChannel = await ethers.getContractFactory("PaymentChannel");
  const paymentChannel = await PaymentChannel.deploy();

  await paymentChannel.deployed();

  console.log(`PaymentChannel deployed to ${paymentChannel.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
