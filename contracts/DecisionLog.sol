// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DecisionLog {
    address public vaultContract; // Chỉ cho phép Vault gọi hàm ghi log
    address public owner;

    struct LogEntry {
        uint256 timestamp;
        address user;
        string actionType;   // "FORCE_EXECUTE" (Phạt) hoặc "FREE_EXECUTE" (Chờ)
        uint256 penaltyPaid; // Số tiền đã phạt (Nếu có)
        uint256 riskScore;   // Điểm rủi ro lúc đó
        string reason;       // Lý do bị chặn
    }

    LogEntry[] public logs;
    // Mapping lưu danh sách index log của từng user để tra cứu nhanh
    mapping(address => uint256[]) public userLogIndexes;

    modifier onlyVault() {
        require(msg.sender == vaultContract, "Only Vault can write logs");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // QUAN TRỌNG: Hàm để kết nối với Vault
    function setVaultAddress(address _vault) external {
        require(msg.sender == owner, "Only owner");
        vaultContract = _vault;
    }

    // Hàm này được gọi tự động từ DisciplineVault
    function recordDecision(
        address _user,
        string calldata _actionType,
        uint256 _penaltyPaid,
        uint256 _riskScore,
        string calldata _reason
    ) external onlyVault {
        logs.push(LogEntry({
            timestamp: block.timestamp,
            user: _user,
            actionType: _actionType,
            penaltyPaid: _penaltyPaid,
            riskScore: _riskScore,
            reason: _reason
        }));

        userLogIndexes[_user].push(logs.length - 1);
    }

    // Hàm lấy lịch sử của 1 user
    function getUserHistory(address _user) external view returns (LogEntry[] memory) {
        uint256[] memory indexes = userLogIndexes[_user];
        LogEntry[] memory history = new LogEntry[](indexes.length);
        
        for (uint256 i = 0; i < indexes.length; i++) {
            history[i] = logs[indexes[i]];
        }
        return history;
    }
}