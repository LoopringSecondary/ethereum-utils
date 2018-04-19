var abi = require('ethereumjs-abi');
var BN = require("bn.js");

// var parameterTypes = ["address", "address", "address", "address", "uint256", "uint8"];
// var parameterValues = ["",
//                        "",  // _tokenRegistryAddress
//                        "",  // _ringhashRegistryAddress
//                        "",  // _delegateAddress
//                        62500,
//                        20
//                       ];

// var parameterTypes = ["string", "string", "uint8", "uint256", "address"];
// var parameterValues = ["BarToken",
//                        "BAR",
//                        "18",
//                        "1000000000000000000000000",
//                        "0x6d4ee35D70AD6331000E370F079aD7df52E75005"
//                       ];

var parameterTypes = ["address"];
var parameterValues = ["0x004DeF62C71992615CF22786d0b7Efb22850Df4a"];

// var parameterTypes = ["uint256", "address[]"];
// var parameterValues = [3,
//                        ["0x0B1CfAF16E6e345C70ceD73052e95e81d5dAF682",
//                         "0x16A03aA61006B138B680F1dbB1dBDAe8EF1389FA",
//                         "0x6bd5d6fE42419e9039323f9D25B6484F5344f00D"
//                        ]
//                       ];

/// 三期GP
// var parameterTypes = ["address[]", "uint256"];
// var parameterValues = [ ["0x96f16FdB8Cd37C02DEeb7025C1C7618E1bB34d97",
//                          "0x1751E898Be7dFE529e65c31dd77A1FAe220cA657",
//                          "0x73f8783fB07a6a3D26D51561BBf958e824716647",
//                          "0x56cc67838EB4ba72dC7Bdf2500308B37BAef88CC",
//                          "0x09846001b676af5EcA38A7d5A283Ce43C0E7f975"
//                         ],
//                         3
//                       ];

/// 二期GP
 // var parameterTypes = ["address[]", "uint256"];
 // var parameterValues = [ ["0x96f16FdB8Cd37C02DEeb7025C1C7618E1bB34d97",
 //                          "0x1751E898Be7dFE529e65c31dd77A1FAe220cA657",
 //                          "0xeC4A769D94Ac5F1C2c2866f29d6357Bb6C409772",
 //                          "0x2932C8054eE8732eA828EdA091De0fBA38d38002",
 //                          "0x73f8783fB07a6a3D26D51561BBf958e824716647"
 //                         ],
 //                         3
 //                      ];

var encoded = abi.rawEncode(parameterTypes, parameterValues);

console.log(encoded.toString('hex'));
