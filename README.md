## Aggregator Smart Contract

This project demonstrates the 'aggregator' smart contract whose job is to execute multiple calls received in the calldata.
Here specifically we are executing 2 swap methods of AMMs namely **Uniswap** & **Sushiswap** and in one transaction thanks to the Aggregator Contract.
This idea can be utilized to create a transaction batcher contract to save gas cost by executing multiple transactions in one. 

<a href="https://github.com/ammarhaiderak/AggregatorContract">See Contract Repo Here</a>

## Steps
### Run a Mainnet Fork and pick one private key
```
npx hardhat node --fork 'https://rpc.ankr.com/eth'
```

### Deploy the contract
```
npx hardhat run scripts/deploy.js --network forked
```


## Hardhat
```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```
