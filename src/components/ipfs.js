const IPFS= require('ipfs-api')
// const { prototype } = require('react-bootstrap/lib/Accordion')
const ipfs= new IPFS({ host: 'https://api.pinata.cloud/pinning/pinFileToIPFS', port: 5001, protocol: 'https'})

export default ipfs;
