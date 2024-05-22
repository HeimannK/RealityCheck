// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VerificationSmartContract {
    struct Metadata {
        string data; // Can be URL or IPFS hash
        address addedBy;
        bool exists; // To check existence
        uint256 timestamp; // Timestamp when the data was added
    }

    mapping(string => Metadata) private metadataStore;
    uint256 private urlCount;
    uint256 private ipfsHashCount;
    
    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    event MetadataAdded(string indexed data, address indexed addedBy, uint256 timestamp);

    constructor() {
        admin = msg.sender;
    }

    function addMetadata(string memory data) public onlyAdmin {
        require(bytes(data).length > 0, "Data cannot be empty");
        require(!metadataStore[data].exists, "Data already exists");

        metadataStore[data] = Metadata(data, msg.sender, true, block.timestamp);

        // Check if the data is a URL or an IPFS hash
        if (bytes(data).length > 7 && (compareStrings(data, "http://") || compareStrings(data, "https://"))) {
            urlCount++;
        } else {
            ipfsHashCount++;
        }

        emit MetadataAdded(data, msg.sender, block.timestamp);
    }

    function verifyMetadata(string memory data) public view returns (bool, address, uint256) {
        if (metadataStore[data].exists) {
            return (true, metadataStore[data].addedBy, metadataStore[data].timestamp);
        } else {
            return (false, address(0), 0);
        }
    }

    function getURLCount() public view returns (uint256) {
        return urlCount;
    }

    function getIPFSHashCount() public view returns (uint256) {
        return ipfsHashCount;
    }

    // Helper function to compare string prefixes
    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        bytes memory aBytes = bytes(a);
        bytes memory bBytes = bytes(b);
        if (aBytes.length < bBytes.length) {
            return false;
        }
        for (uint256 i = 0; i < bBytes.length; i++) {
            if (aBytes[i] != bBytes[i]) {
                return false;
            }
        }
        return true;
    }
}
