const request = require("request-promise");
const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/hM4sFGiBdqbnGTxk5YT2"));
const lrcAbi = '[{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"bonusPercentages","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"DECIMALS","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"BLOCKS_PER_PHASE","outputs":[{"name":"","type":"uint16"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"MAX_UNSOLD_RATIO","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"HARD_CAP","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"BASE_RATE","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"close","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"saleStarted","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"issueIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"recipient","type":"address"}],"name":"issueToken","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_firstblock","type":"uint256"}],"name":"start","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"hardCapReached","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"saleEnded","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"unsoldTokenIssued","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"price","outputs":[{"name":"tokens","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"GOAL","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"NAME","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalEthReceived","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"saleDue","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"target","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"NUM_OF_PHASE","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"firstblock","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"SYMBOL","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"inputs":[{"name":"_target","type":"address"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[],"name":"SaleStarted","type":"event"},{"anonymous":false,"inputs":[],"name":"SaleEnded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"caller","type":"address"}],"name":"InvalidCaller","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"msg","type":"bytes"}],"name":"InvalidState","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"issueIndex","type":"uint256"},{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"ethAmount","type":"uint256"},{"indexed":false,"name":"tokenAmount","type":"uint256"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[],"name":"SaleSucceeded","type":"event"},{"anonymous":false,"inputs":[],"name":"SaleFailed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]'; // tslint:disable-line

const lrcAddr = "0xEF68e7C694F40c8202821eDF525dE3782458639f";
const lrcToken = new web3.eth.Contract(JSON.parse(lrcAbi), lrcAddr);

const targetProjectId = "1";
let resultFile = "eth-neo-binding.csv";
const lrcHoldersFile = "lrc-holders";
const bindingStartBlock = 5104000;
const DEST_BLOCK = 5850000;

const bindingMap = new Map();
const invalidBindingMap = new Map();
const lrcBalanceMap = new Map();

function parseBindingPairs(response) {
  const result = [];
  if (response.result && response.result.length > 0) {
    for (const item of response.result) {
      if (item.isError !== "0") continue;
      const ethAddr = item.from;
      const input = item.input;
      const params = input.slice(10);
      try {
        const decoded = web3.eth.abi.decodeParameters(["uint8", "string"], params);
        const [projectId, targetAddr] = [decoded[0], decoded[1]];
        if (projectId !== targetProjectId) {
          console.log("ProjectId is", projectId, ", skip.");
          continue;
        }
        result.push([ethAddr, targetAddr]);
      } catch (err) {
        console.log(err);
        continue;
      }
    }
  }

  return result;
}

async function crawlBindings() {
  for(let i = 1; i < 2 ; i++) {
    const url = getBindingTxPagedUrl(i);
    console.log(url);
    const responseStr = await request(url);
    const respObj = JSON.parse(responseStr);
    if (!respObj || !respObj.result || respObj.result.length === 0) {
      console.log("empty respose, stop crawling binding pages. pageNo:", i);
      break;
    }

    const pairs = await parseBindingPairs(respObj);
    for (const pair of pairs) {
      if (bindingMap.has(pair[0])) {
        console.log("WARN:", pair[0], "has already been binded. will override by:", pair[1]);
      }
      if (pair[1].length != 34) {
        console.log("ERROR: invalid target address:", pair[1]);
        invalidBindingMap.set(pair[0], pair[1]);
        continue;
      }
      bindingMap.set(pair[0], pair[1]);
    }
  }
}

function getBindingTxPagedUrl(pageNo) {
  return "https://api.etherscan.io/api?\
module=account&action=txlist&\
address=0xbf78B6E180ba2d1404c92Fc546cbc9233f616C42&\
startblock=5104000&endblock=9999999&page=" +
    pageNo + "&offset=50&sort=asc&apiKey=1F73WEV5ZM2HKPIVCG65U5QQ427NPUG9FI";
}

async function getAllLrcHolderBalances() {
  const keys = [...bindingMap.keys()];
  for (const key of keys) {
    console.log("query balance for address:", key);
    const balance = await lrcToken.methods.balanceOf(key).call(DEST_BLOCK);
    const balanceInt = Math.floor(balance/1e18);
    lrcBalanceMap.set(key, balanceInt);
  }
}

function writeResultToFile() {
  const keys = [...bindingMap.keys()];
  const secs = Math.floor(new Date().getTime() / 1000);
  resultFile = resultFile + "." + secs;

  const resultTupple = keys.map((key) => [key, bindingMap.get(key), lrcBalanceMap.get(key)]);
  const sorter = (a, b) => {
    if (a[2] >= b[2]) return -1;
    else return 1;
  };
  resultTupple.sort(sorter);

  resultTupple.forEach((item) => {
    fs.appendFileSync(resultFile, item[0] + "," + item[1] + "," + item[2] + "\n");
  });
}

async function main() {
  var args = process.argv.slice(2);

  let fromBlock = bindingStartBlock;
  if (args && args.length > 0) {
    const newFromBlock = args[0];
    if (newFromBlock > fromBlock) {
      fromBlock = newFromBlock;
    }
  }

  await crawlBindings();
  await getAllLrcHolderBalances();
  writeResultToFile();
}

main();
