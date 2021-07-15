//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "../Multisig.sol";

contract MockMultisig is Multisig {
  mapping(uint256 => bool) isTestTxExecuted;

  constructor(uint8 _minNumOfSignatures, address[] memory _owners) Multisig(_minNumOfSignatures, _owners) {}

  function setTxExecuted(uint256 _txId, bool value) external {
    isTestTxExecuted[_txId] = value;
  }

  /// @dev overrides _isTxExecuted function in Multisig contract. 
  ///   That means if you don't set the `isTextTxExecuted[_txId]` via `setTxExecuted`
  ///   the `transactionNotExecuted` will not work as expected,
  ///   because the test will read isTestTxExecuted[_txId] instead
  function _isTxExecuted(uint256 _txId) internal view override returns (bool) {
    return isTestTxExecuted[_txId];
  }
}
