const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");


describe("Angpow", function () {

    async function deploy() {
        const [owner, donator, recipient] = await ethers.getSigners();

        const AngpowContract = await ethers.getContractFactory("AngpowContract");
        const Angpow = await AngpowContract.deploy();

        return { Angpow, owner, donator, recipient };
    }


    describe("create angpow", function () {

        it("should create angpow", async function () {

            const { Angpow, owner, donator, recipient } = await loadFixture(deploy);
    
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 1;
    
            await expect(
                Angpow.connect(donator).createAngpow(
                    id,
                    token,
                    tokenAmount,
                    quantity,
                    { value: tokenAmount }
                )
            ).to.emit(
                Angpow, "AngpowCreated"
            ).withArgs(
                donator.address,
                id,
                token,
                tokenAmount,
                quantity
            )

        })


    })

})