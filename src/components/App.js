import React, { Component } from 'react';
import logo from '../logo.png';
import './App.css';
import ipfs from './ipfs';
// import alchemy from './alchemy.js';
import getWeb3 from '../utils/getWeb3'
import axios from 'axios';
import SimpleStorageContract from '../contracts/SimpleStorage.json' 

let ImgUrl='';
let Hash= '';
const uploadToPinata = async (file) => {
  console.log("This is uploadToPinata function");
  if (file){
    try {
      const formData= new FormData();
      formData.append("file", file);

      const response = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: 'f133a376d3ed17de0783',
          pinata_secret_api_key: 'd4bbb2603dff9a92f96a730eb62550a775e598233c6af33c3c4cb4856b1f5265',
          "Content-Type": "multipart/form-data",
        },
      });
      Hash= response.data.IpfsHash;
      console.log("Hash: "+ Hash);
      ImgUrl = "https://gateway.pinata.cloud/ipfs/"+response.data.IpfsHash;
      // this.state.ipfsHash= uploadToPinata(file);
      console.log("URL: "+ImgUrl);
      return ImgUrl;
    }catch(error){
      console.log(error);
    }
  }
}

class App extends Component {
  

  constructor(props) {
    const pinata_api_key= ''
    const pinata_secret_api_key= ''
    super(props);
    this.state = { 
      buffer: null,
      storagevalue: 0,
      web3: null,
      ipfsHash: '',
      accounts:0
    }
    this.captureFile= this.captureFile.bind(this);
    this.onSubmit= this.onSubmit.bind(this);
  }


componentWillMount() {
  // Get network provider and web3 instance.
  // See utils/getWeb3 for more info.

  getWeb3
  .then(results => {
    this.setState({
      web3: results.web3
    })

    // Instantiate contract once web3 provided.
    this.instantiateContract()
  })
  .catch(() => {
    console.log('Error finding web3.')
  })
}

instantiateContract() {
  /*
   * SMART CONTRACT EXAMPLE
   *
   * Normally these functions would be called in the context of a
   * state management library, but for convenience I've placed them here.
   */

  const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        this.simpleStorageInstance = instance
        this.setState({ account: accounts[0] })
        // Get the value from the contract to prove it worked.
        return this.simpleStorageInstance.get.call(accounts[0])
      }).then((ipfsHash) => {
        // Update state with the result.
        return this.setState({ ipfsHash })
      })
    })
    console.log("Account instantiated!")
}

captureFile(event) {
  console.log("This is the captureFile function");
  event.preventDefault()
  const file = event.target.files[0]
  const reader = new window.FileReader()
  reader.readAsArrayBuffer(file)
  reader.onloadend = () => {
    this.setState({ buffer: Buffer(reader.result) })
    console.log('buffer', this.state.buffer)
    this.state.ipfsHash= uploadToPinata(file);
    console.log(this.state.ipfsHash);
      
  }
}

onSubmit = (event) => {
  event.preventDefault()
    ipfs.files.add(this.state.buffer, (error, result) => {
      if(error) {
        console.error(error)
        return
      }
      this.simpleStorageInstance.set(result[0].hash, { from: this.state.account }).then((r) => {
        return this.setState({ ipfsHash: result[0].hash })
        console.log('ifpsHash', this.state.ipfsHash)
      })
    })
}


// Upload to Pinata


render() {
  return (
    <div className="App">
      <nav className="navbar navbar-light bg-dark p-0 shadow text-white">
        <h1>Reality Check</h1>
      </nav>
      <div className="content mr-auto ml-auto">
      <img src={logo} className="App-logo" alt="logo" width="150px" />
      <p>&nbsp;</p>
      <h1>Reality Check</h1>
      <p>&nbsp;</p>
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Your Image</h1>
            <p>Your image will be stored on IPFS!</p>
            <h2>Upload Image</h2>
            {/* <p>URL: `https://gateway.pinata.cloud/ipfs/${this.state.ipfsHash}`</p> */}
            <form onSubmit={this.onSubmit} >
              <input type='file' onChange={this.captureFile} />
              <input type='submit' />
              
              
              {/* App.getElementById("demo").innerHTML = ImgHash; */}
            </form>
            
          </div>
        </div>
        
      </main>
      </div>
    </div>
  );
}

}
export default App;
