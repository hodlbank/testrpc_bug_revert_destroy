pragma solidity ^0.4.10;

import "./Baby.sol";

contract Main {
  address public babyAddr;

  function makeBaby(uint usefulValueArg) {
    babyAddr = new Baby(usefulValueArg);
  }

  function killBaby() {
    require(address(babyAddr) != 0);
    Baby baby = Baby(babyAddr);
    babyAddr = address(0);

    baby.destroy();
  }
}
