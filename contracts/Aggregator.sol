// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract Aggregator {
    address private constant AMM1 = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;   // uniswap
    address private constant AMM2 = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;  // sushiswap

    event CallEvent(uint idx, bool status, address amm, uint amount);

    function execute(bytes[] calldata calls) external payable {
        uint oneCallEth = calls.length > 0 ? msg.value / calls.length : msg.value;
        require(oneCallEth > 0, 'insufficient eth sent');
        uint i;
        for(; i < calls.length / 2; i++) {
            (bool success,) = AMM1.call{value: oneCallEth}(calls[i]);
            require(success, 'one of the calls failed');
            emit CallEvent(i, success, AMM1, oneCallEth);
        }
        for(; i < calls.length; i++) {
            (bool success,) = AMM2.call{value: oneCallEth}(calls[i]);
            require(success, 'one of the calls failed');
            emit CallEvent(i, success, AMM2, oneCallEth);
        }
    }
}