//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "../Multisig.sol";

contract MockMultisig is Multisig {
  mapping(uint256 => bool) isTestTxExecuted;

  constructor(uint8 _minNumOfSignatures, address[] memory _owners) Multisig(_minNumOfSignatures, _owners) {}

  function setTxExecuted(uint256 _txId, bool value) external {
    isTestTxExecuted[_txId] = value;
  }
  
  function _isTxExecuted(uint256 _txId) internal view override returns (bool) {
    return isTestTxExecuted[_txId];
  }
}
