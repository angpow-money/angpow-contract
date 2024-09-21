






async function deploy() {


    /// create subscription
  
    const AngpowContract = await ethers.getContractFactory("AngpowContractVrf");
    const Angpow = await upgrades.deployProxy(AngpowContract, [
        "22801227587661655003467987765284161045858356877819651457996327945409681405273", // subscription id
        "0x5CE8D5A2BC84beb22a398CCA51996F7930313D61", // coordinator, arb sepolia
        "0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be", // keyhash

    ]);
    await Angpow.waitForDeployment();
    console.log(Angpow.target)

    ///
    /// add consumer
    /// fund subscription




}
// deploy()


async function create() {

    const AngpowContract = await ethers.getContractFactory("AngpowContractVrf");
    const Angpow = await AngpowContract.attach("0xAbA0C75c3E1e9Beaab156643CC3A1Fa3E8af36E2");

    const id = 0;
    const token = ethers.ZeroAddress;
    const tokenAmount = ethers.parseEther("0.000001");
    const quantity = 10;
    const isRandom = true;

    await Angpow.createAngpow(
        id,
        token,
        tokenAmount,
        quantity,
        isRandom,
        { value: tokenAmount }
    )



}
// create()




async function receive() {


    const AngpowContract = await ethers.getContractFactory("AngpowContractVrf");
    const Angpow = await AngpowContract.attach("0xAbA0C75c3E1e9Beaab156643CC3A1Fa3E8af36E2");

    console.log( await Angpow.angpowOf(0) );

    const id = 0;
    const recipient = "0xC2264dCcb9de4c8bb57b05720065e226978b7E4C";

    try {

        const tx = await Angpow.receiveAngpow(
            id,
            recipient,
        )
        console.log(tx)

    } catch(error) {
        
        console.log(error);

    }

}
receive();




