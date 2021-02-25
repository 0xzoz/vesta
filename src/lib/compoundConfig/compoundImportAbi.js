export const compoundImportAbi = [{"inputs":[{"internalType":"contract Registry","name":"_registery","type":"address"},{"internalType":"contract BComptroller","name":"_bComptroller","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor","signature":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"constant":true,"inputs":[],"name":"bComptroller","outputs":[{"internalType":"contract BComptroller","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xeaeec94b"},{"constant":true,"inputs":[],"name":"bETH","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x61983163"},{"constant":true,"inputs":[],"name":"registry","outputs":[{"internalType":"contract Registry","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x7b103999"},{"constant":false,"inputs":[{"internalType":"address[]","name":"cTokenCollateral","type":"address[]"}],"name":"importCollateral","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x4cef1adc"},{"constant":false,"inputs":[{"internalType":"address[]","name":"cTokenCollateral","type":"address[]"},{"internalType":"address[]","name":"collateralUnderlying","type":"address[]"},{"internalType":"address[]","name":"cTokenDebt","type":"address[]"},{"internalType":"address[]","name":"debtUnderlying","type":"address[]"},{"internalType":"uint256","name":"ethFlashLoan","type":"uint256"}],"name":"importAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xdc861faa"}]