import { ethers } from "hardhat";

async function main() {
  const PermitERC20 = await ethers.getContractFactory("PermitERC20");
  const erc20 = await PermitERC20.deploy();
  await erc20.deployed();
  console.log(`PermitERC20 deployed to ${erc20.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
