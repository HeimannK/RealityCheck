import React from 'react';

const HomePage = () => {
  document.title = 'RealityCheck | DApp';

  return (
    <div className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: '100vh', 'background': 'white' }}>
      <h1 className="fw-bold m-0 p-0 lh-1">
        <img src="./assets/logo.jpeg" alt="RealityCheck" style={{ height: '7.5rem', borderRadius: '1rem' }} />
      </h1>

      <hr style={{ maxWidth: '500px', 'color': 'rgba(0, 0, 0, 0.5)' }} className="w-100 my-3" />
      <p style={{ maxWidth: '500px' }} className="text-center opacity-75 lh-sm m-0">
        A blockchain-based system ensuring the authenticity of ABC Pty. Ltd.'s news articles and images through secure smart contracts.
      </p>
      <hr style={{ maxWidth: '500px', 'color': 'rgba(0, 0, 0, 0.5)' }} className="w-100 my-3" />

      <div className="d-flex gap-2">
        <a href="/admin" className="btn btn-danger py-1 px-4">Admin</a>
        <a href="/user" className="btn btn-primary py-1 px-4">User</a>
      </div>
    </div>
  );
}

export default HomePage;
