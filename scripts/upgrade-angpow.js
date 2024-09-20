



async function deploy() {

  
    const AngpowContract = await ethers.getContractFactory("AngpowContract");
    const Angpow = await upgrades.upgradeProxy("0x353fCB9FE729a892E9716fcC142262d7635DFF6f", AngpowContract);
    await Angpow.waitForDeployment();
    console.log(Angpow.target)



}

deploy()



