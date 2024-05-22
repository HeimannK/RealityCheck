import Web3 from 'web3';

const web3Connection = async () => {
  let web3;

  if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
  } else if (typeof window.web3 !== 'undefined') {
    web3 = window.web3;
  } else {
    web3 = new Web3('http://localhost:7545');
  }

  return web3;
}

export default web3Connection;