// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract AngpowContract is ReentrancyGuardUpgradeable, AccessControlUpgradeable, VRFConsumerBaseV2Plus {

    struct Angpow {
        address donator;
        uint256 id;
        uint256 created_at;
        address token;
        uint256 token_amount;
        uint256 quantity;
        uint256 claimed_count;
    }

    mapping(uint => Angpow) public angpowOf;

    event AngpowCreated(address donator, uint256 id, address token, uint256 token_amount, uint256 quantity);
    event AngpowReceived(address recipient, uint256 id, address token, uint256 token_amount, uint256 index);







    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus) public s_requests; /* requestId --> requestStatus */

    // Your subscription ID.
    uint256 public s_subscriptionId;

    // Past request IDs.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    bytes32 public keyHash = 0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be;

    uint32 public callbackGasLimit = 100000;

    uint16 public requestConfirmations = 3;

    uint32 public numWords = 2;

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);







    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() VRFConsumerBaseV2Plus(0x5CE8D5A2BC84beb22a398CCA51996F7930313D61) {
        _disableInitializers();
    }

    function initialize(uint256 subscriptionId) public initializer {
        
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        s_subscriptionId = subscriptionId;

    }

    function createAngpow(uint256 _id, address _token, uint256 _tokenAmount, uint256 _quantity) external payable {
        require(angpowOf[_id].donator == address(0), "Id used.");

        if(_token == address(0)) {
            require(msg.value >= _tokenAmount, "Insufficient ether.");
        } else {
            IERC20(_token).transferFrom(msg.sender, address(this), _tokenAmount);
        }

        angpowOf[_id] = Angpow(msg.sender, _id, block.timestamp, _token, _tokenAmount, _quantity, 0);

        emit AngpowCreated(msg.sender, _id, _token, _tokenAmount, _quantity);
    }

    function addAdmin(address _admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, _admin);
    }

    function receiveAngpow(uint256 _id, address _recipient) external onlyRole(ADMIN_ROLE) {
        
        require(angpowOf[_id].claimed_count < angpowOf[_id].quantity , "Fully claimed.");
        angpowOf[_id].claimed_count += 1;
        uint256 amount = angpowOf[_id].token_amount / angpowOf[_id].quantity;
        if(angpowOf[_id].token == address(0)) {
            (bool sent, ) = _recipient.call{value: amount}("");
            require(sent, "Failed to send Ether.");
        } else {
            IERC20(angpowOf[_id].token).transfer(_recipient, amount);
        }

        emit AngpowReceived(_recipient, _id, angpowOf[_id].token, amount, angpowOf[_id].claimed_count);
    }

    function withdrawEth() external onlyRole(DEFAULT_ADMIN_ROLE) {
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether.");
    }






    // Assumes the subscription is funded sufficiently.
    // @param enableNativePayment: Set to `true` to enable payment in native tokens, or
    // `false` to pay in LINK
    function requestRandomWords(
        bool enableNativePayment
    ) external onlyOwner returns (uint256 requestId) {
        // Will revert if subscription is not set and funded.
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
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
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] calldata _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }

}
