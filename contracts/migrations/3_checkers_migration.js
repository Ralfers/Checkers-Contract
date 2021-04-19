const Checkers = artifacts.require("Checkers");

module.exports = function (deployer) {
  deployer.deploy(Checkers);
};
