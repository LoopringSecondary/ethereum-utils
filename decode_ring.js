const assert = require("assert");
const BN = require("bn.js");
const fs = require("fs");
const txDecoder = require("ethereum-tx-decoder");
const abi = require("ethereumjs-abi");
const ethUtil = require("ethereumjs-util");
const Web3 = require("web3");

const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/hM4sFGiBdqbnGTxk5YT2"));

const delegateABI = '[{"constant":true,"inputs":[{"name":"owners","type":"address[]"},{"name":"tradingPairs","type":"bytes20[]"},{"name":"validSince","type":"uint256[]"}],"name":"checkCutoffsBatch","outputs":[],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"latestAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"max","type":"uint256"}],"name":"getLatestAuthorizedAddresses","outputs":[{"name":"addresses","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"orderHash","type":"bytes32"},{"name":"cancelOrFillAmount","type":"uint256"}],"name":"addCancelledOrFilled","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"cancelled","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"token","type":"address"},{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"lrcTokenAddress","type":"address"},{"name":"minerFeeRecipient","type":"address"},{"name":"walletSplitPercentage","type":"uint8"},{"name":"batch","type":"bytes32[]"}],"name":"batchTransferToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"authorizeAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenPair","type":"bytes20"},{"name":"t","type":"uint256"}],"name":"setTradingPairCutoffs","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"claimOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"cancelledOrFilled","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"bytes20"}],"name":"tradingPairCutoffs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"orderHash","type":"bytes32"},{"name":"cancelAmount","type":"uint256"}],"name":"addCancelled","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"addressInfos","outputs":[{"name":"previous","type":"address"},{"name":"index","type":"uint32"},{"name":"authorized","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isAddressAuthorized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"cutoffs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"deauthorizeAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"t","type":"uint256"}],"name":"setCutoffs","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"addr","type":"address"},{"indexed":false,"name":"number","type":"uint32"}],"name":"AddressAuthorized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"addr","type":"address"},{"indexed":false,"name":"number","type":"uint32"}],"name":"AddressDeauthorized","type":"event"}]';
const erc20ABI = '[{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]';
const protocolAbi = '[{"constant":true,"inputs":[],"name":"MARGIN_SPLIT_PERCENTAGE_BASE","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ringIndex","outputs":[{"name":"","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"RATE_RATIO_SCALE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lrcTokenAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenRegistryAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"delegateAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"orderOwner","type":"address"},{"name":"token1","type":"address"},{"name":"token2","type":"address"}],"name":"getTradingPairCutoffs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"token1","type":"address"},{"name":"token2","type":"address"},{"name":"cutoff","type":"uint256"}],"name":"cancelAllOrdersByTradingPair","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addresses","type":"address[5]"},{"name":"orderValues","type":"uint256[6]"},{"name":"buyNoMoreThanAmountB","type":"bool"},{"name":"marginSplitPercentage","type":"uint8"},{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"}],"name":"cancelOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MAX_RING_SIZE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"cutoff","type":"uint256"}],"name":"cancelAllOrders","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"rateRatioCVSThreshold","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"addressList","type":"address[4][]"},{"name":"uintArgsList","type":"uint256[6][]"},{"name":"uint8ArgsList","type":"uint8[1][]"},{"name":"buyNoMoreThanAmountBList","type":"bool[]"},{"name":"vList","type":"uint8[]"},{"name":"rList","type":"bytes32[]"},{"name":"sList","type":"bytes32[]"},{"name":"miner","type":"address"},{"name":"feeSelections","type":"uint16"}],"name":"submitRing","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"walletSplitPercentage","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_lrcTokenAddress","type":"address"},{"name":"_tokenRegistryAddress","type":"address"},{"name":"_delegateAddress","type":"address"},{"name":"_rateRatioCVSThreshold","type":"uint256"},{"name":"_walletSplitPercentage","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_ringIndex","type":"uint256"},{"indexed":true,"name":"_ringHash","type":"bytes32"},{"indexed":false,"name":"_feeRecipient","type":"address"},{"indexed":false,"name":"_orderHashList","type":"bytes32[]"},{"indexed":false,"name":"_amountsList","type":"uint256[6][]"}],"name":"RingMined","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_orderHash","type":"bytes32"},{"indexed":false,"name":"_amountCancelled","type":"uint256"}],"name":"OrderCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_address","type":"address"},{"indexed":false,"name":"_cutoff","type":"uint256"}],"name":"AllOrdersCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_address","type":"address"},{"indexed":false,"name":"_token1","type":"address"},{"indexed":false,"name":"_token2","type":"address"},{"indexed":false,"name":"_cutoff","type":"uint256"}],"name":"OrdersCancelled","type":"event"}]';

const delegateAddress = "0x17233e07c67d086464fD408148c3ABB56245FA64";
const TokenContract = web3.eth.contract(JSON.parse(erc20ABI));
const RING_SIZE = 2;

function bnToNumber(bn) {
  const bnStr = bn.toString(10);
  // return parseInt(bnStr, 10);
  return bnStr;
}

function numberToBN(num) {
  return new BN(num, 10);
}

async function printSpendable(owner, tokenAddr) {
  console.log("spendable: owner token:", owner, tokenAddr);

  const token = TokenContract.at(tokenAddr);
  const balance = await token.balanceOf(owner);
  const allowance = await token.allowance(owner, delegateAddress);
  console.log("balance:", balance.toNumber() / 1e18);
  console.log("allowance:", allowance.toNumber() / 1e18);
}

async function checkOrderFilledAmount(order) {
  const DelegateContract = web3.eth.contract(JSON.parse(delegateABI));
  const delegateInstance = DelegateContract.at(delegateAddress);
  const filledSOrB = await delegateInstance.cancelledOrFilled("0x" + order.orderHash);
  const filledSOrBStr = filledSOrB.toString(10);
  console.log("filledSOrBStr:", filledSOrBStr);
  if (order.buyNoMoreThanAmountB) {
    order.filledB = filledSOrBStr;
  } else {
    order.filledB = filledSOrBStr;
  }

  const cutoff = await delegateInstance.cancelled(order.owner);
  console.log("cutoff timestamp:", new Date(cutoff.toString(10) * 1000));
}

function setupAddresses(addrList, order1, order2) {
  const addresses1 = addrList[0];
  const addresses2 = addrList[1];

  order1.owner = addresses1[0];
  order1.tokenS = addresses1[1];
  order1.tokenB = addresses2[1];
  order1.walletAddr = addresses1[2];
  order1.authAddr = addresses1[3];

  order2.owner = addresses2[0];
  order2.tokenS = addresses2[1];
  order2.tokenB = addresses1[1];
  order2.walletAddr = addresses2[2];
  order2.authAddr = addresses2[3];
}

function setupAmount(amountList, order1, order2) {
  const uintArray1 = amountList[0];
  const uintArray2 = amountList[1];

  order1.amountS = bnToNumber(uintArray1[0]);
  order1.amountSEth = order1.amountS/1e18;
  order1.amountB = bnToNumber(uintArray1[1]);
  order1.amountBEth = order1.amountB/1e18;
  order1.validSince = bnToNumber(uintArray1[2]);
  order1.validSinceTime = new Date(order1.validSince * 1000);
  order1.validUntil = bnToNumber(uintArray1[3]);
  order1.validUntilTime = new Date(order1.validUntil * 1000);
  order1.lrcFee = bnToNumber(uintArray1[4]);
  order1.rateAmountS = bnToNumber(uintArray1[5]);

  order2.amountS = bnToNumber(uintArray2[0]);
  order2.amountSEth = order2.amountS/1e18;
  order2.amountB = bnToNumber(uintArray2[1]);
  order2.amountBEth = order2.amountB/1e18;
  order2.validSince = bnToNumber(uintArray2[2]);
  order2.validSinceTime = new Date(order2.validSince * 1000);
  order2.validUntil = bnToNumber(uintArray2[3]);
  order2.validUntilTime = new Date(order2.validUntil * 1000);
  order2.lrcFee = bnToNumber(uintArray2[4]);
  order2.rateAmountS = bnToNumber(uintArray2[5]);
}

function setupVSR(vList, rList, sList, order1, order2) {
  order1.orderV = Number(vList[0]);
  order1.orderR = rList[0];
  order1.orderS = sList[0];
  order1.authV = Number(vList[2]);
  order1.authR = rList[2];
  order1.authS = sList[2];
  
  order2.orderV = Number(vList[1]);
  order2.orderR = rList[1];
  order2.orderS = sList[1];
  order2.authV = Number(vList[3]);
  order2.authR = rList[3];
  order2.authS = sList[3];
}

async function parse(rawTx) {
  console.log("=".repeat(32));
  const fnDecoder = new txDecoder.FunctionDecoder(protocolAbi);
  const decodedTx = txDecoder.decodeTx(rawTx);

  const arrayish = fnDecoder.decodeFn(decodedTx.data);
  // console.log("arrayish: ", arrayish);

  const order1 = {delegateAddr: delegateAddress};
  const order2 = {delegateAddr: delegateAddress};

  setupAddresses(arrayish[0], order1, order2);
  setupAmount(arrayish[1], order1, order2);
  assert(order1.rateAmountS > 0, "rateAmount is zero");
  assert(order2.rateAmountS > 0, "rateAmount is zero");

  const uint8Array = arrayish[2];
  order1.marginSplitPercentage = uint8Array[0][0];
  order2.marginSplitPercentage = uint8Array[1][0];

  const buyNoMoreList = arrayish[3];
  order1.buyNoMoreThanAmountB = buyNoMoreList[0];
  order2.buyNoMoreThanAmountB = buyNoMoreList[1];

  order1.orderHash = getOrderHash(order1);
  order2.orderHash = getOrderHash(order2);

  setupVSR(arrayish[4], arrayish[5], arrayish[6], order1, order2);

  const minerFeeRecipient = arrayish[7];
  const feeSelections = arrayish[8];
  const ringhash = getRingHash(order1, order2, minerFeeRecipient, feeSelections);
  
  console.log("-".repeat(32));
  console.log("order1: ", order1);
  checkOrderSig(order1);
  checkAuthSig(order1, ringhash);
  assert(order1.rateAmountS <= order1.amountS, "fill rate error.");
  await printSpendable(order1.owner, order1.tokenS);
  await checkOrderFilledAmount(order1);

  console.log("-".repeat(32));
  console.log("order2: ", order2);
  checkOrderSig(order2);
  checkAuthSig(order2, ringhash);
  assert(order2.rateAmountS <= order2.amountS, "fill rate error.");
  await printSpendable(order2.owner, order2.tokenS);
  await checkOrderFilledAmount(order2);
  console.log("-".repeat(32) + "\n");  
}

function checkAuthSig(order, ringHash) {
  const signer = order.authAddr;
  const hash = ringHash;
  const v = order.authV;
  const r = order.authR;
  const s = order.authS;

  console.log("auth sig info:", signer, hash, v, r, s);
  const msgHash = ethUtil.hashPersonalMessage(new Buffer(hash, "hex"));
  try {
    const pubKey = ethUtil.ecrecover(msgHash, v, ethUtil.toBuffer(r), ethUtil.toBuffer(s));
    const recoveredAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(pubKey));

    console.log("auth recoveredAddress:", recoveredAddress);
    
    if (recoveredAddress === signer.toLowerCase()) {
      console.log("auth signature verification succeeded.");
    } else {
      console.log("ERROR: auth signature verification failed.");
    }
  } catch (err) {
    console.log("verify auth sig failed. err:", err);
    return false;
  }
}

function checkOrderSig(order) {
  const signer = order.owner;
  const hash = order.orderHash;
  const v = order.orderV;
  const r = order.orderR;
  const s = order.orderS;

  console.log("order sig info:", signer, hash, v, r, s);

  const msgHash = ethUtil.hashPersonalMessage(new Buffer(hash, "hex"));
  // console.log("msgHash:", msgHash);
  try {
    const pubKey = ethUtil.ecrecover(msgHash, v, ethUtil.toBuffer(r), ethUtil.toBuffer(s));
    const recoveredAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(pubKey));

    console.log("recoveredAddress:", recoveredAddress);
    
    if (recoveredAddress === signer.toLowerCase()) {
      console.log("signature verification succeeded.");
    } else {
      console.log("ERROR: signature verification failed.");
    }
  } catch (err) {
    console.log("verify order sig failed. err:", err);
    return false;
  }
}

function getOrderHash(order) {
  const orderHash = abi.soliditySHA3(
    ["address", "address", "address", "address", "address", "address",
     "uint256", "uint256", "uint256", "uint256", "uint256",
     "bool", "uint8"],
    [
      order.delegateAddr,
      order.owner,
      order.tokenS,
      order.tokenB,
      order.walletAddr,
      order.authAddr,
      numberToBN(order.amountS),
      numberToBN(order.amountB),
      numberToBN(order.validSince),
      numberToBN(order.validUntil),
      numberToBN(order.lrcFee),
      order.buyNoMoreThanAmountB,
      numberToBN(order.marginSplitPercentage),
    ]);

  return orderHash.toString("hex");
}

function getRingHash(order1, order2, feeRecipient, feeSelectionNumber) {
  const xorHashs = (hash1, hash2) => {
    const res = Buffer.alloc(32);
    const buf1 = Buffer.from(hash1, "hex");
    const buf2 = Buffer.from(hash2, "hex");

    // console.log("buf1, buf2", buf1, buf2);
    for (let i = 0; i < 32; i++) {
      res[i] = buf1[i] ^ buf2[i];
    }
    return res;
  };

  const hashXor = xorHashs(order1.orderHash, order2.orderHash);
  // console.log("hashXor:", hashXor);
  // console.log("feeRecipient:", feeRecipient);
  // console.log("feeSelectionNumber:", feeSelectionNumber);
  const ringHash = abi.soliditySHA3(["string", "address", "uint16"],
                                    [hashXor, feeRecipient, feeSelectionNumber]);
  return ringHash.toString("hex");
}


async function main() {
  const rawTx = "0xf906eb4885028fa6ae0083061a80948d8812b72d1e4ffcec158d25f56748b7d67c1e7880b90684e78aadb20000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000003e0000000000000000000000000000000000000000000000000000000000000044000000000000000000000000000000000000000000000000000000000000004a0000000000000000000000000000000000000000000000000000000000000054000000000000000000000000000000000000000000000000000000000000005e00000000000000000000000003bed9c733084ed3a19e44827135408a8b4bba45100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000a64b16a18885f00fa1ad6d3d3100c3e6f1cef724000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000003bed9c733084ed3a19e44827135408a8b4bba45100000000000000000000000052a0d242f61a57254f8822ba218f64450d4c52c100000000000000000000000059845c6007df15a5ffd5fee0111d219d764f8536000000000000000000000000ef68e7c694f40c8202821edf525de3782458639f0000000000000000000000008e63bb7af326de3fc6e09f4c8d54a75c6e236aba000000000000000000000000c807963c38e2c6753282a1359f3ff9471d11183b000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000000001cbae287440b45f15000000000000000000000000000000000000000000000000000000005bf632f7000000000000000000000000000000000000000000000000000000005c1dce07000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000000000993a0d7c159175070000000000000000000000000000000000000000000000000017af4c4a80aaaa000000000000000000000000000000000000000000000000000000005bf632f7000000000000000000000000000000000000000000000000000000005c1dce070000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000993a0d7c159175070000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000001b000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000438cdd2f5499f48cd8e9c1cbf88513dd31fd1cd0e6b1dc8a95f811a680b36d85fac3a89ef626a4ff251f681db4727f6d850f2b7cebd00645cf4fd1461f7f14dc5664ea833dbfb4dbf8bf9c13f1bfe527f00a2d8096608af5f82f268e841bf5596eada027fc2a4814377ed84e5b4ab9c152b29f1c7a5e3f5bf32f2e2ce57b93b2e00000000000000000000000000000000000000000000000000000000000000045acbab295f1f788fa8f3cdf158a056518f4719a9a9e3ed077686b3db70941d163850b5ff9505b45e25ed0e46862e157124f9245623980e5c137890ff6632387a40fd28b9dfaef593f1bbe3fa283ab88dc0cae3122de1b4445ee5b42e999a06e91cbf134431f294c14197bf6627589e5a8c11c3a0aebc35a9f8ed2a058f33f95d1ba0ce4db672d65f8feb85aab7058afe7c613e910d645fbb9a9f0b2122ae028ce293a04c9d3620eff87fc91595910fdd83a4b6e519ec8127c2d19f18b6e9cec123c98c";

  await parse(rawTx);
}

main();
