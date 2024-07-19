import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-foundry";
import "@nomicfoundation/hardhat-viem";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { config as dotenv } from "dotenv";

import "./tasks";

dotenv();

const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: { default: 0 }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  external: {
    contracts: [{ artifacts: "./out" }]
  },
  paths: {
    sources: "./contracts",
    tests: "./contracts/test",
    artifacts: "./out"
  },
  networks: {
    local: {
      accounts: [process.env.DEPLOYER!],
      url: "http://localhost:8545",
      saveDeployments: false
    },
    mode: {
      url: "https://mainnet.mode.network",
      accounts: [process.env.DEPLOYER!]
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.DEPLOYER!]
    },
    optimism: {
      url: "https://mainnet.optimism.io",
      accounts: [process.env.DEPLOYER!]
    }
  }
};

export default config;
