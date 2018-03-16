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

const airdropAbi = '[{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"amount","type":"uint256"},{"name":"minTokenBalance","type":"uint256"},{"name":"maxTokenBalance","type":"uint256"},{"name":"minEthBalance","type":"uint256"},{"name":"maxEthBalance","type":"uint256"},{"name":"recipients","type":"address[]"}],"name":"drop","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"token","type":"address"},{"name":"addr","type":"address"},{"name":"minTokenBalance","type":"uint256"},{"name":"maxTokenBalance","type":"uint256"},{"name":"minEthBalance","type":"uint256"},{"name":"maxEthBalance","type":"uint256"}],"name":"isQualitifiedAddress","outputs":[{"name":"result","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"AirDropped","type":"event"}]'; // tslint:disable-line
const AirdropContract = web3.eth.contract(JSON.parse(airdropAbi));
const airdropContractAddr = "0x9b3912Ab0eF08A772A097340400bA6a471e8De57";

const eachLine = Promise.promisify(lineReader.eachLine);

// global variables:
const lrcAmount = 5 * 1e18;
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

function collectCandidateAddresses() {
  const currentBlockNumber = web3.eth.blockNumber;
  const fromBlockNumber = currentBlockNumber - 100000;
  const toBlockNumber = currentBlockNumber - 10000;
  console.log("fromBlockNumber:", fromBlockNumber, "toBlockNumber", toBlockNumber);

  var fileName = "addresses";
  const ts = new Date().getTime();
  fileName = fileName + "." + fromBlockNumber + "-" + toBlockNumber;
  const blocks = _.range(fromBlockNumber, toBlockNumber);
  async.eachSeries(blocks, function(i, callback){
    console.log("process block:", i);
    const addresses = new Set();
    web3.eth.getBlock(i, true, function(error, result){
      if(!error) {
        result.transactions.forEach(tx => {
          addresses.add(tx.from);
        });

        console.log("addresses size:", addresses.size);
        const qulitifiedSet = new Set();
        async.eachLimit(addresses, 10, function(addr){
          if (isQulitifiedAddress (addr)) {
            qulitifiedSet.add(addr);
          }
        });

        console.log("qulitifiedSet:", qulitifiedSet.size);
        writeSetToFile(qulitifiedSet, fileName);
        callback();
      }
    });

  });
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

  // const lrcBalance = yield lrcToken.balanceOf(addr);
  // const lrcBalanceNumber = lrcBalance.toNumber();

  // res = res && (lrcBalanceNumber >= minTokenBalance && lrcBalanceNumber <= maxTokenBalance);
  return res;
}

async function readAddressFromFile(fileName) {
  var res = [];
  await eachLine(fileName, function(line){
    if (line && line.substring(0, 2) === "0x") {
        res.push(line);
    }
  });

  return res;
}

async function parseAddressFile(fileName, exculdFile) {
  var exculdList = [];
  await eachLine(exculdFile, function(line){
    if (line && line.substring(0, 2) === "0x") {
      exculdList.push(line);
    }
  });

  var exculdSet = new Set(exculdList);

  var res = [];
  await eachLine(fileName, function(line){
    if (line && line.substring(0, 2) === "0x") {
      if (!exculdSet.has(line)) {
        res.push(line);
      }
    }
  });

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

async function approve() {
  const fromAddr = "0x6d4ee35d70ad6331000e370f079ad7df52e75005";
  const airdropContractInstance = AirdropContract.at(airdropContractAddr);
  await lrcToken.approve(airdropContractAddr, 0, {from: fromAddr});
  await lrcToken.approve(airdropContractAddr, 200000e18, {from: fromAddr});
}

async function processAddress() {
  const allRecipients = await parseAddressFile("./addresses-all.1203", "lrcHoldersAddresses.csv");
  console.log("allRecipients:", allRecipients.length);
  writeSetToFile(allRecipients, "./addr-uniq-1203");
}

async function main() {
  const fromAddr = "0x6d4ee35d70ad6331000e370f079ad7df52e75005";
  const airdropContractInstance = AirdropContract.at(airdropContractAddr);
  const allRecipients = await readAddressFromFile("./addr-droped-1203");
  const batchSize = 100;
  console.log("allRecipients:", allRecipients.length, "; batchSize:", batchSize);

  const start = 6;
  // const end = 6;
  const end = Math.ceil(allRecipients.length / batchSize);

  console.log("start:", start, "; end:", end);

  for (var i = start; i < end; i ++) {
    const batchRecipients = allRecipients.slice(i * batchSize, (i + 1) * batchSize);
    const qulifiedRecipients = await getQulifiedAddresses(batchRecipients);
    console.log("qulifiedRecipients length:", qulifiedRecipients.length);
    await airdropContractInstance.drop(lrcAddr,
                                       lrcAmount,
                                       minTokenBalance,
                                       maxTokenBalance,
                                       minEthBalance,
                                       maxEthBalance,
                                       qulifiedRecipients,
                                       {from: fromAddr,
                                        gas: 4500000,
                                        gasLimit: 4500000,
                                        gasPrice: 1110000000
                                       });
    console.log("batch", i , "finished.");
  }

}

// processAddress();

// approve();

main();

// collectCandidateAddresses();
