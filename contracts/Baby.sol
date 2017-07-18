pragma solidity ^0.4.10;


contract Baby {
  uint usefulValue;
  address owner;

  function Baby(uint usefulValueArg) {
    usefulValue = usefulValueArg;
    owner = msg.sender;
  }

  function destroy() {
    selfdestruct(owner);
  }
}
