const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");


describe("Angpow", function () {

    async function deploy() {
        const [owner, donator, recipient, admin] = await ethers.getSigners();

        const AngpowContract = await ethers.getContractFactory("AngpowContract");
        const Angpow = await upgrades.deployProxy(AngpowContract);

        return { Angpow, owner, donator, recipient, admin };
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


    describe("receive angpow", function () {

        it("should receive angpow", async function () {

            const { Angpow, owner, donator, recipient } = await loadFixture(deploy);
    
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 1;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                { value: tokenAmount }
            )
    
            await expect(
                Angpow.connect(owner).receiveAngpow(
                    id,
                    recipient.address
                )
            ).to.emit(
                Angpow, "AngpowReceived"
            ).withArgs(
                recipient.address,
                id,
                token,
                tokenAmount,
                quantity
            )

        })

        it("should able to grant admin role to receive angpow", async function () {

            const { Angpow, owner, donator, recipient, admin } = await loadFixture(deploy);
    
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 1;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                { value: tokenAmount }
            )

            await Angpow.connect(owner).addAdmin(admin.address);
    
            await expect(
                Angpow.connect(admin).receiveAngpow(
                    id,
                    recipient.address
                )
            ).to.emit(
                Angpow, "AngpowReceived"
            ).withArgs(
                recipient.address,
                id,
                token,
                tokenAmount,
                quantity
            )

        })

        it("should not receive more than quantity allowed", async function () {

            const { Angpow, owner, donator, recipient } = await loadFixture(deploy);
    
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 1;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                { value: tokenAmount }
            )
            
            await Angpow.connect(owner).receiveAngpow(
                id,
                recipient.address
            )

            await expect(
                Angpow.connect(owner).receiveAngpow(
                    id,
                    recipient.address
                )
            ).to.be.revertedWith("Fully claimed.");

        })

        it("should not send token when insufficient balance", async function () {

            const { Angpow, owner, donator, recipient } = await loadFixture(deploy);
    
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 1;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                { value: tokenAmount }
            )

            await Angpow.connect(owner).withdrawEth();

            await expect(
                Angpow.connect(owner).receiveAngpow(
                    id,
                    recipient.address
                )
            ).to.be.revertedWith("Failed to send Ether.");

        })

    })

})