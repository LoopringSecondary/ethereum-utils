const request = require("request-promise");
const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/hM4sFGiBdqbnGTxk5YT2"));
const lrcAbi = '[{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"bonusPercentages","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"DECIMALS","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"BLOCKS_PER_PHASE","outputs":[{"name":"","type":"uint16"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"MAX_UNSOLD_RATIO","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"HARD_CAP","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"BASE_RATE","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"close","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"saleStarted","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"issueIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"recipient","type":"address"}],"name":"issueToken","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_firstblock","type":"uint256"}],"name":"start","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"hardCapReached","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"saleEnded","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"unsoldTokenIssued","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"price","outputs":[{"name":"tokens","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"GOAL","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"NAME","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalEthReceived","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"saleDue","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"target","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"NUM_OF_PHASE","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"firstblock","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"SYMBOL","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"inputs":[{"name":"_target","type":"address"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[],"name":"SaleStarted","type":"event"},{"anonymous":false,"inputs":[],"name":"SaleEnded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"caller","type":"address"}],"name":"InvalidCaller","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"msg","type":"bytes"}],"name":"InvalidState","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"issueIndex","type":"uint256"},{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"ethAmount","type":"uint256"},{"indexed":false,"name":"tokenAmount","type":"uint256"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[],"name":"SaleSucceeded","type":"event"},{"anonymous":false,"inputs":[],"name":"SaleFailed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]'; // tslint:disable-line

const lrcAddr = "0xEF68e7C694F40c8202821eDF525dE3782458639f";
const lrcToken = new web3.eth.Contract(JSON.parse(lrcAbi), lrcAddr);

const targetProjectId = 1;
let resultFile = "eth-neo-binding.csv";
const lrcHoldersFile = "lrc-holders";
const bindingStartBlock = 5104000;
const DEST_BLOCK = 5850000;

const bindingMap = new Map();
const invalidBindingMap = new Map();
const lrcBalanceMap = new Map();

function parseBindingEvents(response) {
  const result = [];
  if (response.result && response.result.length > 0) {
    for (const item of response.result) {
      const data = item.data;
      try {
        const ethAddr = bytes32ToAddress(data.slice(0, 66));
        const projectId = parseInt(data.slice(66, 130), 16);
        let targetAddr = data.slice(258);
        // console.log("targetAddr before:", targetAddr);
        targetAddr = web3.utils.toAscii("0x" + targetAddr);
        if (projectId !== targetProjectId) {
          console.log("ProjectId is", projectId, ", skip.");
          continue;
        }
        // console.log(ethAddr, targetAddr);
        result.push([ethAddr, targetAddr, item.transactionHash]);
      } catch (err) {
        console.log(err);
        continue;
      }
    }
  }

  return result;
}

function bytes32ToAddress(str) {
  return "0x" + str.slice(26);
}

async function crawlBindings() {
  const url = getBindingEventUrl();
  console.log(url);
  const responseStr = await request(url);
  const respObj = JSON.parse(responseStr);
  if (!respObj || !respObj.result || respObj.result.length === 0) {
    console.log("Error:empty respose");
    return;
  }

  const events = await parseBindingEvents(respObj);
  for (const event of events) {
    if (bindingMap.has(event[0])) {
      console.log("WARN:", event[0], "has already been binded. will override by:", event[1]);
    }
    if (event[1].length != 34) {
      console.log("ERROR: invalid target address:", event[1], " tx:", event[2]);
      invalidBindingMap.set(event[0], event[1]);
      continue;
    }
    bindingMap.set(event[0], event[1]);
  }
}

function getBindingEventUrl(pageNo) {
  return "https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=4000000&toBlock=latest\
&address=0xbf78B6E180ba2d1404c92Fc546cbc9233f616C42\
&topic0=0xa3223ad9ca9b61a866c910b0751d38f78fe7962d9baecf76400dee74eea33ba2"
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
  // await getAllLrcHolderBalances();
  writeResultToFile();
}

main();
