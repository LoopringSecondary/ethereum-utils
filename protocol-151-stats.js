const request = require("request-promise");
const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/hM4sFGiBdqbnGTxk5YT2"));

async function parseAllOrderOwners() {
  const orderCountMap = new Map();

  const startBlock = 6643435; // block number contract created.
  const latestBlock = 6646435;
  const step = 1000;
  for (let fromBlock = startBlock; fromBlock < latestBlock; fromBlock += step) {
    const subMap = await getOrderCountInBlockRange(fromBlock, fromBlock + step);
    reduce(orderCountMap, subMap);
  }

  return orderCountMap;
}

async function getOrderCountInBlockRange(fromBlock, toBlock) {
  const resMap = new Map();
  const url = getRingMinedEventUrl(fromBlock, toBlock);
  console.log("url:", url);
  const responseStr = await request(url);
  const respObj = JSON.parse(responseStr);
  if (!respObj || !respObj.result || respObj.result.length === 0) {
    console.log("Error:empty respose");
  }
  console.log("response.result.length:", respObj.result.length);
  if (respObj.result.length == 1000) {
    console.log("fromBlock:", fromBlock, "; toBlock:", toBlock);
    console.log("WARN: result = 1000, some events probably missing.");
  }

  for (const item of respObj.result) {
    let data = item.data;
    data = data.slice(2);
    try {
      // console.log("data:", data);
      const order1OwnerStr = data.slice(6 * 64, 7 * 64);
      const order1Owner = bytes32ToAddress(order1OwnerStr);

      const order2OwnerStr = data.slice(13 * 64, 14 * 64);
      const order2Owner = bytes32ToAddress(order2OwnerStr);

      const minerStr = data.slice(1 * 64, 2 * 64);
      const miner = bytes32ToAddress(minerStr);
      console.log("order1OwnerStr: " + order1OwnerStr);
      console.log("order2OwnerStr: " + order2OwnerStr);
      console.log("minerStr: " + minerStr);
      if (minerStr == order1OwnerStr || minerStr == order2OwnerStr) {
          console.log("find a P2P!")
          if (resMap.has(miner)) {
              const oldVal = resMap.get(miner);
              resMap.set(miner, oldVal + 1);
          } else {
              resMap.set(order2Owner, 1);
          }
      }

    } catch (err) {
      console.log(err);
      continue;
    }
  }

  return resMap;
}

function bytes32ToAddress(str) {
  return "0x" + str.slice(24);
}

function getRingMinedEventUrl(fromBlock, toBlock) {
  const contractAddr = "0x8d8812b72d1e4ffcec158d25f56748b7d67c1e78";
  const topic0 = "0x4d2a4adf7c5f6cf35d97aecc1919897bf86299dccd9b5e19b2b38ebebf07add0";
  return "https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=" + fromBlock +
    "&toBlock=" + toBlock +
    "&address=" + contractAddr +
    "&topic0=" + topic0;
}

function reduce(totalMap, subMap) {
  if (!subMap || subMap.size === 0) {
    return;
  }

  [...subMap.keys()].forEach((addr) => {
    const subValue = subMap.get(addr);
    if (totalMap.has(addr)) {
      const oldValue = totalMap.get(addr);
      totalMap.set(addr, oldValue + subValue);
    } else {
      totalMap.set(addr, subValue);
    }
  });
}

function writeResultToFile(ordersCountMap, resultFile) {
  const secs = Math.floor(new Date().getTime() / 1000);
  resultFile = resultFile + "." + secs;

  const keys = [...ordersCountMap.keys()];
  const resultTupple = keys.map((key) => [key, ordersCountMap.get(key)]);
  const sorter = (a, b) => {
    if (a[1] >= b[1]) return -1;
      else return 1;
    };
  resultTupple.sort(sorter);
  resultTupple.forEach((item) => {
    fs.appendFileSync(resultFile, item[0] + "," + item[1] + "\n");
  });
}

async function main() {
  const ordersCountMap = await parseAllOrderOwners();

  const resultFile = "orders-p2p.csv";
  writeResultToFile(ordersCountMap, resultFile);
}

main();
