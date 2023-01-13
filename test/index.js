const { expect } = require("chai");
const { ethers } = require("hardhat");

const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const UNISWAP_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';  // AMM1
const SUSHISWAP_ROUTER = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';  // AMM2

const routerInterface = new ethers.utils.Interface([
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)'
]);


describe("Aggregator Test", function () {
  let aggregatorContr;
  let wallets;
  let router;
  let router2;

  before(async () => {
      wallets = await ethers.getSigners();
      const Aggregator = await ethers.getContractFactory('Aggregator');
      aggregatorContr  = await Aggregator.deploy();
      await aggregatorContr.deployed();
      router = await ethers.getContractAt('IUniswapV2Router01', UNISWAP_ROUTER)
      router2 = await ethers.getContractAt('IUniswapV2Router01', SUSHISWAP_ROUTER)
  });


  it("swap usdc with ETH from Aggregator", async () => {
    const val = ethers.utils.parseEther('1');
    const deadline = Math.ceil(Number(new Date() / 1000)) + 10 * 60;
    const usdc = await ethers.getContractAt('IERC20', USDC);

    const usdcAmountBefore = await usdc.balanceOf(wallets[0].address);
    const encoded = routerInterface.encodeFunctionData("swapExactETHForTokens", [
      0,
      [WETH,USDC],
      wallets[0].address,
      deadline
    ]);
    await aggregatorContr.execute([encoded], {value: val});
    const usdcAmountAfter = await usdc.balanceOf(wallets[0].address);
    expect(usdcAmountAfter).to.be.gt(usdcAmountBefore);
  });


  it("swap two routes of usdc/ETH from Aggregator", async () => {
    const val = ethers.utils.parseEther('10');
    const deadline = Math.ceil(Number(new Date() / 1000)) + 10 * 60;
    const usdc = await ethers.getContractAt('IERC20', USDC);

    const expectedAmountAMM1 = (await router.getAmountsOut(val.div(2), [WETH, USDC]))[1];
    const expectedAmountAMM2 = (await router2.getAmountsOut(val.div(2), [WETH, USDC]))[1];
    const [usdcAmountBefore1, usdcAmountBefore2] = await Promise.all([usdc.balanceOf(wallets[1].address), usdc.balanceOf(wallets[2].address)]);
    const encoded1 = routerInterface.encodeFunctionData("swapExactETHForTokens", [
      0,
      [WETH,USDC],
      wallets[1].address,
      deadline
    ]);
    const encoded2 = routerInterface.encodeFunctionData("swapExactETHForTokens", [
      0,
      [WETH,USDC],
      wallets[2].address,
      deadline
    ]);
    await aggregatorContr.execute([encoded1, encoded2], {value: val});
    const [usdcAmountAfter1, usdcAmountAfter2] = await Promise.all([usdc.balanceOf(wallets[1].address), usdc.balanceOf(wallets[2].address)]);

    console.log('AMM1 =>')
    console.log('usdcAmountBefore1', usdcAmountBefore1.toString())
    console.log('usdcAmountAfter1', usdcAmountAfter1.toString())
    console.log('expected amount AMM1', expectedAmountAMM1.toString())
    console.log('AMM2 =>')
    console.log('usdcAmountBefore2', usdcAmountBefore2.toString())
    console.log('usdcAmountAfter2', usdcAmountAfter2.toString())
    console.log('expected amount AMM2', expectedAmountAMM2.toString())

    expect(expectedAmountAMM1).to.be.eq(usdcAmountAfter1);
    expect(expectedAmountAMM2).to.be.eq(usdcAmountAfter2);
    expect(usdcAmountAfter1).to.be.gt(usdcAmountBefore1);
    expect(usdcAmountAfter2).to.be.gt(usdcAmountBefore2);
  });


  it("Verify CallEvents", async () => {
    const val = ethers.utils.parseEther('10');
    const deadline = Math.ceil(Number(new Date() / 1000)) + 10 * 60;
    const usdc = await ethers.getContractAt('IERC20', USDC);

    const encoded1 = routerInterface.encodeFunctionData("swapExactETHForTokens", [
      0,
      [WETH,USDC],
      wallets[1].address,
      deadline
    ]);
    const encoded2 = routerInterface.encodeFunctionData("swapExactETHForTokens", [
      0,
      [WETH,DAI],
      wallets[2].address,
      deadline
    ]);
    const resp = await aggregatorContr.execute([encoded1, encoded2], {value: val});
    const receipt = await resp.wait();

    const callevents = receipt['events'].filter((e) => e.event == 'CallEvent');

    const {idx: idx1, amm: amm1, amount: amount1} = await callevents[0].args;
    const {idx: idx2, amm: amm2, amount: amount2} = await callevents[1].args;

    expect(amm1, 'amm1 should be uniswap').to.be.eq(UNISWAP_ROUTER);
    expect(amm2, 'amm2 should be sushiswap').to.be.eq(SUSHISWAP_ROUTER);
    expect(idx1, 'index of first calldata should be 0').to.be.eq(0);
    expect(idx2, 'index of first calldata should be 1').to.be.eq(1);
    expect(amount1, 'input amount amm1 mismatched').to.be.eq(val.div(2));
    expect(amount2, 'input amount amm2 mismatched').to.be.eq(val.div(2));
  });

});
