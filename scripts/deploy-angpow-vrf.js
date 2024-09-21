






async function deploy() {

  
    const AngpowContract = await ethers.getContractFactory("AngpowContractVrf");
    const Angpow = await upgrades.deployProxy(AngpowContract, [
        "22801227587661655003467987765284161045858356877819651457996327945409681405273", // subscription id
        "0x5CE8D5A2BC84beb22a398CCA51996F7930313D61", // coordinator, arb sepolia
        "0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be", // keyhash

    ]);
    await Angpow.waitForDeployment();
    console.log(Angpow.target)


    /// add consumer

    

}

deploy()






