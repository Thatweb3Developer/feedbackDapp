const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    const waveContract = await waveContractFactory.deploy();
    await waveContract.waitForDeployment();

    console.log("Contract deployed to:", await waveContract.getAddress());
    console.log("Contract deployed by:", owner.address);

    let waveCount;
    waveCount = await waveContract.getTotalWaves();
    console.log(Number(waveCount))

    let waveTxn = await waveContract.wave("Hello Ada.");
    await waveTxn.wait();

    waveTxn = await waveContract.connect(randomPerson).wave("Hello again Ada.")
    await waveTxn.wait();

    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves)
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();