import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const RPC = "https://rpc.testnet.chain.robinhood.com";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    robinhood: {
      url: RPC,
      chainId: 46630,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};

export default config;
