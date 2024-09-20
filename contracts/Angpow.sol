// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract AngpowContract is OwnableUpgradeable, ReentrancyGuardUpgradeable, AccessControlUpgradeable {

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


    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function createAngpow(uint256 _id, address _token, uint256 _tokenAmount, uint256 _quantity) external payable {
        if(_token == address(0)) {
            require(msg.value >= _tokenAmount, "Insufficient ether.");
        } else {
            IERC20(token).transferFrom(msg.sender, address(this), _tokenAmount);
        }

        angpowOf[_id] = Angpow(msg.sender, _id, block.timestamp, _token, _tokenAmount, _quantity, 0);

        emit AngpowCreated(msg.sender, _id, _token, _tokenAmount, _quantity);
    }

}
