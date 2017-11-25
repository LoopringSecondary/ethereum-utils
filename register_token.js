var Promise = require("bluebird");
var fs = require("fs");
var lineReader = require("line-reader");

var Web3 = require("web3"); // tslint:disable-line
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8546"));

const abi = '[{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"symbol","type":"string"}],"name":"unregisterToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"symbol","type":"string"}],"name":"getAddressBySymbol","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addressList","type":"address[]"}],"name":"areAllTokensRegistered","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isTokenRegistered","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"TOKEN_STANDARD_ERC223","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"getTokenStandard","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"start","type":"uint256"},{"name":"count","type":"uint256"}],"name":"getTokens","outputs":[{"name":"addressList","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"claimOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"TOKEN_STANDARD_ERC20","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"symbol","type":"string"},{"name":"standard","type":"uint8"}],"name":"registerStandardToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"symbol","type":"string"}],"name":"registerToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"pendingOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"addresses","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"symbol","type":"string"}],"name":"isTokenRegisteredBySymbol","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"symbol","type":"string"}],"name":"TokenRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"symbol","type":"string"}],"name":"TokenUnregistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}]'; // tslint:disable-line

const RegisterTokenContract = web3.eth.contract(JSON.parse(abi));

const tokensFile = "./tokens.txt";
const eachLine = Promise.promisify(lineReader.eachLine);

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

async function main() {
  const tokenInfos = await parseTokenInfo();
  //console.log("tokenInfos:", tokenInfos);

  const contractAddr = "0x2EfEc84e4C52D1392cA0210b571234AD375C2250";
  const owner = "0xc480e8759ee0691e90e4a4ce5391b7af7d22bba8";
  const registerTokenContractInstance = RegisterTokenContract.at(contractAddr);

  const tokenSlice = tokenInfos.slice(2, tokenInfos.length);

  for (let tokenInfo of tokenSlice) {
    const tokenAddr = tokenInfo[0];
    const tokenSymbol = tokenInfo[2];
    console.log(tokenAddr, tokenSymbol);
    await registerTokenContractInstance.registerToken(tokenAddr, tokenSymbol, {from: owner, gas: 150000, gasLimit: 150000});
  }
}

main();
