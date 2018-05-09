var SolidityCoder = require("web3/lib/solidity/coder.js");

// without 0x prefix.
// var data = "0000000000000000000000007b8f9217e0ff435dafec2bac8027c5248373e233000000000000000000000000fb14fd4b070199d58cdb94f8b7921be9c453d0b40000000000000000000000000000000000000000000000000058fb3af48866b0";

// var decoded = SolidityCoder.decodeParams([ "address", "address", "uint256" ], data);

// console.log("decoded:", decoded);

// var ringMindedData = "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fb14fd4b070199d58cdb94f8b7921be9c453d0b4000000000000000000000000fb14fd4b070199d58cdb94f8b7921be9c453d0b40000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000e06bc5f7e7c0c6b5f1c581de763a25408de642b4728b81967fbda9cf61ca0df570000000000000000000000005dea876baf54a36f6c3965daa31959245c0cdb14000000000000000000000000b2a9354da05154981fce9697506c73b8fba4acbb0000000000000000000000000000000000000000000000b715d827a59e48bf4f000000000000000000000000000000000000000000000000005e2d3e04e3d261ffffffffffffffffffffffffffffffffffffffffffffffffffa1d2c1fb1c2d9fffffffffffffffffffffffffffffffffffffffffffffffffff90c5f64e557fa41c357cbeb98320a08385b3c482b7d958089d51d319345e127ee99ab7f819e2920000000000000000000000007b8f9217e0ff435dafec2bac8027c5248373e23300000000000000000000000089055f321ff80922b92b88e3c61f8bede85b2e610000000000000000000000000000000000000000000000000b19f0a4ee66e6ca0000000000000000000000000000000000000000000000000de0b6b3a7640000fffffffffffffffffffffffffffffffffffffffffffffffff21f494c589c0000fffffffffffffffffffffffffffffffffffffffffffffff8d5a075e5e9a7c8db";

// var decoded = SolidityCoder.decodeParams(["uint", "address", "address", "bytes32[]"], ringMindedData);
// console.log("decoded:", decoded);

var data = "000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000034c5243";

var decoded = SolidityCoder.decodeParams([ "string" ], data);
console.log("decoded:", decoded);
