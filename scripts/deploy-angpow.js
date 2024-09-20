



async function deploy() {

  
    const AngpowContract = await ethers.getContractFactory("AngpowContract");
    const Angpow = await upgrades.deployProxy(AngpowContract);
    await Angpow.waitForDeployment();
    console.log(Angpow.target)


}

deploy()



