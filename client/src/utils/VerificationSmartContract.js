import VSContract from '../contracts/VerificationSmartContract.json'

const VerificationSmartContract = async (web3) => {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = VSContract.networks[networkId];

  return new web3.eth.Contract(
    VSContract.abi,
    deployedNetwork && deployedNetwork.address,
  );
};

export default VerificationSmartContract;