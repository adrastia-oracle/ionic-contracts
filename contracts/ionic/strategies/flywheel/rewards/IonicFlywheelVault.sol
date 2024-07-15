// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// Interface of the ERC20 token contract
interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract IonicFlywheelVault {
    address public owner;
    IERC20 public token;

    // Modifier to restrict function access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Constructor to set the owner and token address
    constructor() {
        owner = msg.sender;
    }

    // Function to approve a spender to spend tokens on behalf of this contract
    function approve(address _token, address _spender) public onlyOwner returns (bool) {
        bool success = IERC20(_token).approve(_spender, type(uint256).max);
        require(success, "Token approval failed");
        return success;
    }

    // Function to transfer ownership of the contract
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        owner = _newOwner;
    }

    // Function to withdraw tokens from the contract
    function withdrawTokens(address _token, address _recipient, uint256 _amount) public onlyOwner returns (bool) {
        bool success = IERC20(_token).transfer(_recipient, _amount);
        require(success, "Token transfer failed");
        return success;
    }
}