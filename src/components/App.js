import React, { Component } from 'react';
import logo from '../logo.png';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      buffer: null 
    };
  }

  captureFile = (event) => {
    event.preventDefault()
    // process file for IPFS
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result)})
    }
  }

  onSubmit = (event) => {
    event.preventDefault()
    console.log("Submitting the form...")
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-light bg-dark p-0 shadow text-white">
        <h1>Reality Check</h1>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <img src={logo} className="App-logo" alt="logo" width="150px" />
                <p>&nbsp;</p>
                <h1>Reality Check</h1>
                <p>&nbsp;</p>
                <div className="wrapper">
                <div className="form">
                  <form onSubmit={this.onSubmit}> 
                    <p>
                      <label htmlFor="urlInput" id="urlLabel">Enter the URL:</label>
                      <input type="url" id="urlInput" />
                    </p>
                    <p>
                      <label htmlFor="fileInput" id="fileLabel">Upload an Image:</label>
                      <input type="file" id="fileInput" onChange={this.captureFile}/>
                    </p>
                    <p>
                      <input type="button" id="cancelBtn" value="Cancel" />
                      <input type="submit" id="submitBtn" value="Submit" />
                    </p>
                  </form>
                </div>
                </div>                
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
