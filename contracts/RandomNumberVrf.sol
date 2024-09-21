// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

interface IAngpow {
    function randomNumberCallback(uint256 id, address recipient, uint256 randomNumber) external;
}

contract RandomNumberVrf is VRFConsumerBaseV2Plus {


    struct Request {
        uint256 requestId;
        bool fulfilled;
        bool existed;
        uint256 randomNumber;
        uint256 angpowId;
        address recipient;
    }
    mapping( uint256 => Request) public requestOf;

    // Your subscription ID.
    uint256 public s_subscriptionId;

    bytes32 immutable s_keyHash;

    uint32 public callbackGasLimit = 100000;

    uint16 public requestConfirmations = 3;

    uint32 public numWords = 1;

    uint256[] public s_randomWords;
    uint256 public s_requestId;

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    IAngpow public Angpow;

    constructor(
        uint256 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash,
        address angpow
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_subscriptionId = subscriptionId;
        s_keyHash = keyHash;
        Angpow = IAngpow(angpow);
    }
    
    
    
    // Assumes the subscription is funded sufficiently.
    // @param enableNativePayment: Set to `true` to enable payment in native tokens, or
    // `false` to pay in LINK
    function requestRandomWords(
        bool enableNativePayment,
        uint256 angpowId,
        address recipient
    ) external onlyOwner {
        // Will revert if subscription is not set and funded.
        s_requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: enableNativePayment
                    })
                )
            })
        );
        requestOf[s_requestId] = Request(s_requestId, false, true, 0, angpowId, recipient);
        emit RequestSent(s_requestId, numWords);
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] calldata _randomWords
    ) internal override {

        Angpow.randomNumberCallback(
            requestOf[_requestId].angpowId,
            requestOf[_requestId].recipient,
            _randomWords[0]
        );

        s_randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);

    }


}

