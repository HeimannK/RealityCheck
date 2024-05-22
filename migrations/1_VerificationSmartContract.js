var VerificationSmartContract = artifacts.require("./VerificationSmartContract.sol");

module.exports = function (deployer) {
  deployer.deploy(VerificationSmartContract);
};
