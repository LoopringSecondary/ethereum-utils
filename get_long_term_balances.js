const request = require("request-promise");
const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/hM4sFGiBdqbnGTxk5YT2"));
const longTermAbi = '[{"constant":true,"inputs":[],"name":"WITHDRAWAL_DELAY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lrcBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"withdrawId","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_lrcWithdrawalBase","type":"uint256"}],"name":"getBonus","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lrcTokenAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"depositStartTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdrawLRC","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"depositStopTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"depositId","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"drain","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"lrcDeposited","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"WITHDRAWAL_SCALE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"start","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"DRAIN_DELAY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"depositLRC","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"DEPOSIT_PERIOD","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_lrcTokenAddress","type":"address"},{"name":"_owner","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_time","type":"uint256"}],"name":"Started","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_lrcAmount","type":"uint256"}],"name":"Drained","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_depositId","type":"uint256"},{"indexed":true,"name":"_addr","type":"address"},{"indexed":false,"name":"_lrcAmount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_withdrawId","type":"uint256"},{"indexed":true,"name":"_addr","type":"address"},{"indexed":false,"name":"_lrcAmount","type":"uint256"}],"name":"Withdrawal","type":"event"}]';

const longTermAddr = "0x239dE3a0D6ca5f21601f83327eA2174225eB7156";
const longTermContract = new web3.eth.Contract(JSON.parse(longTermAbi), longTermAddr);

const resultFile = "long-term-lrc-amount.csv";

const lrcBalanceMap = new Map();

function parseResponse(response) {
  const result = [];
  if (response.result && response.result.length > 0) {
    for (const item of response.result) {
      let addr = item.topics[1];
      addr = "0x" + addr.slice(26);
      let data = item.data;
      data = data.slice(66);
      let num = parseInt(data, 16);
      num = num / 1e18;
      num = Math.floor(num);
      result.push([addr, num]);
    }
  }
  return result;
}

async function crawl() {
  const url = longTermDepositeEventUrl();
  console.log(url);

  const responseStr = await request(url);
  const respObj = JSON.parse(responseStr);
  const pairs = parseResponse(respObj);
  for (const pair of pairs) {
    let _amount = Number(pair[1]);
    if (lrcBalanceMap.has(pair[0])) {
      _amount += lrcBalanceMap.get(pair[0]);
    }
    lrcBalanceMap.set(pair[0], _amount);
  }

  writeResultToFile();
}

function longTermDepositeEventUrl() {
  return "https://api.etherscan.io/api?module=logs&action=getLogs\
&fromBlock=4104040\
&toBlock=latest\
&address=" +
    longTermAddr + "&topic0=0xeaa18152488ce5959073c9c79c88ca90b3d96c00de1f118cfaad664c3dab06b9\
&apiKey=1F73WEV5ZM2HKPIVCG65U5QQ427NPUG9FI";
}

function writeResultToFile() {
  const keys = [...lrcBalanceMap.keys()];
  const resultTupple = keys.map((key) => [key, lrcBalanceMap.get(key)]);
  const sorter = (a, b) => {
    if (a[1] >= b[1]) return -1;
    else return 1;
  };
  resultTupple.sort(sorter);

  resultTupple.forEach((item) => {
    fs.appendFileSync(resultFile, item[0] + "," + item[1] + "\n");
  });
}

crawl();
