// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./RandomNumberVrf.sol";

contract AngpowContractVrf is ReentrancyGuardUpgradeable, AccessControlUpgradeable {

    struct Angpow {
        address donator;
        uint256 id;
        uint256 created_at;
        address token;
        uint256 token_amount;
        uint256 quantity;
        uint256 claimed_count;
        uint256 token_remained;
        bool is_random;
    }

    mapping(uint => Angpow) public angpowOf;

    RandomNumberVrf public RandomNumberContract;

    event AngpowCreated(address donator, uint256 id, address token, uint256 token_amount, uint256 quantity, bool is_random);
    event AngpowReceived(address recipient, uint256 id, address token, uint256 token_amount, uint256 index);

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash
    ) public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        RandomNumberContract = new RandomNumberVrf(subscriptionId, vrfCoordinator, keyHash, address(this));
        _grantRole(ADMIN_ROLE, address(RandomNumberContract));

    }

    function createAngpow(uint256 _id, address _token, uint256 _tokenAmount, uint256 _quantity, bool _isRandom) external payable {
        require(angpowOf[_id].donator == address(0), "Id used.");

        if(_token == address(0)) {
            require(msg.value >= _tokenAmount, "Insufficient ether.");
        } else {
            IERC20(_token).transferFrom(msg.sender, address(this), _tokenAmount);
        }

        angpowOf[_id] = Angpow(msg.sender, _id, block.timestamp, _token, _tokenAmount, _quantity, 0, _tokenAmount, _isRandom);

        emit AngpowCreated(msg.sender, _id, _token, _tokenAmount, _quantity, _isRandom);
    }

    function addAdmin(address _admin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, _admin);
    }

    function receiveAngpow(uint256 _id, address _recipient) external onlyRole(ADMIN_ROLE) {
        
        require(angpowOf[_id].claimed_count < angpowOf[_id].quantity , "Fully claimed.");
        angpowOf[_id].claimed_count += 1;

        if(angpowOf[_id].is_random) {

            if(angpowOf[_id].claimed_count == angpowOf[_id].quantity) {

                uint256 amount = angpowOf[_id].token_remained;
                angpowOf[_id].token_remained = 0;

                if(angpowOf[_id].token == address(0)) {
                    (bool sent, ) = _recipient.call{value: amount}("");
                    require(sent, "Failed to send Ether.");
                } else {
                    IERC20(angpowOf[_id].token).transfer(_recipient, amount);
                }
                emit AngpowReceived(_recipient, _id, angpowOf[_id].token, amount, angpowOf[_id].claimed_count);

            } else {
                RandomNumberContract.requestRandomWords(
                    false,
                    _id,
                    _recipient
                );
            }

        } else {
            uint256 amount = angpowOf[_id].token_amount / angpowOf[_id].quantity;
            angpowOf[_id].token_remained -= amount;
            if(angpowOf[_id].token == address(0)) {
                (bool sent, ) = _recipient.call{value: amount}("");
                require(sent, "Failed to send Ether.");
            } else {
                IERC20(angpowOf[_id].token).transfer(_recipient, amount);
            }
            emit AngpowReceived(_recipient, _id, angpowOf[_id].token, amount, angpowOf[_id].claimed_count);
        }

    }

    function randomNumberCallback(uint256 _id, address _recipient, uint256 _random) external onlyRole(ADMIN_ROLE) {

        uint256 amount = _random % (angpowOf[_id].token_remained / (angpowOf[_id].quantity - angpowOf[_id].claimed_count));
        angpowOf[_id].token_remained -= amount;

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

}
