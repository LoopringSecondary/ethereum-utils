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
  return parseInt(bnStr, 10);
}

function numberToBN(num) {
  return new BN(num.toString(10), 10);
}

async function queryFillAmount(order) {

}

async function printSpendable(owner, tokenAddr) {
  console.log("spendable: owner token:", owner, tokenAddr);

  const token = TokenContract.at(tokenAddr);
  const balance = await token.balanceOf(owner);
  const allowance = await token.allowance(owner, delegateAddress);
  console.log("balance:", balance.toNumber() / 1e18);
  console.log("allowance:", allowance.toNumber() / 1e18);
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

  order2.orderV = Number(vList[1]);
  order2.orderR = rList[1];
  order2.orderS = sList[1];
}

async function parse(rawTx) {
  console.log("=".repeat(32));
  
  // console.log("protocolAbi", protocolAbi);

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
  
  console.log("-".repeat(32));
  console.log("order1: ", order1);
  checkOrderSig(order1);
  await printSpendable(order1.owner, order1.tokenS);  

  console.log("-".repeat(32));
  console.log("order2: ", order2);
  checkOrderSig(order2);
  await printSpendable(order2.owner, order2.tokenS);

  console.log("-".repeat(32) + "\n");  
}

function checkOrderSig(order) {
  const signer = order.owner;
  const hash = order.orderHash;
  const v = order.orderV;
  const r = order.orderR;
  const s = order.orderS;

  console.log("sig info:", signer, hash, v, r, s);

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


async function main() {
  const rawTx = "0xf906eb0585037e11d60083061a80948d8812b72d1e4ffcec158d25f56748b7d67c1e7880b90684e78aadb20000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000003e0000000000000000000000000000000000000000000000000000000000000044000000000000000000000000000000000000000000000000000000000000004a0000000000000000000000000000000000000000000000000000000000000054000000000000000000000000000000000000000000000000000000000000005e000000000000000000000000056447c02767ba621f103c0f3dbf564dbcacf284b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000f2afdfff2594eadd6d645ea5544206bf92351e29000000000000000000000000ef68e7c694f40c8202821edf525de3782458639f00000000000000000000000056447c02767ba621f103c0f3dbf564dbcacf284b0000000000000000000000006d7fd7a2acdbc918a64554ee16f5bbf34925575700000000000000000000000064f2741920b7df046b7fe8df2e6b0bead2452bea000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000008e63bb7af326de3fc6e09f4c8d54a75c6e236aba000000000000000000000000a2d7397774cfbe3ccbfe5945abec34a4d681d96300000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000056bc75e2d631000000000000000000000000000000000000000000000000000000078cad1e25d0004000000000000000000000000000000000000000000000000000000005bf39901000000000000000000000000000000000000000000000000000000005c1b341100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000056bc75e2d631000000000000000000000000000000000000000000000000000000078cad1e25d00040000000000000000000000000000000000000000000000056bc75e2d63100000000000000000000000000000000000000000000000000000000000005bf39901000000000000000000000000000000000000000000000000000000005c1b341100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000078cad1e25d00040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001b000000000000000000000000000000000000000000000000000000000000001b000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000001b0000000000000000000000000000000000000000000000000000000000000004f3e483d7336998a0f31e997c9c7aa74c263e14aee8b9cf882f9a564df553158f90383f51cbcaf652781195a5de3f0c5338b8a1db7c6c34fb9ed9bc13e0981ef86b6380ee07c330235e4e4e467e4cf7a09fe484dae584903b8647fcdc4d201f88f4e31f39a057338bc916d9bc71c3448cb29b154746325b77d3c3189aee58588200000000000000000000000000000000000000000000000000000000000000047f50fcc41ad08f78d7cf40c347948af38c6260afbbe0f596b61a7505f1f08b12523658ae33084d9a62cbfc88ec694649381dfe1b0239c21d0cca5c82fc188f6679ffd7b0b7d5831c62ea9e4c6d81e42d604ba6b4dd4ebbd0b29412b162a56ead2309b3c5e8b7183b416613974b2188f7df86c4b3014d2c1e1f6636b23f31371d1ba0925f7c23bcc88a415826a18460ebb3baa7f779186813b292767a6c1ef41017f1a0763d973c0b33b8783ee549983c689314a4b7bbab7dffd396d0d7111fb0d26965";

  const rawTx2 = "0xf906eb0585037e11d60083061a80948d8812b72d1e4ffcec158d25f56748b7d67c1e7880b90684e78aadb20000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000003e0000000000000000000000000000000000000000000000000000000000000044000000000000000000000000000000000000000000000000000000000000004a0000000000000000000000000000000000000000000000000000000000000054000000000000000000000000000000000000000000000000000000000000005e000000000000000000000000056447c02767ba621f103c0f3dbf564dbcacf284b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000f2afdfff2594eadd6d645ea5544206bf92351e29000000000000000000000000ef68e7c694f40c8202821edf525de3782458639f00000000000000000000000056447c02767ba621f103c0f3dbf564dbcacf284b0000000000000000000000006d7fd7a2acdbc918a64554ee16f5bbf34925575700000000000000000000000064f2741920b7df046b7fe8df2e6b0bead2452bea000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000008e63bb7af326de3fc6e09f4c8d54a75c6e236aba000000000000000000000000a2d7397774cfbe3ccbfe5945abec34a4d681d96300000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000056bc75e2d631000000000000000000000000000000000000000000000000000000078cad1e25d0004000000000000000000000000000000000000000000000000000000005bf39901000000000000000000000000000000000000000000000000000000005c1b341100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000056bc75e2d631000000000000000000000000000000000000000000000000000000078cad1e25d00040000000000000000000000000000000000000000000000056bc75e2d63100000000000000000000000000000000000000000000000000000000000005bf39901000000000000000000000000000000000000000000000000000000005c1b341100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000078cad1e25d00040000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001b000000000000000000000000000000000000000000000000000000000000001b000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000001b0000000000000000000000000000000000000000000000000000000000000004f3e483d7336998a0f31e997c9c7aa74c263e14aee8b9cf882f9a564df553158f90383f51cbcaf652781195a5de3f0c5338b8a1db7c6c34fb9ed9bc13e0981ef86b6380ee07c330235e4e4e467e4cf7a09fe484dae584903b8647fcdc4d201f88f4e31f39a057338bc916d9bc71c3448cb29b154746325b77d3c3189aee58588200000000000000000000000000000000000000000000000000000000000000047f50fcc41ad08f78d7cf40c347948af38c6260afbbe0f596b61a7505f1f08b12523658ae33084d9a62cbfc88ec694649381dfe1b0239c21d0cca5c82fc188f6679ffd7b0b7d5831c62ea9e4c6d81e42d604ba6b4dd4ebbd0b29412b162a56ead2309b3c5e8b7183b416613974b2188f7df86c4b3014d2c1e1f6636b23f31371d1ba0925f7c23bcc88a415826a18460ebb3baa7f779186813b292767a6c1ef41017f1a0763d973c0b33b8783ee549983c689314a4b7bbab7dffd396d0d7111fb0d26965";
  
  const rawTx1 = "0xf906eb378504e3b2920083061a80948d8812b72d1e4ffcec158d25f56748b7d67c1e7880b90684e78aadb20000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000003e0000000000000000000000000000000000000000000000000000000000000044000000000000000000000000000000000000000000000000000000000000004a0000000000000000000000000000000000000000000000000000000000000054000000000000000000000000000000000000000000000000000000000000005e000000000000000000000000059845c6007df15a5ffd5fee0111d219d764f85360000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000059845c6007df15a5ffd5fee0111d219d764f8536000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000a64b16a18885f00fa1ad6d3d3100c3e6f1cef72400000000000000000000000022fc551e8580e87d7f7ee3133a04d9d91494a5ef000000000000000000000000a64b16a18885f00fa1ad6d3d3100c3e6f1cef724000000000000000000000000ef68e7c694f40c8202821edf525de3782458639f0000000000000000000000008e63bb7af326de3fc6e09f4c8d54a75c6e236aba00000000000000000000000089483acaa20c0228513dea63e78c84553a6034f4000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000000002b5e3af16b1880000000000000000000000000000000000000000000000000000000000005bebaff0000000000000000000000000000000000000000000000000000000005bee6100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000000002b5e3af16b188000000000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000000000000000005bebbdd4000000000000000000000000000000000000000000000000000000005bed0f540000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b5e3af16b18800000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001b000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000001b000000000000000000000000000000000000000000000000000000000000001b0000000000000000000000000000000000000000000000000000000000000004892b378ebd07303f29b2680cb9c8d4425a21ff12ebb245b1304dee142f321ac2734c08177bc0908e393b02028edc0aecad6ec5567dbdbfdfc1cdc541bbaf753b688223d5b5264e377c85887b72875c1f67414d066c1540d1decdb2bd34fe61bba341307c08e2ba96a9e79ea74bfa74fc06ca6877cb75896c77fe28749813f65f0000000000000000000000000000000000000000000000000000000000000004607a6d1d76963740d63d0e8bf1d708d5a4298887a2dc287a2b9a5004fe1d43801f948f7c6d71e7bd8309c54e22fcf125c533c5c404f4ddd6b6ba98eeaa7f57002696c72151598a3bcb89db0881ae14df36e77e5d5c07a125371c6be3e3d73b48395a6081fcb8241dacae201e2731ec7bc2d6fb44bfdc4b4b9570c3e2d97a349426a086c87af2f0625112d1f869d929b0c12d34f8bce9ca08b8dfe2af498bb832f9fda01870afaeef917a651f822b98dd9304b9540d512cbcfebf668bca36fdaec752d3";

  await parse(rawTx);

}

main();
