var Promise = require("bluebird");
var fs = require("fs");
var lineReader = require("line-reader");

var Web3 = require("web3"); // tslint:disable-line
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const abi = '[{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"symbol","type":"string"}],"name":"unregisterToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"symbol","type":"string"}],"name":"registerMintedToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"symbol","type":"string"}],"name":"getAddressBySymbol","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addressList","type":"address[]"}],"name":"areAllTokensRegistered","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isTokenRegistered","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"start","type":"uint256"},{"name":"count","type":"uint256"}],"name":"getTokens","outputs":[{"name":"addressList","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"claimOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"symbol","type":"string"}],"name":"registerToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"pendingOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"addresses","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"symbol","type":"string"}],"name":"isTokenRegisteredBySymbol","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_tokenMintAddr","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"symbol","type":"string"}],"name":"TokenRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"symbol","type":"string"}],"name":"TokenUnregistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}]'; // tslint:disable-line

const RegisterTokenContract = web3.eth.contract(JSON.parse(abi));

const tokensFile = "./tokens.md";
const eachLine = Promise.promisify(lineReader.eachLine);

async function parseTokenInfo() {
  const tokenInfos = [];
  await eachLine(tokensFile, function(line) {
    const fields = line.split(/\ +/);
    if (fields.length >= 4 && fields[0].startsWith("0x")) {
      tokenInfos.push(fields);
    }
  });

  return tokenInfos;
}

async function main() {
  const tokenInfos = await parseTokenInfo();
  // console.log("tokenInfos:", tokenInfos);

  const contractAddr = "0xaD3407deDc56A1F69389Edc191b770F0c935Ea37";
  const owner = "0x6d4ee35d70ad6331000e370f079ad7df52e75005";
  const registerTokenContractInstance = RegisterTokenContract.at(contractAddr);

  const tokenSlice = tokenInfos.slice();

  for (let tokenInfo of tokenSlice) {
    const tokenAddr = tokenInfo[0];
    const tokenSymbol = tokenInfo[2];
    console.log(tokenAddr, tokenSymbol);
    await registerTokenContractInstance.registerToken(tokenAddr, tokenSymbol, {from: owner, gas: 150000, gasLimit: 150000, gasPrice: 1110000000});
  }
}

main();
