import { ethers } from "hardhat";

async function main() {
  const Hello = await ethers.getContractFactory("HelloRobinhood");
  const hello = await Hello.deploy();
  await hello.deployed();
  console.log("HelloRobinhood deployed to:", hello.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
