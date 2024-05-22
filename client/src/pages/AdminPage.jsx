import React, { useEffect, useState } from 'react';
import web3Connection from '../utils/web3.js';
import VerificationSmartContract from '../utils/VerificationSmartContract.js';

const AdminPage = () => {
  const [web3, setWeb3] = useState(null);
  const [verificationSmartContract, setVerificationSmartContract] = useState(null);
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');

  const [totalArticleURLs, setTotalArticleURLs] = useState('');
  const [totalArticleImages, setTotalArticleImages] = useState('');

  // to set the title of the page
  useEffect(() => { document.title = 'Admin | RealityCheck | DApp' }, []);

  // to connect to the blockchain
  useEffect(() => {
    const init = async () => {
      try {
        const _web3 = await web3Connection();
        const accounts = await _web3.eth.getAccounts();
        _web3.eth.defaultAccount = accounts[0];
        const _verificationSmartContract = await VerificationSmartContract(_web3);

        setWeb3(_web3);
        setAddress(_web3.eth.defaultAccount);
        setVerificationSmartContract(_verificationSmartContract);

        getTotals(_verificationSmartContract);
      } catch (error) {
        console.error(error);
      }
    }

    init();
  }, []);

  const getTotals = async (contract) => {
    try {
      if (!contract) {
        console.error("VerificationSmartContract Not Initialized!");
        return;
      }

      setStatus("Fetching Totals...");
      const _totalArticleURLs = await contract.methods.getURLCount().call();
      setTotalArticleURLs(`${_totalArticleURLs}`);

      const _totalArticleImages = await contract.methods.getIPFSHashCount().call();
      setTotalArticleImages(`${_totalArticleImages}`);

      setStatus(null);
    } catch (error) {
      setStatus(null);
      console.error("Error Fetching Totals:", error);
    }
  }

  // to handle the form submission for article URL
  const handleArticleURLSubmit = async (event) => {
    event.preventDefault();

    const articleURL = event.target['article-url'].value;
    try {
      if (!verificationSmartContract) {
        console.error("VerificationSmartContract Not Initialized!");
        return;
      }

      setStatus("Checking if Article URL is Already Added...");
      const isAlreadyAdded = await verificationSmartContract.methods.verifyMetadata(articleURL).call();
      if (isAlreadyAdded[0]) {
        setStatus(null);
        alert("This Article URL is Already Added to the Blockchain!");
        return;
      }

      setStatus("Adding Article URL to the Blockchain...");
      await verificationSmartContract.methods.addMetadata(articleURL).send({ from: web3.eth.defaultAccount });
      setStatus(null);
      alert("Article URL Added Successfully to the Blockchain!");

      getTotals(verificationSmartContract);
      event.target.reset();
    } catch (error) {
      setStatus(null);
      console.error("Error Adding Article URL to the Blockchain:", error);
      alert("Error Adding Article URL to the Blockchain. Please Try Again Later.");
    }
  }

  const uploadToPinata = async (data, fileName) => {
    const formData = new FormData();
    formData.append('file', data);
    formData.append("pinataMetadata", JSON.stringify({ name: fileName }));
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiMTQzZmZiNS00NWEzLTQwYTMtODYzNi1hYzJjY2ViZTRhMzciLCJlbWFpbCI6Imh5cGhlbnNhYWRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjcyOThlZGViNTkxMGNmYzcyNjRiIiwic2NvcGVkS2V5U2VjcmV0IjoiY2RiYjc0NDBhMWFkZmVhOTdhYmU4YWQ3OTU2ZGE3YTI2Y2UxZTA4MWQ3NmI4OWI5MDVlYmJmMzJmZTUyYTQyZiIsImlhdCI6MTcxNjExMjI1MX0.ZbHSrYiXDtspi680AATrrVjK5nIucGX3MppRBIdv3pA`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.error("Error Uploading to Pinata:", error);
      return null;
    }
  }

  // to handle the form submission for article image
  const handleArticleImageSubmit = async (event) => {
    event.preventDefault();

    const articleImage = event.target['article-image'].files[0];
    try {
      if (!verificationSmartContract) {
        console.error("VerificationSmartContract Not Initialized!");
        return;
      }

      setStatus("Processing for IPFS...");
      const ipfsHash = await uploadToPinata(articleImage, articleImage.name);
      if (!ipfsHash) {
        setStatus(null);
        alert("Error Uploading Image to IPFS. Please Try Again Later.");
        return;
      }

      setStatus("Checking if Article Image is Already Added...");
      const isAlreadyAdded = await verificationSmartContract.methods.verifyMetadata(ipfsHash.IpfsHash).call();
      if (isAlreadyAdded[0]) {
        setStatus(null);
        alert("This Article Image is Already Added to the Blockchain!");
        return;
      }

      setStatus("Adding Article Image to the Blockchain...");
      await verificationSmartContract.methods.addMetadata(ipfsHash.IpfsHash).send({ from: web3.eth.defaultAccount });
      setStatus(null);
      alert("Article Image Added Successfully to the Blockchain!");

      getTotals(verificationSmartContract);
      event.target.reset();
    } catch (error) {
      setStatus(null);
      console.error("Error Adding Article Image to the Blockchain:", error);
      alert("Error Adding Article Image to the Blockchain. Please Try Again Later.");
    }
  }

  return (
    <div style={{ height: '100vh', 'background': 'linear-gradient(-135deg, #7aafff 0%, #f4ffbd 100%)' }}>
      <div className="container">
      
      <h1 className="fw-bold m-0 p-0 lh-1 pt-3 fs-2 ps-3 d-flex justify-content-between align-items-end">
          <a href="/" className="text-decoration-none">
            <span className="text-primary">Reality</span><span className="text-danger">Check</span>
            
          </a>
          <span className="text-muted fs-5 fw-medium pe-3 d-flex align-items-center">
            <small><span className="badge bg-primary ms-2">{address}</span></small>
          </span>
        </h1>
        <hr style={{ 'color': 'rgba(0, 0, 0, 0.5)' }} className="w-100 my-3" />

        <div className="row gx-3 mx-2">
          <div className="col-12 col-md-6">
            <div className="card bg-light shadow-sm">
              <div className="card-body">
                <h5 className="card-title">
                  Article URL
                  <span className="badge bg-primary ms-2">{totalArticleURLs}</span>
                </h5>
                <form method="post" onSubmit={handleArticleURLSubmit}>
                  <div className="mb-3">
                    <label htmlFor="article-url" className="form-label">Enter the URL of the article:</label>
                    <input type="url" className="form-control" id="article-url" name="article-url" required title="Enter a valid URL" />
                  </div>
                  <input type="submit" className="btn btn-primary" value="Submit" />
                </form>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card bg-light shadow-sm">
              <div className="card-body">
                <h5 className="card-title">
                  Article Image
                  <span className="badge bg-primary ms-2">{totalArticleImages}</span>
                </h5>
                <form method="post" onSubmit={handleArticleImageSubmit}>
                  <div className="mb-3">
                    <label htmlFor="article-image" className="form-label">Upload the image of the article:</label>
                    <input type="file" className="form-control" id="article-image" name="article-image" required accept="image/*" />
                  </div>
                  <input type="submit" className="btn btn-primary" value="Submit" />
                </form>
              </div>
            </div>
          </div>
        </div>

        {status && <div className="alert alert-primary mt-3 mx-3" role="alert">{status}</div>}
      </div>
    </div>
  );
}

export default AdminPage;