const IPFS= require('ipfs-api')
// const { prototype } = require('react-bootstrap/lib/Accordion')
const ipfs= new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

export default ipfs;