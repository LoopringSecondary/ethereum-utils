const BN = require("bn.js");
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider);

//const SolidityCoder = require("web3/lib/solidity/coder.js");

const ringMindedData = "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fb14fd4b070199d58cdb94f8b7921be9c453d0b4000000000000000000000000fb14fd4b070199d58cdb94f8b7921be9c453d0b40000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000e1f32c6f07637e91b5aaa08158c3987f1f6e6a2fea6e59668bdb5c90c2145c6e90000000000000000000000005dea876baf54a36f6c3965daa31959245c0cdb140000000000000000000000005ef0783bfe18bfd24f00c239f7bdf0b68d2b06b50000000000000000000000000000000000000000000000b715d827a59e48bf4f000000000000000000000000000000000000000000000000005e2d3e04e3d2610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006f3a09b1aa805cca6de217a0dd2173f6f4d4ba66160364095ef5e0b963e92e7a5df1f3a2ed014c0000000000000000000000007b8f9217e0ff435dafec2bac8027c5248373e2330000000000000000000000004cd27e89ce316fa9e038a1c0bfaa689d5ee2f11c0000000000000000000000000000000000000000000000000b19f0a4ee66e6ca0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000072a5f8a1a16583725";

const uint256MaxStr = "f".repeat(64);

function simpleDecodeTest() {
  const params = "0000000000000000000000000000000000000000000000000000000000000001414c7661326458455a7861357a61346a44564c4c454c47665a377868374858575859";
  const str =    "0x0000000000000000000000000000000000000000000000000000000000000001414c7661326458455a7861357a61346a44564c4c454c47665a377868374858575859";
  const decoded = web3.eth.abi.decodeParameter("string", str);
  console.log("decoded:", decoded);
}


function decodeAndPrint() {
  // const decoded = SolidityCoder.decodeParams(
  //   ["uint", "address", "address", "bytes32[]"],
  //   ringMindedData
  // );

  const decoded = web3.eth.abi.decodeParameters(
    ["uint", "address", "address", "bytes32[]"],
    ringMindedData
  );

  console.log("miner:", decoded[1]);

  const orderInfoData = decoded[3];
  for (let i = 0; i < orderInfoData.length; i += 7) {
    console.log("-".repeat(90));
    console.log("orderHash:", orderInfoData[i]);
    console.log("orderOwner:", orderInfoData[i + 1]);
    console.log("tokenS:", orderInfoData[i + 2]);
    console.log("fillAmountS:", parseInt(orderInfoData[i + 3], 16));
    console.log("lrcReward Or lrcFee:", parseInt(orderInfoData[i + 4], 16));

    console.log("splitS:", parseNegNumber(orderInfoData[i + 5]));
    console.log("splitB:", parseNegNumber(orderInfoData[i + 6]));
  }
  console.log("-".repeat(90));
}

function parseNegNumber2(hexStr) {
  hexStr = hexStr.replace("0x", "");
  if (hexStr.substring(0, 1) === "f") {
    const maxBN = new BN(uint256MaxStr, 16);
    const numBN = new BN(hexStr, 16);

    const xorBN = maxBN.xor(numBN);
    const resultBN = xorBN.notn(32);
    const result = parseInt(resultBN.toString(10), 10);
  } else {
    return parseInt(hexStr ,16);
  }
}

function parseNegNumber(hexStr) {
  hexStr = hexStr.replace("0x", "");
  // console.log("hexStr", hexStr);

  if (hexStr.substring(0, 1) === "f") {
    const maxBN = new BN(uint256MaxStr, 16);
    // console.log("maxBN:", maxBN);
    const regVal = new BN(hexStr, 16);
    // console.log("regVal:", regVal);
    const opposite = maxBN.sub(regVal);
    const oppositeStr = opposite.toString(10);
    return parseInt(oppositeStr, 10);
  } else {
    return parseInt(hexStr ,16);
  }
}

//decodeAndPrint();
simpleDecodeTest();
