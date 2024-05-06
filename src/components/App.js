import React, { Component } from 'react';
import logo from '../logo.png';
import './App.css';
import ipfs from './ipfs';
import getWeb3 from '../utils/getWeb3'
// import SimpleStorageContract from '../build/contracts/SimpleStorage.json' 



class App extends Component {

  

  constructor(props) {
    const projectId= ''
    const projectSecret= ''
    super(props);
    this.state = { 
      buffer: null,
      storagevalue: 0,
      web3: null,
      ipfsHash: '',
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

// instantiateContract() {

// }

captureFile(event) {
  event.preventDefault()
  const file = event.target.files[0]
  const reader = new window.FileReader()
  reader.readAsArrayBuffer(file)
  reader.onloadend = () => {
    this.setState({ buffer: Buffer(reader.result) })
    console.log('buffer', this.state.buffer)
  }
}

onSubmit = (event) => {
  event.preventDefault()
  console.log("Submitting the form...")
  ipfs.files.add(this.state.buffer, (error, result)=>{
    if(error){
      console.error(error)
      return
    }
    
    console.log('ipfsHash', this.state.ipfsHash)
    
    return this.setState({ ipfsHash: result[0].hash })
  }
  )
}


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
            <img src={`https://mainnet.infura.io/v3/bab21bbeed294cc7a2d06281b995bd41${this.state.ipfsHash}`} alt=""/>
            <h2>Upload Image</h2>
            <form onSubmit={this.onSubmit} >
              <input type='file' onChange={this.captureFile} />
              <input type='submit' />
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
