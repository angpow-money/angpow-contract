// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";


contract RandomNumberMachineMock is VRFConsumerBaseV2Plus {


    // struct RequestStatus {
    //     bool fulfilled; // whether the request has been successfully fulfilled
    //     bool exists; // whether a requestId exists
    //     uint256[] randomWords;
    // }

    // mapping(uint256 => RequestStatus) public s_requests; /* requestId --> requestStatus */

    // Your subscription ID.
    uint256 public s_subscriptionId;

    // Past request IDs.
    // uint256[] public requestIds;
    // uint256 public lastRequestId;

    // bytes32 public keyHash = 0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be;
    bytes32 immutable s_keyHash;

    uint32 public callbackGasLimit = 100000;

    uint16 public requestConfirmations = 3;

    uint32 public numWords = 2;

    uint256[] public s_randomWords;
    uint256 public s_requestId;

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    constructor(
        uint256 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_subscriptionId = subscriptionId;
        s_keyHash = keyHash;
    }
    
    
    
    // Assumes the subscription is funded sufficiently.
    // @param enableNativePayment: Set to `true` to enable payment in native tokens, or
    // `false` to pay in LINK
    function requestRandomWords(
        bool enableNativePayment
    // ) external onlyOwner returns (uint256 requestId) {
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
        emit RequestSent(s_requestId, numWords);
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] calldata _randomWords
    ) internal override {


        // require(s_requests[_requestId].exists, "request not found");
        // s_requests[_requestId].fulfilled = true;
        // s_requests[_requestId].randomWords = _randomWords;

        

        s_randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }


}

