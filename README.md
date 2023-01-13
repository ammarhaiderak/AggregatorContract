# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

### Steps
## Run a Mainnet Fork and pick one private key
```
npx hardhat node --fork 'https://rpc.ankr.com/eth'
```

## Deploy the contract
```
npx hardhat run scripts/deploy.js --network forked
```