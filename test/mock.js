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

        const [owner] = await ethers.getSigners();

        const MockContract = await ethers.getContractFactory("VRFCoordinatorV2_5Mock");
        const Mock = await MockContract.deploy(
            BASEFEE,
            GASPRICELINK,
            WEIPERUNITLINK,
        );



        return { owner, Mock };
    }


    describe("deploy", function () {

        it("should work", async function () {

            const { owner, Mock } = await loadFixture(deploy);
            
            const tx = await Mock.connect(owner).createSubscription();
            const receipt = await tx.wait();
            const subsId = subsEvent(receipt, Mock)[0];


            await Mock.connect(owner).fundSubscription(
                subsId,
                "100000000000000000000"
            );


            const RNContract = await ethers.getContractFactory("RandomNumberConsumerV2_5");
            const RN = await RNContract.deploy(
                subsId,
                Mock.target,
                "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae"
            );


            await Mock.connect(owner).addConsumer(
                subsId,
                RN.target,
            )

            await RN.connect(owner).requestRandomWords();

            const requestId = await RN.s_requestId();
            console.log(requestId);


            /// for testnet and local mock test onyl
            await Mock.connect(owner).fulfillRandomWords(
                requestId,
                RN.target
            )
            ///

            const randomNumbers = await RN.s_randomWords(0)
            console.log("randomNumbers", randomNumbers);


        })

    })


})