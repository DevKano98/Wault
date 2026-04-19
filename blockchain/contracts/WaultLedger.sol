// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title WaultLedger
/// @notice Immutable audit trail for WAULT digital inheritance events
contract WaultLedger {
    struct Event {
        string eventType;
        bytes32 dataHash;
        uint256 timestamp;
        address caller;
    }

    mapping(address => Event[]) private userEvents;

    event EventLogged(
        address indexed user,
        string eventType,
        bytes32 dataHash,
        uint256 timestamp
    );

    /// @notice Log an event for the calling address
    /// @param eventType Type of event (TRIGGER, ACCESS, etc.)
    /// @param dataHashStr Hex string of SHA-256 hash of event payload
    function logEvent(string calldata eventType, string calldata dataHashStr) external {
        bytes32 dataHash = _hexStringToBytes32(dataHashStr);

        userEvents[msg.sender].push(
            Event({
                eventType: eventType,
                dataHash: dataHash,
                timestamp: block.timestamp,
                caller: msg.sender
            })
        );

        emit EventLogged(msg.sender, eventType, dataHash, block.timestamp);
    }

    function getEvents(address user) external view returns (Event[] memory) {
        return userEvents[user];
    }

    function getEventCount(address user) external view returns (uint256) {
        return userEvents[user].length;
    }

    function _hexStringToBytes32(string memory value) private pure returns (bytes32 result) {
        bytes memory buffer = bytes(value);
        uint256 offset = 0;

        if (buffer.length == 66 && buffer[0] == '0' && (buffer[1] == 'x' || buffer[1] == 'X')) {
            offset = 2;
        }

        require(buffer.length - offset == 64, 'Invalid hash length');

        bytes memory parsed = new bytes(32);
        for (uint256 i = 0; i < 32; i++) {
            uint8 msn = _fromHexChar(buffer[offset + (i * 2)]);
            uint8 lsn = _fromHexChar(buffer[offset + (i * 2) + 1]);
            parsed[i] = bytes1((msn * 16) + lsn);
        }

        assembly {
            result := mload(add(parsed, 32))
        }
    }

    function _fromHexChar(bytes1 char) private pure returns (uint8) {
        uint8 value = uint8(char);

        if (value >= 48 && value <= 57) {
            return value - 48;
        }
        if (value >= 65 && value <= 70) {
            return value - 55;
        }
        if (value >= 97 && value <= 102) {
            return value - 87;
        }

        revert('Invalid hex character');
    }
}
