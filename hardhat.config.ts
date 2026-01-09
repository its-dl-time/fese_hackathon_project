import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";

// Đọc biến môi trường
const SEPOLIA_URL = process.env.SEPOLIA_RPC_URL || "";
const SEPOLIA_KEY = process.env.SEPOLIA_PRIVATE_KEY || "";

export default defineConfig({
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Mạng Local (Bắt buộc type: edr-simulated cho Hardhat v3)
    hardhat: {
      type: "edr-simulated",
    },
    // Mạng Sepolia
    sepolia: {
      type: "http",
      url: SEPOLIA_URL,
      // Nếu key rỗng thì để mảng rỗng để tránh lỗi crash
      accounts: SEPOLIA_KEY ? [SEPOLIA_KEY] : [],
    },
  },
});