var Promise = require('bluebird');

var Main = artifacts.require("./Main.sol");
var Baby = artifacts.require("./Baby.sol");

contract('Main', function(accounts) {

  // BEGIN utilities
  function snapshot(done) {
  	web3.currentProvider.sendAsync({
  		jsonrpc: "2.0",
  		"method": "evm_snapshot",
  		params: []
  	}, done);
  }
  var snapshotAsync = Promise.promisify(snapshot);

  function revert(id, done) {
  	var paramsArr = [];
  	if (typeof id == 'number' && id == -1) id = null;
  	paramsArr.push(id);
  	var confObj = {
  		jsonrpc: "2.0",
  		"method": "evm_revert"
  	};
  	if (id) {
  		confObj.params = paramsArr;
  	}
  	web3.currentProvider.sendAsync(confObj, done);
  }
  var revertAsync = Promise.promisify(revert);

  // END utilities


  it("test baby killer", function() {
    var inst;
    var snapshotsArr = [];
    var babyAddr, code;

    return Main.deployed().then(function(instance) {
      inst = instance;
      return inst.makeBaby(1);
    })
    .then(function() {
      return inst.babyAddr();
    })
    .then(function(babyAddrArg) {
      assert.notEqual(babyAddrArg, 0);
      babyAddr = babyAddrArg;
      return Promise.resolve();
    })
    .then(function() {
      return web3.eth.getCode(babyAddr);
    })
    .then(function(codeArg) {
      code = codeArg; // saving for comparing later
      //console.log(codeArg);
      assert.notEqual(codeArg, 0);
      assert.notEqual(code.length, 0);
      return Promise.resolve();

    })

    // taking snapshot
    .then(function() {
      return snapshotAsync();
    })
    .then(function(res) {
      var id = web3.toDecimal(res.result);
      assert.isAbove(id, -1);
      snapshotsArr.push(id);
      return Promise.resolve();
    })

    // *** BEGIN: irreversible action
    .then(function() {
      inst.killBaby();
    })
    .then(function() {
      return inst.babyAddr();
    })
    .then(function(babyAddrArg) {
      assert.equal(babyAddrArg, 0);
      return Promise.resolve();
    })
    // checking what happened to the Baby contract storage address
    .then(function() {
      return web3.eth.getCode(babyAddr);
    })
    .then(function(codeArg) {
      //console.log("codeArg", codeArg);
      assert.equal(codeArg, 0);
      return Promise.resolve();
    })
    // *** END: irreversible action

    // reverting what we have done
    .then(function() {
      return revertAsync(snapshotsArr.pop());
    })
    .then(function() {
      return inst.babyAddr();
    })
    .then(function(babyAddrArg) {
      assert.equal(babyAddrArg, babyAddr);
      return Promise.resolve();
    })
    // checking what happened to the Baby contract storage address
    .then(function() {
      return web3.eth.getCode(babyAddr);
    })
    .then(function(codeArg) {
      //console.log("codeArg", codeArg);
      assert.notEqual(codeArg, 0);
      //assert.equal(codeArg, code); // comparing with saved before snapshot
      return Promise.resolve();
    })


    ;
  });
});
