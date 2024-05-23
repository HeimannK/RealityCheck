import React, { useEffect, useState } from 'react';
import web3Connection from '../utils/web3.js';
import VerificationSmartContract from '../utils/VerificationSmartContract.js';
import { JWT_TOKEN } from '../utils/cred.js';

const UserPage = () => {
  const [verificationSmartContract, setVerificationSmartContract] = useState(null);
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [isPublishedByABC, setIsPublishedByABC] = useState(null);

  // to set the title of the page
  useEffect(() => { document.title = 'User | RealityCheck | DApp' }, []);

  // to connect to the blockchain
  useEffect(() => {
    const init = async () => {
      try {
        const _web3 = await web3Connection();
        const accounts = await _web3.eth.getAccounts();
        _web3.eth.defaultAccount = accounts[0];
        const _verificationSmartContract = await VerificationSmartContract(_web3);

        setAddress(_web3.eth.defaultAccount);
        setVerificationSmartContract(_verificationSmartContract);
      } catch (error) {
        console.error(error);
      }
    }

    init();
  }, []);

  // to handle the form submission for verification by article URL
  const handleVerifyByArticleURLSubmit = async (event) => {
    event.preventDefault();
    setIsPublishedByABC(null);

    const articleURL = event.target['article-url'].value;
    try {
      if (!verificationSmartContract) {
        console.error("VerificationSmartContract Not Initialized!");
        return;
      }

      setStatus("Verifying Article URL...");
      const isAlreadyAdded = await verificationSmartContract.methods.verifyMetadata(articleURL).call();
      setIsPublishedByABC(isAlreadyAdded[0]);
      setStatus(null);

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
        headers: { 'Authorization': `Bearer ${JWT_TOKEN}` },
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

  // to handle the form submission for verification by article image
  const handleVerifyByArticleImageSubmit = async (event) => {
    event.preventDefault();
    setIsPublishedByABC(null);

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

      setStatus("Verifying Article Image...");
      const isAlreadyAdded = await verificationSmartContract.methods.verifyMetadata(ipfsHash.IpfsHash).call();

      if (!isAlreadyAdded[0]) {
        await fetch(`https://api.pinata.cloud/pinning/unpin/${ipfsHash.IpfsHash}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${JWT_TOKEN}` },
        });
      }

      setIsPublishedByABC(isAlreadyAdded[0]);
      setStatus(null);

      event.target.reset();
    } catch (error) {
      setStatus(null);
      console.error("Error Adding Article Image to the Blockchain:", error);
      alert("Error Adding Article Image to the Blockchain. Please Try Again Later.");
    }
  }

  return (
    <div style={{ height: '100vh', 'background': 'white' }}>
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

        {isPublishedByABC !== null && <div className="alert alert-primary mt-3 mx-3 dismissible fade show d-flex justify-content-between align-items-center" role="alert">
          {isPublishedByABC ? "The Article is Published by ABC." : "The Article is NOT Published by ABC."}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>}

        <div className="row gx-3 mx-2">
          <div className="col-12 col-md-6">
            <div className="card bg-light shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Verification by URL</h5>
                <form method="post" onSubmit={handleVerifyByArticleURLSubmit}>
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
                <h5 className="card-title">Verification by Image</h5>
                <form method="post" onSubmit={handleVerifyByArticleImageSubmit}>
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

export default UserPage;
