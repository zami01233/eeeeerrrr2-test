import "dotenv/config";
import blessed from "blessed";
import figlet from "figlet";
import { ethers } from "ethers";
import axios from "axios";
import FormData from "form-data";
import { v4 as uuid } from "uuid";

const initialProvider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const initialWallet = new ethers.Wallet(process.env.PRIVATE_KEY, initialProvider);
const wallet_address = initialWallet.address;

const SEPOLIA_CONFIG = {
  RPC_URL: process.env.RPC_URL,
  USDC_ADDRESS: process.env.USDC_ADDRESS,
  R2USD_ADDRESS: process.env.R2USD_ADDRESS,
  sR2USD_ADDRESS: process.env.sR2USD_ADDRESS,
  ROUTER_USDC_TO_R2USD: "0x20c54C5F742F123Abb49a982BFe0af47edb38756",
  ROUTER_R2USD_TO_USDC: "0x07aBD582Df3D3472AA687A0489729f9F0424b1e3",
  STAKING_CONTRACT: "0xBD6b25c4132F09369C354beE0f7be777D7d434fa",
  LP_R2USD_sR2USD: "0x61F2AB7B0C0E10E18a3ed1C3bC7958540374A8DC",
  LP_USDC_R2USD: "0x07aBD582Df3D3472AA687A0489729f9F0424b1e3",
  NETWORK_NAME: "Sepolia Testnet"
};

const ARBITRUM_SEPOLIA_CONFIG = {
  RPC_URL: process.env.ARBITRUM_SEPOLIA_RPC_URL,
  USDC_ADDRESS: process.env.ARBITRUM_SEPOLIA_USDC_ADDRESS,
  R2USD_ADDRESS: process.env.ARBITRUM_SEPOLIA_R2USD_ADDRESS,
  sR2USD_ADDRESS: process.env.ARBITRUM_SEPOLIA_sR2USD_ADDRESS,
  ROUTER_USDC_TO_R2USD: "0x20c54C5F742F123Abb49a982BFe0af47edb38756",
  ROUTER_R2USD_TO_USDC: "0xCcE6bfcA2558c15bB5faEa7479A706735Aef9634",
  STAKING_CONTRACT: "0x6b9573B7dB7fB98Ff4014ca8E71F57aB7B7ffDFB",
  LP_R2USD_sR2USD: "0x58F68180a997dA6F9b1af78aa616d8dFe46F2531",
  LP_USDC_R2USD: "0xCcE6bfcA2558c15bB5faEa7479A706735Aef9634",
  NETWORK_NAME: "Arbitrum Sepolia Testnet"
};

const PLUME_CONFIG = {
  RPC_URL: process.env.PLUME_RPC_URL,
  USDC_ADDRESS: process.env.PLUME_USDC_ADDRESS,
  R2USD_ADDRESS: process.env.PLUME_R2USD_ADDRESS,
  sR2USD_ADDRESS: process.env.PLUME_sR2USD_ADDRESS,
  ROUTER_USDC_TO_R2USD: "0x20c54C5F742F123Abb49a982BFe0af47edb38756",
  ROUTER_R2USD_TO_USDC: "0x726cD35eE1AcE22e31ae51021A06DD24745D7f45",
  STAKING_CONTRACT: "0xBD6b25c4132F09369C354beE0f7be777D7d434fa",
  LP_R2USD_sR2USD: "0x5DfEC10AE4EFdCBA51251F87949ae70fC6a36B5B",
  LP_USDC_R2USD: "0x726cD35eE1AcE22e31ae51021A06DD24745D7f45",
  NETWORK_NAME: "Plume Network"
};

const BSC_CONFIG = {
  RPC_URL: process.env.BSC_RPC_URL,
  USDC_ADDRESS: process.env.BSC_USDC_ADDRESS,
  R2USD_ADDRESS: process.env.BSC_R2USD_ADDRESS,
  sR2USD_ADDRESS: process.env.BSC_sR2USD_ADDRESS,
  ROUTER_USDC_TO_R2USD: "0x20c54C5F742F123Abb49a982BFe0af47edb38756",
  ROUTER_R2USD_TO_USDC: "0x20c54C5F742F123Abb49a982BFe0af47edb38756",
  STAKING_CONTRACT: "0xBD6b25c4132F09369C354beE0f7be777D7d434fa",
  NETWORK_NAME: "BSC Network"
};

const MONAD_CONFIG = {
  RPC_URL: process.env.MONAD_RPC_URL,
  USDC_ADDRESS: process.env.MONAD_USDC_ADDRESS,
  R2USD_ADDRESS: process.env.MONAD_R2USD_ADDRESS,
  sR2USD_ADDRESS: process.env.MONAD_sR2USD_ADDRESS,
  ROUTER_USDC_TO_R2USD: "0x20c54C5F742F123Abb49a982BFe0af47edb38756",
  ROUTER_R2USD_TO_USDC: "0x20c54C5F742F123Abb49a982BFe0af47edb38756",
  STAKING_CONTRACT: "0xBD6b25c4132F09369C354beE0f7be777D7d434fa",
  NETWORK_NAME: "Monad Network"
};

const BASE_SEPOLIA_CONFIG = {
  RPC_URL: process.env.BASE_SEPOLIA_RPC_URL,
  USDC_ADDRESS: process.env.BASE_SEPOLIA_USDC_ADDRESS,
  R2USD_ADDRESS: process.env.BASE_SEPOLIA_R2USD_ADDRESS,
  sR2USD_ADDRESS: process.env.BASE_SEPOLIA_sR2USD_ADDRESS,
  ROUTER_USDC_TO_R2USD: "0x20c54C5F742F123Abb49a982BFe0af47edb38756",
  ROUTER_R2USD_TO_USDC: "0x20c54C5F742F123Abb49a982BFe0af47edb38756",
  STAKING_CONTRACT: "0xBD6b25c4132F09369C354beE0f7be777D7d434fa",
  NETWORK_NAME: "Base Sepolia Testnet"
};

const DEBUG_MODE = false;

const ERC20ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)"
];

const LP_CONTRACT_ABI = [
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "add_liquidity",
    "inputs": [
      {"name": "_amounts", "type": "uint256[]"},
      {"name": "_min_mint_amount", "type": "uint256"},
      {"name": "_receiver", "type": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256"}]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "calc_token_amount",
    "inputs": [
      {"name": "_amounts", "type": "uint256[]"},
      {"name": "_is_deposit", "type": "bool"}
    ],
    "outputs": [{"name": "", "type": "uint256"}]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "balanceOf",
    "inputs": [{"name": "arg0", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256"}]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint8"}]
  }
];

const LP_USDC_R2USD_ABI = [
  {
    "stateMutability": "view",
    "type": "function",
    "name": "get_balances",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256[]"}]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "calc_token_amount",
    "inputs": [
      {"name": "_amounts", "type": "uint256[]"},
      {"name": "_is_deposit", "type": "bool"}
    ],
    "outputs": [{"name": "", "type": "uint256"}]
  },
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "add_liquidity",
    "inputs": [
      {"name": "_amounts", "type": "uint256[]"},
      {"name": "_min_mint_amount", "type": "uint256"},
      {"name": "_receiver", "type": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256"}]
  }
];

const randomAmountRanges = {
  "SWAP_R2USD_USDC": {
    USDC: { min: 50, max: 200 },
    R2USD: { min: 50, max: 200 }
  }
};

let currentNetwork = "Sepolia";
let walletInfoByNetwork = {
  "Sepolia": {
    address: "",
    balanceNative: "0.00",
    balanceUsdc: "0.00",
    balanceR2usd: "0.00",
    balanceSr2usd: "0.00",
    balanceLpR2usdSr2usd: "0.00",
    balanceLpUsdcR2usd: "0.00",
    network: SEPOLIA_CONFIG.NETWORK_NAME,
    status: "Initializing"
  },
  "Arbitrum Sepolia": {
    address: "",
    balanceNative: "0.00",
    balanceUsdc: "0.00",
    balanceR2usd: "0.00",
    balanceSr2usd: "0.00",
    balanceLpR2usdSr2usd: "0.00",
    balanceLpUsdcR2usd: "0.00",
    network: ARBITRUM_SEPOLIA_CONFIG.NETWORK_NAME,
    status: "Initializing"
  },
  "Plume": {
    address: "",
    balanceNative: "0.00",
    balanceUsdc: "0.00",
    balanceR2usd: "0.00",
    balanceSr2usd: "0.00",
    balanceLpR2usdSr2usd: "0.00",
    balanceLpUsdcR2usd: "0.00",
    network: PLUME_CONFIG.NETWORK_NAME,
    status: "Initializing"
  },
  "BSC": {
    address: "",
    balanceNative: "0.00",
    balanceUsdc: "0.00",
    balanceR2usd: "0.00",
    balanceSr2usd: "0.00",
    balanceLpR2usdSr2usd: "N/A",
    balanceLpUsdcR2usd: "N/A",
    network: BSC_CONFIG.NETWORK_NAME,
    status: "Initializing"
  },
  "Monad": {
    address: "",
    balanceNative: "0.00",
    balanceUsdc: "0.00",
    balanceR2usd: "0.00",
    balanceSr2usd: "0.00",
    balanceLpR2usdSr2usd: "N/A",
    balanceLpUsdcR2usd: "N/A",
    network: MONAD_CONFIG.NETWORK_NAME,
    status: "Initializing"
  },
  "Base Sepolia": {
    address: "",
    balanceNative: "0.00",
    balanceUsdc: "0.00",
    balanceR2usd: "0.00",
    balanceSr2usd: "0.00",
    balanceLpR2usdSr2usd: "N/A",
    balanceLpUsdcR2usd: "N/A",
    network: BASE_SEPOLIA_CONFIG.NETWORK_NAME,
    status: "Initializing"
  }
};

let transactionLogs = [];
let globalWallet = null;
let provider = null;
let transactionQueue = Promise.resolve();
let transactionQueueList = [];
let transactionIdCounter = 0;
let nextNonceSepolia = null;
let nextNonceArbitrum = null;
let nextNoncePlume = null;
let nextNonceBSC = null;
let nextNonceMonad = null;
let nextNonceBaseSepolia = null;
let swapDirection = {
  "Sepolia": true,
  "Arbitrum Sepolia": true,
  "Plume": true,
  "BSC": true,
  "Monad": true,
  "Base Sepolia": true
};

function getShortAddress(address) {
  return address ? address.slice(0, 6) + "..." + address.slice(-4) : "N/A";
}

function getShortHash(hash) {
  return hash ? hash.slice(0, 6) + "..." + hash.slice(-4) : "N/A";
}

function addLog(message, type, network = currentNetwork) {
  if (type === "debug" && !DEBUG_MODE) return;
  const timestamp = new Date().toLocaleTimeString();
  let coloredMessage = message;
  if (type === "swap") coloredMessage = `{bright-cyan-fg}${message}{/bright-cyan-fg}`;
  else if (type === "system") coloredMessage = `{bright-white-fg}${message}{/bright-white-fg}`;
  else if (type === "error") coloredMessage = `{bright-red-fg}${message}{/bright-red-fg}`;
  else if (type === "success") coloredMessage = `{bright-green-fg}${message}{/bright-green-fg}`;
  else if (type === "warning") coloredMessage = `{bright-yellow-fg}${message}{/bright-yellow-fg}`;
  else if (type === "debug") coloredMessage = `{bright-magenta-fg}${message}{/bright-magenta-fg}`;

  transactionLogs.push(`{bright-cyan-fg}[{/bright-cyan-fg} {bold}{grey-fg}${timestamp}{/grey-fg}{/bold} {bright-cyan-fg}]{/bright-cyan-fg} {bold}[{grey-fg}${network}{/grey-fg}]{/bold}{bold} ${coloredMessage}{/bold}`);
  updateLogs();
}

function getRandomDelay() {
  return Math.random() * (60000 - 30000) + 30000;
}

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function updateLogs() {
  logsBox.setContent(transactionLogs.join("\n"));
  logsBox.setScrollPerc(100);
  safeRender();
}

function clearTransactionLogs() {
  transactionLogs = [];
  logsBox.setContent("");
  logsBox.setScroll(0);
  updateLogs();
  safeRender();
  addLog("Transaction logs telah dihapus.", "system", currentNetwork);
}

async function delayWithCancel(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return true;
}

async function waitWithCancel(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

async function addTransactionToQueue(transactionFunction, description = "Transaksi", network) {
  const transactionId = ++transactionIdCounter;
  transactionQueueList.push({
    id: transactionId,
    description,
    timestamp: new Date().toLocaleTimeString(),
    status: "queued"
  });
  addLog(`Transaksi [${transactionId}] ditambahkan ke antrean: ${description}`, "system", network || currentNetwork);
  updateQueueDisplay();

  transactionQueue = transactionQueue.then(async () => {
    updateTransactionStatus(transactionId, "processing");
    let normalizedNetwork; 
    let localProvider; 
    try {
      let config;
      normalizedNetwork = network; 
      if (!network) {
        normalizedNetwork = currentNetwork;
      }
      if (normalizedNetwork === "Sepolia" || normalizedNetwork === "Sepolia Testnet") {
        config = SEPOLIA_CONFIG;
        normalizedNetwork = "Sepolia";
      } else if (normalizedNetwork === "Arbitrum Sepolia" || normalizedNetwork === "Arbitrum Sepolia Testnet") {
        config = ARBITRUM_SEPOLIA_CONFIG;
        normalizedNetwork = "Arbitrum Sepolia";
      } else if (normalizedNetwork === "Plume" || normalizedNetwork === "Plume Network") {
        config = PLUME_CONFIG;
        normalizedNetwork = "Plume";
      } else if (normalizedNetwork === "BSC" || normalizedNetwork === "BSC Network") {
        config = BSC_CONFIG;
        normalizedNetwork = "BSC";
      } else if (normalizedNetwork === "Monad" || normalizedNetwork === "Monad Network") {
        config = MONAD_CONFIG;
        normalizedNetwork = "Monad";
      } else if (normalizedNetwork === "Base Sepolia" || normalizedNetwork === "Base Sepolia Testnet") {
        config = BASE_SEPOLIA_CONFIG;
        normalizedNetwork = "Base Sepolia";
      } else {
        throw new Error(`Jaringan tidak dikenal: ${normalizedNetwork || 'tidak diberikan'}`);
      }

      addLog(`NormalizedNetwork disetel ke: ${normalizedNetwork}`, "debug", normalizedNetwork);

      localProvider = new ethers.JsonRpcProvider(config.RPC_URL);
      const localWallet = new ethers.Wallet(process.env.PRIVATE_KEY, localProvider);

      let nextNonce;
      if (normalizedNetwork === "Sepolia") {
        if (nextNonceSepolia === null) {
          nextNonceSepolia = await localProvider.getTransactionCount(localWallet.address, "pending");
        }
        nextNonce = nextNonceSepolia;
      } else if (normalizedNetwork === "Arbitrum Sepolia") {
        if (nextNonceArbitrum === null) {
          nextNonceArbitrum = await localProvider.getTransactionCount(localWallet.address, "pending");
        }
        nextNonce = nextNonceArbitrum;
      } else if (normalizedNetwork === "Plume") {
        if (nextNoncePlume === null) {
          nextNoncePlume = await localProvider.getTransactionCount(localWallet.address, "pending");
        }
        nextNonce = nextNoncePlume;
      } else if (normalizedNetwork === "BSC") {
        if (nextNonceBSC === null) {
          nextNonceBSC = await localProvider.getTransactionCount(localWallet.address, "pending");
        }
        nextNonce = nextNonceBSC;
      } else if (normalizedNetwork === "Monad") {
        if (nextNonceMonad === null) {
          nextNonceMonad = await localProvider.getTransactionCount(localWallet.address, "pending");
        }
        nextNonce = nextNonceMonad;
      } else if (normalizedNetwork === "Base Sepolia") {
        if (nextNonceBaseSepolia === null) {
          nextNonceBaseSepolia = await localProvider.getTransactionCount(localWallet.address, "pending");
        }
        nextNonce = nextNonceBaseSepolia;
      }

      const tx = await transactionFunction(nextNonce, localWallet, localProvider, config);
      const txHash = tx.hash;
      addLog(`Transaksi Dikirim. Hash: ${getShortHash(txHash)}`, "warning", normalizedNetwork);
      const receipt = await tx.wait();
      if (normalizedNetwork === "Sepolia") nextNonceSepolia++;
      else if (normalizedNetwork === "Arbitrum Sepolia") nextNonceArbitrum++;
      else if (normalizedNetwork === "Plume") nextNoncePlume++;
      else if (normalizedNetwork === "BSC") nextNonceBSC++;
      else if (normalizedNetwork === "Monad") nextNonceMonad++;
      else if (normalizedNetwork === "Base Sepolia") nextNonceBaseSepolia++;

      if (receipt.status === 1) {
        updateTransactionStatus(transactionId, "completed");
        addLog(`Transaksi Selesai. Hash: ${getShortHash(receipt.transactionHash || txHash)}`, "success", normalizedNetwork);
      } else {
        updateTransactionStatus(transactionId, "failed");
        addLog(`Transaksi [${transactionId}] gagal: Transaksi ditolak oleh kontrak.`, "error", normalizedNetwork);
      }
      return { receipt, txHash, tx };
    } catch (error) {
      updateTransactionStatus(transactionId, "error");
      let errorMessage = error.message;
      if (error.code === "CALL_EXCEPTION") {
        errorMessage = `Transaksi ditolak oleh kontrak: ${error.reason || "Alasan tidak diketahui"}`;
      }
      addLog(`Transaksi [${transactionId}] gagal: ${errorMessage}`, "error", network || currentNetwork);
      if (error.message.includes("nonce has already been used")) {
        if (normalizedNetwork === "Sepolia") nextNonceSepolia++;
        else if (normalizedNetwork === "Arbitrum Sepolia") nextNonceArbitrum++;
        else if (normalizedNetwork === "Plume") nextNoncePlume++;
        else if (normalizedNetwork === "BSC") nextNonceBSC++;
        else if (normalizedNetwork === "Monad") nextNonceMonad++;
        else if (normalizedNetwork === "Base Sepolia") nextNonceBaseSepolia++;
      } else if (error.message.includes("nonce too high")) {
        const currentNonce = await localProvider.getTransactionCount(localWallet.address, "pending");
        if (normalizedNetwork === "Sepolia") nextNonceSepolia = currentNonce;
        else if (normalizedNetwork === "Arbitrum Sepolia") nextNonceArbitrum = currentNonce;
        else if (normalizedNetwork === "Plume") nextNoncePlume = currentNonce;
        else if (normalizedNetwork === "BSC") nextNonceBSC = currentNonce;
        else if (normalizedNetwork === "Monad") nextNonceMonad = currentNonce;
        else if (normalizedNetwork === "Base Sepolia") nextNonceBaseSepolia = currentNonce;
      }
      return null;
    } finally {
      removeTransactionFromQueue(transactionId);
      updateQueueDisplay();
    }
  });
  return transactionQueue;
}

function updateTransactionStatus(id, status) {
  transactionQueueList.forEach(tx => {
    if (tx.id === id) tx.status = status;
  });
  updateQueueDisplay();
}

function removeTransactionFromQueue(id) {
  transactionQueueList = transactionQueueList.filter(tx => tx.id !== id);
  updateQueueDisplay();
}

function getTransactionQueueContent() {
  if (transactionQueueList.length === 0) return "Tidak ada transaksi dalam antrean.";
  return transactionQueueList
    .map(tx => `ID: ${tx.id} | ${tx.description} | ${tx.status} | ${tx.timestamp}`)
    .join("\n");
}

let queueMenuBox = null;
let queueUpdateInterval = null;

function showTransactionQueueMenu() {
  const container = blessed.box({
    label: " Antrian Transaksi ",
    top: "10%",
    left: "center",
    width: "80%",
    height: "80%",
    border: { type: "line" },
    style: { border: { fg: "blue" } },
    keys: true,
    mouse: true,
    interactive: true
  });
  const contentBox = blessed.box({
    top: 0,
    left: 0,
    width: "100%",
    height: "90%",
    content: getTransactionQueueContent(),
    scrollable: true,
    keys: true,
    mouse: true,
    alwaysScroll: true,
    scrollbar: { ch: " ", inverse: true, style: { bg: "blue" } }
  });
  const exitButton = blessed.button({
    content: " [Keluar] ",
    bottom: 0,
    left: "center",
    shrink: true,
    padding: { left: 1, right: 1 },
    style: { fg: "white", bg: "red", hover: { bg: "blue" } },
    mouse: true,
    keys: true,
    interactive: true
  });
  exitButton.on("press", () => {
    addLog("Keluar Dari Menu Antrian Transaksi.", "system", currentNetwork);
    clearInterval(queueUpdateInterval);
    container.destroy();
    queueMenuBox = null;
    mainMenu.show();
    mainMenu.focus();
    screen.render();
  });
  container.key(["a", "s", "d"], () => {
    addLog("Keluar Dari Menu Antrian Transaksi.", "system", currentNetwork);
    clearInterval(queueUpdateInterval);
    container.destroy();
    queueMenuBox = null;
    mainMenu.show();
    mainMenu.focus();
    screen.render();
  });
  container.append(contentBox);
  container.append(exitButton);
  queueUpdateInterval = setInterval(() => {
    contentBox.setContent(getTransactionQueueContent());
    screen.render();
  }, 1000);
  mainMenu.hide();
  screen.append(container);
  container.focus();
  screen.render();
}

function updateQueueDisplay() {
  if (queueMenuBox) {
    queueMenuBox.setContent(getTransactionQueueContent());
    screen.render();
  }
}

const screen = blessed.screen({
  smartCSR: true,
  title: "R2 Auto Bot",
  fullUnicode: true,
  mouse: true
});

let renderTimeout;

function safeRender() {
  if (renderTimeout) clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => { screen.render(); }, 50);
}

const headerBox = blessed.box({
  top: 0,
  left: "center",
  width: "100%",
  tags: true,
  style: { fg: "white", bg: "default" }
});

figlet.text("ANAM".toUpperCase(), { font: "ANSI Shadow" }, (err, data) => {
  if (err) headerBox.setContent("{center}{bold}NT EXHAUST{/bold}{/center}");
  else headerBox.setContent(`{center}{bold}{bright-cyan-fg}${data}{/bright-cyan-fg}{/bold}{/center}`);
  safeRender();
});

const descriptionBox = blessed.box({
  left: "center",
  width: "100%",
  content: "{center}{bold}{grey-fg}________________________________________________________________________{/grey-fg}{/bold}{/center}",
  tags: true,
  style: { fg: "white", bg: "default" }
});

const logsBox = blessed.box({
  label: " Transaction Logs ",
  left: 0,
  border: { type: "line" },
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  keys: true,
  vi: true,
  tags: true,
  style: { border: { fg: "yellow" }, fg: "white" },
  scrollbar: { ch: " ", inverse: true, style: { bg: "blue" } },
  content: ""
});

const welcomeBox = blessed.box({
  label: " Dashboard ",
  border: { type: "line" },
  tags: true,
  style: { border: { fg: "cyan" }, fg: "white", bg: "default" },
  content: "{center}{bold}Initializing...{/bold}{/center}"
});

const walletBox = blessed.box({
  label: " Informasi Wallet ",
  border: { type: "line" },
  tags: true,
  style: { border: { fg: "magenta" }, fg: "white", bg: "default" },
  content: "Loading data wallet..."
});

walletBox.hide();

const mainMenu = blessed.list({
  label: " Menu ",
  left: "60%",
  keys: true,
  vi: true,
  mouse: true,
  border: { type: "line" },
  style: { fg: "white", bg: "default", border: { fg: "red" }, selected: { bg: "green", fg: "black" } },
  items: getMainMenItems()
});

function getMainMenItems() {
  let items = [];
  items = items.concat([
    "Run Auto Sequence",
    "Sepolia Network",
    "Arbitrum Sepolia Network",
    "Plume Network",
    "BSC Network",
    "Monad Network",
    "Base Sepolia Network",
    "Antrian Transaksi",
    "Clear Transaction Logs",
    "Refresh",
    "Exit"
  ]);
  return items;
}

function getSepoliaSubMenuItems() {
  let items = [];
  items = items.concat([
    "Auto Swap R2USD & USDC",
    "Auto Stake R2USD & sR2USD",
    "Auto Add LP R2USD & sR2USD",
    "Manual Swap",
    "Change Random Amount",
    "Clear Transaction Logs",
    "Back To Main Menu",
    "Refresh"
  ]);
  return items;
}

function getArbitrumSepoliaSubMenuItems() {
  let items = [];
  items = items.concat([
    "Auto Swap R2USD & USDC",
    "Auto Stake R2USD & sR2USD",
    "Auto Add LP R2USD & sR2USD",
    "Manual Swap",
    "Change Random Amount",
    "Clear Transaction Logs",
    "Back To Main Menu",
    "Refresh"
  ]);
  return items;
}

function getPlumeSubMenuItems() {
  let items = [];
  items = items.concat([
    "Auto Swap R2USD & USDC",
    "Auto Stake R2USD & sR2USD",
    "Auto Add LP R2USD & sR2USD",
    "Manual Swap",
    "Change Random Amount",
    "Clear Transaction Logs",
    "Back To Main Menu",
    "Refresh"
  ]);
  return items;
}

function getBscSubMenuItems() {
  let items = [];
  items = items.concat([
    "Auto Swap R2USD & USDC",
    "Auto Stake R2USD & sR2USD",
    "Manual Swap",
    "Change Random Amount",
    "Clear Transaction Logs",
    "Back To Main Menu",
    "Refresh"
  ]);
  return items;
}

function getMonadSubMenuItems() {
  let items = [];
  items = items.concat([
    "Auto Swap R2USD & USDC",
    "Auto Stake R2USD & sR2USD",
    "Manual Swap",
    "Change Random Amount",
    "Clear Transaction Logs",
    "Back To Main Menu",
    "Refresh"
  ]);
  return items;
}

function getBaseSepoliaSubMenuItems() {
  let items = [];
  items = items.concat([
    "Auto Swap R2USD & USDC",
    "Auto Stake R2USD & sR2USD",
    "Manual Swap",
    "Change Random Amount",
    "Clear Transaction Logs",
    "Back To Main Menu",
    "Refresh"
  ]);
  return items;
}

const promptBox = blessed.prompt({
  parent: screen,
  border: "line",
  height: 5,
  width: "60%",
  top: "center",
  left: "center",
  label: "{bright-blue-fg}Prompt{/bright-blue-fg}",
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  style: { fg: "bright-red", bg: "default", border: { fg: "red" } }
});

screen.append(headerBox);
screen.append(descriptionBox);
screen.append(logsBox);
screen.append(welcomeBox);
screen.append(walletBox);
screen.append(mainMenu);
screen.append(promptBox);

function updateWelcomeBox() {
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const botVersion = "V2.0.1";

  const content =
    `{center}{bold}{bright-red-fg}[:: R2 :: AUTO :: BOT ::]{/bright-red-fg}{/bold}{/center}\n\n` +
    `{center}{bold}{bright-yellow-fg}Version : ${botVersion}{/bright-yellow-fg}{/bold}{/center}\n` +
    `{center}{bold}{bright-cyan-fg}➥ Join Telegram : t.me/NTExhaust{/bright-cyan-fg}{/bold}{/center}\n` +
    `{center}{bold}{bright-cyan-fg}➥ Subscribe : Youtube.com/@NTExhaust{/bright-cyan-fg}{/bold}{/center}\n` +
    `{center}{bold}{grey-fg}Donate : saweria.co/vinsenzo{/grey-fg}{/bold}{/center}\n`;

  welcomeBox.setContent(content);
  safeRender();
}

function adjustLayout() {
  const screenHeight = screen.height;
  const screenWidth = screen.width;
  const headerHeight = Math.max(8, Math.floor(screenHeight * 0.15));
  headerBox.top = 0;
  headerBox.height = headerHeight;
  headerBox.width = "100%";
  descriptionBox.top = "23%";
  descriptionBox.height = Math.floor(screenHeight * 0.05);
  logsBox.top = headerHeight + descriptionBox.height;
  logsBox.left = 0;
  logsBox.width = Math.floor(screenWidth * 0.6);
  logsBox.height = screenHeight - (headerHeight + descriptionBox.height);
  welcomeBox.top = headerHeight + descriptionBox.height;
  welcomeBox.left = Math.floor(screenWidth * 0.6);
  welcomeBox.width = Math.floor(screenWidth * 0.4);
  welcomeBox.height = Math.floor(screenHeight * 0.35);
  walletBox.top = headerHeight + descriptionBox.height;
  walletBox.left = Math.floor(screenWidth * 0.6);
  walletBox.width = Math.floor(screenWidth * 0.4);
  walletBox.height = Math.floor(screenHeight * 0.35);
  mainMenu.top = headerHeight + descriptionBox.height + welcomeBox.height;
  mainMenu.left = Math.floor(screenWidth * 0.6);
  mainMenu.width = Math.floor(screenWidth * 0.4);
  mainMenu.height = screenHeight - (headerHeight + descriptionBox.height + welcomeBox.height);
  safeRender();
}

screen.on("resize", adjustLayout);
adjustLayout();

async function getTokenBalance(tokenAddress, provider, wallet) {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
    const balance = await contract.balanceOf(wallet.address);
    const decimals = await contract.decimals();
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    addLog(`Gagal mengambil saldo token ${tokenAddress}: ${error.message}`, "error", currentNetwork);
    return "0";
  }
}

async function updateWalletData(network) {
  addLog(`Debug: updateWalletData menerima network = ${network}`, "debug", network || currentNetwork);
  try {
    let config;
    let normalizedNetwork = network;
    if (network === "Sepolia" || network === "Sepolia Network" || network === "Sepolia Testnet") {
      config = SEPOLIA_CONFIG;
      normalizedNetwork = "Sepolia";
    } else if (network === "Arbitrum Sepolia" || network === "Arbitrum Sepolia Network" || network === "Arbitrum Sepolia Testnet") {
      config = ARBITRUM_SEPOLIA_CONFIG;
      normalizedNetwork = "Arbitrum Sepolia";
    } else if (network === "Plume" || network === "Plume Network" || network === "Plume Testnet") {
      config = PLUME_CONFIG;
      normalizedNetwork = "Plume";
    } else if (network === "BSC" || network === "BSC Network") {
      config = BSC_CONFIG;
      normalizedNetwork = "BSC";
    } else if (network === "Monad" || network === "Monad Network") {
      config = MONAD_CONFIG;
      normalizedNetwork = "Monad";
    } else if (network === "Base Sepolia" || network === "Base Sepolia Network" || network === "Base Sepolia Testnet") {
      config = BASE_SEPOLIA_CONFIG;
      normalizedNetwork = "Base Sepolia";
    } else {
      throw new Error(`Jaringan tidak dikenal: ${network || 'tidak diberikan'}`);
    }

    const localProvider = new ethers.JsonRpcProvider(config.RPC_URL, undefined, { timeout: 60000 });
    const localWallet = new ethers.Wallet(process.env.PRIVATE_KEY, localProvider);

    walletInfoByNetwork[normalizedNetwork].address = localWallet.address;

    const [nativeBalance, usdcBalance, r2usdBalance, sr2usdBalance] = await Promise.all([
      localProvider.getBalance(localWallet.address),
      getTokenBalance(config.USDC_ADDRESS, localProvider, localWallet),
      getTokenBalance(config.R2USD_ADDRESS, localProvider, localWallet),
      getTokenBalance(config.sR2USD_ADDRESS, localProvider, localWallet)
    ]);

    walletInfoByNetwork[normalizedNetwork].balanceNative = ethers.formatEther(nativeBalance);
    walletInfoByNetwork[normalizedNetwork].balanceUsdc = usdcBalance;
    walletInfoByNetwork[normalizedNetwork].balanceR2usd = r2usdBalance;
    walletInfoByNetwork[normalizedNetwork].balanceSr2usd = sr2usdBalance;

    if (normalizedNetwork !== "BSC" && normalizedNetwork !== "Monad" && normalizedNetwork !== "Base Sepolia") {
      const [lpR2usdSr2usdBalance, lpUsdcR2usdBalance] = await Promise.all([
        getTokenBalance(config.LP_R2USD_sR2USD, localProvider, localWallet),
        getTokenBalance(config.LP_USDC_R2USD, localProvider, localWallet)
      ]);
      walletInfoByNetwork[normalizedNetwork].balanceLpR2usdSr2usd = lpR2usdSr2usdBalance;
      walletInfoByNetwork[normalizedNetwork].balanceLpUsdcR2usd = lpUsdcR2usdBalance;
    }

    const currentNonce = await localProvider.getTransactionCount(localWallet.address, "pending");
    if (normalizedNetwork === "Sepolia") {
      nextNonceSepolia = currentNonce;
      addLog(`Nonce awal untuk Sepolia: ${nextNonceSepolia}`, "debug", normalizedNetwork);
    } else if (normalizedNetwork === "Arbitrum Sepolia") {
      nextNonceArbitrum = currentNonce;
      addLog(`Nonce awal untuk Arbitrum Sepolia: ${nextNonceArbitrum}`, "debug", normalizedNetwork);
    } else if (normalizedNetwork === "Plume") {
      nextNoncePlume = currentNonce;
      addLog(`Nonce awal untuk Plume: ${nextNoncePlume}`, "debug", normalizedNetwork);
    } else if (normalizedNetwork === "BSC") {
      nextNonceBSC = currentNonce;
      addLog(`Nonce awal untuk BSC: ${nextNonceBSC}`, "debug", normalizedNetwork);
    } else if (normalizedNetwork === "Monad") {
      nextNonceMonad = currentNonce;
      addLog(`Nonce awal untuk Monad: ${nextNonceMonad}`, "debug", normalizedNetwork);
    } else if (normalizedNetwork === "Base Sepolia") {
      nextNonceBaseSepolia = currentNonce;
      addLog(`Nonce awal untuk Base Sepolia: ${nextNonceBaseSepolia}`, "debug", normalizedNetwork);
    }

    walletInfoByNetwork[normalizedNetwork].network = config.NETWORK_NAME;
    walletInfoByNetwork[normalizedNetwork].status = "Ready";

    if (normalizedNetwork === currentNetwork) {
      updateWallet();
    }

    addLog("Wallet Information Updated !!", "system", normalizedNetwork);
  } catch (error) {
    if (error.code === "TIMEOUT") {
      addLog(`Timeout saat mencoba menghubungi RPC ${config.RPC_URL}. Coba lagi nanti.`, "error", network || currentNetwork);
    } else {
      addLog(`Gagal mengambil data wallet: ${error.message}`, "error", network || currentNetwork);
    }
  }
}

function updateWallet() {
  const walletInfo = walletInfoByNetwork[currentNetwork];
  const shortAddress = walletInfo.address ? getShortAddress(walletInfo.address) : "N/A";
  let nativeToken;
  if (walletInfo.network === "Monad Network") {
    nativeToken = "MON";
  } else if (walletInfo.network === "BSC Network") {
    nativeToken = "BNB";
  } else if (walletInfo.network === "Plume Network") {
    nativeToken = "Plume";
  } else {
    nativeToken = "ETH";
  }
  const nativeBalance = walletInfo.balanceNative ? Number(walletInfo.balanceNative).toFixed(4) : "0.0000";
  const usdc = walletInfo.balanceUsdc ? Number(walletInfo.balanceUsdc).toFixed(2) : "0.00";
  const r2usd = walletInfo.balanceR2usd ? Number(walletInfo.balanceR2usd).toFixed(4) : "0.0000";
  const sr2usd = walletInfo.balanceSr2usd ? Number(walletInfo.balanceSr2usd).toFixed(4) : "0.0000";
  const lpR2usdSr2usd = walletInfo.network === "BSC Network" || walletInfo.network === "Monad Network" || walletInfo.network === "Base Sepolia Testnet" ? "N/A" : (walletInfo.balanceLpR2usdSr2usd ? Number(walletInfo.balanceLpR2usdSr2usd).toFixed(4) : "0.0000");
  const lpUsdcR2usd = walletInfo.network === "BSC Network" || walletInfo.network === "Monad Network" || walletInfo.network === "Base Sepolia Testnet" ? "N/A" : (walletInfo.balanceLpUsdcR2usd ? Number(walletInfo.balanceLpUsdcR2usd).toFixed(4) : "0.0000");

  const content = `┌── Address   : {bright-yellow-fg}${shortAddress}{/bright-yellow-fg}
│   ├── ${nativeToken}           : {bright-green-fg}${nativeBalance}{/bright-green-fg}
│   ├── USDC            : {bright-green-fg}${usdc}{/bright-green-fg}
│   ├── R2USD           : {bright-green-fg}${r2usd}{/bright-green-fg}
│   ├── sR2USD          : {bright-green-fg}${sr2usd}{/bright-green-fg}
│   ├── LP R2USD-sR2USD : {bright-green-fg}${lpR2usdSr2usd}{/bright-green-fg}
│   └── LP USDC-R2USD   : {bright-green-fg}${lpUsdcR2usd}{/bright-green-fg}
└── Network        : {bright-cyan-fg}${walletInfo.network}{/bright-cyan-fg}`;
  walletBox.setContent(content);
  safeRender();
}

async function ensureApproval(tokenAddress, spender, amount, wallet, network) {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet);
  let allowance = await tokenContract.allowance(wallet.address, spender);
  addLog(`Allowance saat ini untuk ${spender}: ${ethers.formatUnits(allowance, 6)}`, "debug", network);
  allowance = BigInt(allowance.toString());
  const amountBigInt = BigInt(amount.toString());

  if (allowance < amountBigInt) {
    const approveAmount = ethers.parseUnits("1000000", 6);
    addLog(`Approving ${ethers.formatUnits(approveAmount, 6)} tokens untuk ${spender}`, "system", network);
    const approveTx = await tokenContract.approve(spender, approveAmount);
    await approveTx.wait();
    addLog(`Approval berhasil untuk ${spender}`, "success", network);
  } else {
    addLog(`Allowance cukup untuk ${spender}`, "debug", network);
  }
}

async function swapUsdcToR2usd(amountUsdc, nonce, wallet, provider, config) {
  const network = config.NETWORK_NAME;
  const amount = ethers.parseUnits(amountUsdc.toString(), 6);
  const routerContractAddress = config.ROUTER_USDC_TO_R2USD;

  const usdcContract = new ethers.Contract(config.USDC_ADDRESS, ERC20ABI, provider);
  let balance = await usdcContract.balanceOf(wallet.address);
  addLog(`Saldo USDC: ${ethers.formatUnits(balance, 6)}, Tipe: ${typeof balance}`, "debug", network);

  balance = BigInt(balance.toString());
  const amountBigInt = BigInt(amount.toString());

  if (balance < amountBigInt) {
    throw new Error(`Saldo USDC tidak cukup: ${ethers.formatUnits(balance, 6)} USDC`);
  }

  await ensureApproval(config.USDC_ADDRESS, routerContractAddress, amount, wallet, network);

  const methodId = "0x095e7a95";
  const data = ethers.concat([
    methodId,
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
      [wallet.address, amount, 0, 0, 0, 0, 0]
    ),
  ]);

  addLog(`Data transaksi: ${data}`, "debug", network);

  const tx = await wallet.sendTransaction({
    to: routerContractAddress,
    data: data,
    gasLimit: 500000,
    nonce: nonce,
  });

  return tx;
}

async function autoStakeR2usdSr2usd(amountR2usd, nonce, wallet, provider, config) {
  const network = config.NETWORK_NAME;
  const amount = parseFloat(amountR2usd);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Jumlah R2USD harus lebih besar dari 0");
  }

  const amountWei = ethers.parseUnits(amount.toString(), 6);
  const stakingContractAddress = config.STAKING_CONTRACT;

  const r2usdContract = new ethers.Contract(config.R2USD_ADDRESS, ERC20ABI, provider);
  let balance = await r2usdContract.balanceOf(wallet.address);
  addLog(`Saldo R2USD: ${ethers.formatUnits(balance, 6)}, Tipe: ${typeof balance}`, "debug", network);

  balance = BigInt(balance.toString());
  const amountBigInt = BigInt(amountWei.toString());

  if (balance < amountBigInt) {
    throw new Error(`Saldo R2USD tidak cukup: ${ethers.formatUnits(balance, 6)} R2USD`);
  }

  await ensureApproval(config.R2USD_ADDRESS, stakingContractAddress, amountWei, wallet, network);

  const methodId = "0x1a5f0f00";
  const data = ethers.concat([
    methodId,
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256", "uint256", "uint256", "uint8", "uint256", "uint256"],
      [amountWei, 0, 0, 0, 0, 0]
    ),
  ]);

  addLog(`Data transaksi: ${data}`, "debug", network);

  const tx = await wallet.sendTransaction({
    to: stakingContractAddress,
    data: data,
    gasLimit: 100000,
    nonce: nonce,
  });

  return tx;
}

async function autoAddLpR2usdSr2usd(amountR2usd, nonce, wallet, provider, config) {
  if (!config) {
    throw new Error("Config tidak didefinisikan");
  }
  const network = config.NETWORK_NAME;
  addLog(`Menambahkan LP untuk ${amountR2usd} R2USD`, "debug", network);
  const amount = parseFloat(amountR2usd);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Jumlah R2USD harus lebih besar dari 0");
  }

  const amountWei = ethers.parseUnits(amount.toString(), 6);
  const amountSr2usdWei = amountWei;
  const lpContractAddress = config.LP_R2USD_sR2USD;

  const r2usdContract = new ethers.Contract(config.R2USD_ADDRESS, ERC20ABI, provider);
  const sr2usdContract = new ethers.Contract(config.sR2USD_ADDRESS, ERC20ABI, provider);

  let balanceR2usd = await r2usdContract.balanceOf(wallet.address);
  let balanceSr2usd = await sr2usdContract.balanceOf(wallet.address);

  addLog(`Saldo R2USD: ${ethers.formatUnits(balanceR2usd, 6)}`, "debug", network);
  addLog(`Saldo sR2USD: ${ethers.formatUnits(balanceSr2usd, 6)}`, "debug", network);

  balanceR2usd = BigInt(balanceR2usd.toString());
  balanceSr2usd = BigInt(balanceSr2usd.toString());
  const amountBigInt = BigInt(amountWei.toString());

  if (balanceR2usd < amountBigInt) {
    throw new Error(`Saldo R2USD tidak cukup: ${ethers.formatUnits(balanceR2usd, 6)} R2USD`);
  }
  if (balanceSr2usd < amountBigInt) {
    throw new Error(`Saldo sR2USD tidak cukup: ${ethers.formatUnits(balanceSr2usd, 6)} sR2USD`);
  }

  await ensureApproval(config.R2USD_ADDRESS, lpContractAddress, amountWei, wallet, network);
  await ensureApproval(config.sR2USD_ADDRESS, lpContractAddress, amountSr2usdWei, wallet, network);

  const lpContract = new ethers.Contract(lpContractAddress, LP_CONTRACT_ABI, provider);
  let estimatedLpTokens;
  try {
    estimatedLpTokens = await lpContract.calc_token_amount([amountSr2usdWei, amountWei], true);
    addLog(`Estimasi LP token: ${ethers.formatUnits(estimatedLpTokens, 18)}`, "debug", network);
  } catch (error) {
    addLog(`Gagal mengestimasi LP token: ${error.message}, menggunakan _min_mint_amount=0`, "warning", network);
    estimatedLpTokens = 0;
  }

  const slippageTolerance = 0.99;
  const minMintAmount = estimatedLpTokens === 0 ? 0 : BigInt(Math.floor(Number(estimatedLpTokens) * slippageTolerance));

  const lpContractWithSigner = lpContract.connect(wallet);
  const txData = await lpContractWithSigner.add_liquidity.populateTransaction(
    [amountSr2usdWei, amountWei],
    minMintAmount,
    wallet.address
  );

  addLog(`Data transaksi: ${txData.data}`, "debug", network);

  const tx = await wallet.sendTransaction({
    to: lpContractAddress,
    data: txData.data,
    gasLimit: 250000,
    nonce: nonce,
  });

  return tx;
}

async function autoRunSequence() {
  addLog("Memulai urutan transaksi otomatis...", "system");
  
  const networks = [
    "Sepolia", 
    "Arbitrum Sepolia", 
    "Plume", 
    "BSC", 
    "Monad", 
    "Base Sepolia"
  ];
  
  for (const network of networks) {
    addLog(`Memproses jaringan: ${network}`, "system", network);
    
    // Untuk Sepolia, Arbitrum, Plume
    if (network === "Sepolia" || network === "Arbitrum Sepolia" || network === "Plume") {
      try {
        // Manual Swap USDC -> R2USD 500
        addLog(`Melakukan Manual Swap USDC -> R2USD 500 di ${network}`, "swap", network);
        await addTransactionToQueue(
          (nonce, wallet, provider, config) => swapUsdcToR2usd(1000, nonce, wallet, provider, config),
          `Manual Swap 1000 USDC to R2USD`,
          network
        );
        await delayWithCancel(15000); // Jeda 15 detik
        
        // Auto Stake R2USD 500
        addLog(`Melakukan Auto Stake 500 R2USD di ${network}`, "swap", network);
        await addTransactionToQueue(
          (nonce, wallet, provider, config) => autoStakeR2usdSr2usd(500, nonce, wallet, provider, config),
          `Auto Stake 500 R2USD`,
          network
        );
        await delayWithCancel(15000); // Jeda 15 detik
        
        // Auto Add LP R2USD & sR2USD 500
        addLog(`Melakukan Auto Add LP R2USD & sR2USD 500 di ${network}`, "swap", network);
        await addTransactionToQueue(
          (nonce, wallet, provider, config) => autoAddLpR2usdSr2usd(500, nonce, wallet, provider, config),
          `Auto Add LP R2USD & sR2USD 500`,
          network
        );
        await delayWithCancel(15000); // Jeda 15 detik
        
      } catch (error) {
        addLog(`Gagal memproses ${network}: ${error.message}`, "error", network);
      }
    }
    // Untuk BSC, Monad, Base Sepolia
    else if (network === "BSC" || network === "Monad" || network === "Base Sepolia") {
      try {
        // Manual Swap USDC -> R2USD 1000
        addLog(`Melakukan Manual Swap USDC -> R2USD 1000 di ${network}`, "swap", network);
        await addTransactionToQueue(
          (nonce, wallet, provider, config) => swapUsdcToR2usd(1000, nonce, wallet, provider, config),
          `Manual Swap 1000 USDC to R2USD`,
          network
        );
        await delayWithCancel(15000); // Jeda 15 detik
        
        // Auto Stake R2USD 1000
        addLog(`Melakukan Auto Stake 1000 R2USD di ${network}`, "swap", network);
        await addTransactionToQueue(
          (nonce, wallet, provider, config) => autoStakeR2usdSr2usd(1000, nonce, wallet, provider, config),
          `Auto Stake 1000 R2USD`,
          network
        );
        await delayWithCancel(15000); // Jeda 15 detik
        
      } catch (error) {
        addLog(`Gagal memproses ${network}: ${error.message}`, "error", network);
      }
    }
    
    // Update wallet data setelah selesai
    await updateWalletData(network);
    await delayWithCancel(5000); // Jeda 5 detik antar jaringan
  }
  
  addLog("Semua urutan transaksi selesai!", "success");
}

mainMenu.on("select", (item) => {
  const selected = item.getText();
  if (selected === "Run Auto Sequence") {
    autoRunSequence();
  } else if (selected === "Sepolia Network") {
    currentNetwork = "Sepolia";
    welcomeBox.hide();
    walletBox.show();
    updateWalletData("Sepolia");
    mainMenu.hide();
    safeRender();
  } else if (selected === "Arbitrum Sepolia Network") {
    currentNetwork = "Arbitrum Sepolia";
    welcomeBox.hide();
    walletBox.show();
    updateWalletData("Arbitrum Sepolia");
    mainMenu.hide();
    safeRender();
  } else if (selected === "Plume Network") {
    currentNetwork = "Plume";
    welcomeBox.hide();
    walletBox.show();
    updateWalletData("Plume");
    mainMenu.hide();
    safeRender();
  } else if (selected === "BSC Network") {
    currentNetwork = "BSC";
    welcomeBox.hide();
    walletBox.show();
    updateWalletData("BSC");
    mainMenu.hide();
    safeRender();
  } else if (selected === "Monad Network") {
    currentNetwork = "Monad";
    welcomeBox.hide();
    walletBox.show();
    updateWalletData("Monad");
    mainMenu.hide();
    safeRender();
  } else if (selected === "Base Sepolia Network") {
    currentNetwork = "Base Sepolia";
    welcomeBox.hide();
    walletBox.show();
    updateWalletData("Base Sepolia");
    mainMenu.hide();
    safeRender();
  } else if (selected === "Antrian Transaksi") {
    showTransactionQueueMenu();
  } else if (selected === "Clear Transaction Logs") {
    clearTransactionLogs();
  } else if (selected === "Refresh") {
    updateWelcomeBox();
    updateWalletData(currentNetwork);
    safeRender();
    addLog("Refreshed", "system", currentNetwork);
  } else if (selected === "Exit") {
    process.exit(0);
  }
});

screen.key(["escape", "q", "C-c"], () => {
  process.exit(0);
});
screen.key(["C-up"], () => { logsBox.scroll(-1); safeRender(); });
screen.key(["C-down"], () => { logsBox.scroll(1); safeRender(); });

safeRender();
mainMenu.focus();
addLog("Dont Forget To Subscribe YT And Telegram @NTExhaust!!", "system");
updateWelcomeBox();
