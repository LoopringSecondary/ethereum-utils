var _ = require("lodash");
var Promise = require("bluebird");
var fs = require("fs");
var lineReader = require("line-reader");
var async = require("async");

var Web3 = require("web3"); // tslint:disable-line
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8546"));

const lrcAbi = '[{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"bonusPercentages","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"DECIMALS","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"BLOCKS_PER_PHASE","outputs":[{"name":"","type":"uint16"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"MAX_UNSOLD_RATIO","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"HARD_CAP","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"BASE_RATE","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"close","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"saleStarted","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"issueIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"recipient","type":"address"}],"name":"issueToken","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_firstblock","type":"uint256"}],"name":"start","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"hardCapReached","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"saleEnded","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"unsoldTokenIssued","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"price","outputs":[{"name":"tokens","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"GOAL","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"NAME","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalEthReceived","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"saleDue","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"target","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"NUM_OF_PHASE","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"firstblock","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"SYMBOL","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"inputs":[{"name":"_target","type":"address"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[],"name":"SaleStarted","type":"event"},{"anonymous":false,"inputs":[],"name":"SaleEnded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"caller","type":"address"}],"name":"InvalidCaller","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"msg","type":"bytes"}],"name":"InvalidState","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"issueIndex","type":"uint256"},{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"ethAmount","type":"uint256"},{"indexed":false,"name":"tokenAmount","type":"uint256"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[],"name":"SaleSucceeded","type":"event"},{"anonymous":false,"inputs":[],"name":"SaleFailed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]'; // tslint:disable-line

const LrcContract = web3.eth.contract(JSON.parse(lrcAbi));
const lrcAddr = "0xEF68e7C694F40c8202821eDF525dE3782458639f";
const lrcToken = LrcContract.at(lrcAddr);

const eachLine = Promise.promisify(lineReader.eachLine);

// global variables:
const lrcAmount = 2 * 1e18;
const minTokenBalance = 0;
const maxTokenBalance = 0;
const minEthBalance = 1 * 1e17;
const maxEthBalance = 10000 * 1e18;

async function parseTokenInfo() {
  const tokenInfos = [];
  await eachLine(tokensFile, function(line) {
    const fields = line.split(/\ +/);
    if (fields.length >= 4) {
      tokenInfos.push(fields);
    }
  });

  return tokenInfos;
}

async function collectCandidateAddresses() {
  const currentBlockNumber = web3.eth.blockNumber;
  const fromBlockNumber = 4588600; //currentBlockNumber - 100000;
  const toBlockNumber =  currentBlockNumber;
  console.log("fromBlockNumber:", fromBlockNumber, "toBlockNumber", toBlockNumber);

  var fileName = "addresses";
  const ts = new Date().getTime();
  fileName = fileName + "." + fromBlockNumber + "-" + toBlockNumber;
  console.log("res file: ", fileName);
  const blocks = _.range(fromBlockNumber, toBlockNumber);

  const qulitifiedSet = await loadFinishedAddrs();
  console.log("qulitifiedSet size at begining:", qulitifiedSet.size);
  const resultList = [];
  let lastInd = 0;
  async.eachLimit(blocks, 10, function(i, callback){
    console.log("process block:", i);
    const addresses = new Set();
    web3.eth.getBlock(i, true, function(error, result){
      if(!error) {
        result.transactions.forEach(tx => {
          addresses.add(tx.from);
        });

        console.log("addresses size:", addresses.size);
        async.eachLimit(addresses, 20, function(addr){
          if (isQulitifiedAddress (addr)) {
            if (!qulitifiedSet.has(addr)) {
              qulitifiedSet.add(addr);
              resultList.push(addr);
            }
          }
        });

        const len = resultList.length;
        console.log("qulitifiedSet count:", len);
        if (i % 100 == 0) {
          console.log("write to file");
          writeSetToFile(resultList.slice(lastInd, len), fileName);
          lastInd = len;
        }
        callback();
      }
    });

  });

}

async function loadFinishedAddrs() {
  const finishedFile = "addr-uniq-1203";
  var res = [];
  await eachLine(finishedFile, function(line){
    if (line && line.substring(0, 2) === "0x") {
        res.push(line);
    }
  });

  return new Set(res);
}

function writeSetToFile(resSet, fileName) {
  resSet.forEach(addr => {
    fs.appendFileSync(fileName, addr + "\n");
  });
}

function isQulitifiedAddress(addr) {
  var res = true;
  res = res && web3.isAddress(addr);
  const ethBalance = web3.eth.getBalance(addr);
  const ethBalanceNumber = ethBalance.toNumber();
  res = res && (ethBalanceNumber >= minEthBalance && ethBalanceNumber <= maxEthBalance);

  // const lrcBalance = lrcToken.balanceOf(addr);
  // const lrcBalanceNumber = lrcBalance.toNumber();

  // res = res && (lrcBalanceNumber >= minTokenBalance && lrcBalanceNumber <= maxTokenBalance);

  return res;
}

function getQulifiedAddresses(batchAddresses) {
  var res = [];
  for (let addr of batchAddresses) {
    if (isQulitifiedAddress) {
      res.push(addr);
    }
  }
  return res;
}

collectCandidateAddresses();
