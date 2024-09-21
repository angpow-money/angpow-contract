const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");


const BASEFEE = "100000000000000000";
const GASPRICELINK = "1000000000";
const WEIPERUNITLINK = "4496920000000000";

function subsEvent(_receipt, _contract) {
    const event = _receipt.logs.find(log => {
      try {
        return _contract.interface.parseLog(log).name === "SubscriptionCreated";
      } catch (error) {
        return false;
      }
    });
    const parsedLog = _contract.interface.parseLog(event);
    const { args } = parsedLog;
    return args;
}

describe("Angpow", function () {

    async function deploy() {
        const [owner, donator, recipient, admin] = await ethers.getSigners();

        const MockContract = await ethers.getContractFactory("VRFCoordinatorV2_5Mock");
        const Mock = await MockContract.deploy(
            BASEFEE,
            GASPRICELINK,
            WEIPERUNITLINK,
        );

        const tx = await Mock.connect(owner).createSubscription();
        const receipt = await tx.wait();
        const subsId = subsEvent(receipt, Mock)[0];
        // console.log('subsId', subsId);

        await Mock.connect(owner).fundSubscription(
            subsId,
            "1000000000000000000000"
        );


        const AngpowContract = await ethers.getContractFactory("AngpowContractVrf");
        const Angpow = await upgrades.deployProxy(AngpowContract, [
            subsId,
            Mock.target,
            "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae"
        ]);

        const randomNumberContractAddress = await Angpow.RandomNumberContract();
        const RNContract = await ethers.getContractFactory("RandomNumberMachineMock");
        const RN = RNContract.attach(randomNumberContractAddress);
        await Mock.connect(owner).addConsumer(
            subsId,
            RN.target,
        )

        return { Angpow, owner, donator, recipient, admin, Mock, RN };
    }


    describe("work work work", function () {

        it("www 1", async function() {

            const { Angpow, owner, donator, recipient } = await loadFixture(deploy);
            
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 1;
            const isRandom = true;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                isRandom,
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

        it.only("www 2", async function() {

            const { Angpow, owner, donator, recipient, Mock, RN } = await loadFixture(deploy);
            
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 5;
            const isRandom = true;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                isRandom,
                { value: tokenAmount }
            )


            
            // console.log(1, await RN.s_requestId());

            await Angpow.connect(owner).receiveAngpow(
                id,
                recipient.address
            )

            // console.log(2, await RN.s_requestId());

            /// for testnet and local mock test onyl
            const requestId = await RN.s_requestId();
            await Mock.connect(owner).fulfillRandomWords(
                requestId,
                RN.target
            )
            ///

            // console.log(3, await RN.s_requestId());

            console.log();

            let angpownow = await Angpow.angpowOf(id);
            console.log('claim', ethers.formatEther((await Angpow.angpowOf(id))[7]) );

            const loop = Number(angpownow[5] - angpownow[6]) - 1;
            for(let i=0; i<loop; i++) {

                await Angpow.connect(owner).receiveAngpow(
                    id,
                    recipient.address
                )

                /// for testnet and local mock test onyl
                const requestId = await RN.s_requestId();
                await Mock.connect(owner).fulfillRandomWords(
                    requestId,
                    RN.target
                )
                ///

                // console.log(await Angpow.angpowOf(id));
                console.log('claim', ethers.formatEther((await Angpow.angpowOf(id))[7]) );

            }

            await Angpow.connect(owner).receiveAngpow(
                id,
                recipient.address
            )
            console.log('claim', ethers.formatEther((await Angpow.angpowOf(id))[7]) );

        })


        it.only("www 3", async function() {

            const { Angpow, owner, donator, recipient, Mock, RN } = await loadFixture(deploy);
            
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 10;
            const isRandom = true;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                isRandom,
                { value: tokenAmount }
            )


            
            // console.log(1, await RN.s_requestId());

            await Angpow.connect(owner).receiveAngpow(
                id,
                recipient.address
            )

            // console.log(2, await RN.s_requestId());

            /// for testnet and local mock test onyl
            const requestId = await RN.s_requestId();
            await Mock.connect(owner).fulfillRandomWords(
                requestId,
                RN.target
            )
            ///

            // console.log(3, await RN.s_requestId());

            console.log();

            let angpownow = await Angpow.angpowOf(id);
            console.log('claim', ethers.formatEther((await Angpow.angpowOf(id))[7]) );

            const loop = Number(angpownow[5] - angpownow[6]) - 1;
            for(let i=0; i<loop; i++) {

                await Angpow.connect(owner).receiveAngpow(
                    id,
                    recipient.address
                )

                /// for testnet and local mock test onyl
                const requestId = await RN.s_requestId();
                await Mock.connect(owner).fulfillRandomWords(
                    requestId,
                    RN.target
                )
                ///

                // console.log(await Angpow.angpowOf(id));
                console.log('claim', ethers.formatEther((await Angpow.angpowOf(id))[7]) );

            }

            await Angpow.connect(owner).receiveAngpow(
                id,
                recipient.address
            )
            console.log('claim', ethers.formatEther((await Angpow.angpowOf(id))[7]) );

        })

    })


    describe("create angpow", function () {

        it("should create angpow", async function () {

            const { Angpow, owner, donator, recipient } = await loadFixture(deploy);
    
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 1;
            const isRandom = true;
    
            await expect(
                Angpow.connect(donator).createAngpow(
                    id,
                    token,
                    tokenAmount,
                    quantity,
                    isRandom,
                    { value: tokenAmount }
                )
            ).to.emit(
                Angpow, "AngpowCreated"
            ).withArgs(
                donator.address,
                id,
                token,
                tokenAmount,
                quantity,
                isRandom
            )

        })

        it("should not create angpow with same id", async function () {

            const { Angpow, owner, donator, recipient } = await loadFixture(deploy);
    
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 1;
            const isRandom = false;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                isRandom,
                { value: tokenAmount }
            )
    
            await expect(
                Angpow.connect(donator).createAngpow(
                    id,
                    token,
                    tokenAmount,
                    quantity,
                    isRandom,
                    { value: tokenAmount }
                )
            ).to.be.revertedWith("Id used.")

        })

    })


    describe("receive angpow", function () {

        it("should receive angpow", async function () {

            const { Angpow, owner, donator, recipient } = await loadFixture(deploy);
    
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 1;
            const isRandom = false;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                isRandom,
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

        it("should send ether when receive angpow", async function () {

            const { Angpow, owner, donator, recipient } = await loadFixture(deploy);
    
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 1;
            const isRandom = false;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                isRandom,
                { value: tokenAmount }
            )
    
            await expect(
                Angpow.connect(owner).receiveAngpow(
                    id,
                    recipient.address
                )
            ).changeEtherBalances(
                [Angpow.target, recipient.address],
                [-tokenAmount, tokenAmount]
            )

        })

        it("should able to grant admin role to receive angpow", async function () {

            const { Angpow, owner, donator, recipient, admin } = await loadFixture(deploy);
    
            const id = 0;
            const token = ethers.ZeroAddress;
            const tokenAmount = ethers.parseEther("10");
            const quantity = 1;
            const isRandom = false;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                isRandom,
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
            const isRandom = false;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                isRandom,
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
            const isRandom = false;

            await Angpow.connect(donator).createAngpow(
                id,
                token,
                tokenAmount,
                quantity,
                isRandom,
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