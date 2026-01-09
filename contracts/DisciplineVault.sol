// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface để gọi sang DecisionLog
interface IDecisionLog {
    function recordDecision(
        address _user,
        string calldata _actionType,
        uint256 _penaltyPaid,
        uint256 _riskScore,
        string calldata _reason
    ) external;
}

contract DisciplineVault {
    address public backendSystem; 
    IDecisionLog public decisionLog; // Địa chỉ contract Log

    // Quản lý tiền VND ảo (Digital Shadow)
    mapping(address => uint256) public fiatCredit; 

    struct UserConfig {
        uint256 penaltyFee; 
        bool isActive;      
    }
    mapping(address => UserConfig) public userConfigs;

    struct PendingOrder {
        string orderHash;     
        uint256 unlockTime;   
        uint256 riskScore;    
        string reason;        
        bool active;          
    }
    mapping(address => PendingOrder) public pendingOrders;

    // Events
    event CreditTopUp(address indexed user, uint256 amount);
    event CoolOffTriggered(address indexed user, uint256 unlockTime);
    event OrderExecuted(address indexed user, string actionType);

    modifier onlyBackend() {
        require(msg.sender == backendSystem, "Only Backend");
        _;
    }

    // Constructor nhận địa chỉ backend và địa chỉ Log
    constructor(address _backendSystem, address _decisionLogAddress) {
        backendSystem = _backendSystem;
        decisionLog = IDecisionLog(_decisionLogAddress);
    }

    // --- ADMIN / BACKEND FUNCTION ---
    function adminTopUpCredit(address _user, uint256 _amount) external onlyBackend {
        fiatCredit[_user] += _amount;
        emit CreditTopUp(_user, _amount);
    }
    
    // --- USER FUNCTION ---
    function setMyPenaltyFee(uint256 _fee) external {
        userConfigs[msg.sender].penaltyFee = _fee;
        userConfigs[msg.sender].isActive = true;
    }

    // --- CORE LOGIC ---

    // 1. Backend chặn lệnh
    function triggerCoolOff(
        address _user,
        string calldata _orderHash,
        uint256 _durationSeconds,
        uint256 _riskScore,   
        string calldata _reason 
    ) external onlyBackend {
        if (!userConfigs[_user].isActive) return;

        pendingOrders[_user] = PendingOrder({
            orderHash: _orderHash,
            unlockTime: block.timestamp + _durationSeconds,
            riskScore: _riskScore, 
            reason: _reason,       
            active: true
        });

        emit CoolOffTriggered(_user, block.timestamp + _durationSeconds);
    }

    // 2. User chọn PHÁ RÀO (Force) -> Trừ tiền + GHI LOG
    function executeForce() external {
        PendingOrder storage order = pendingOrders[msg.sender];
        require(order.active, "No pending order");
        
        uint256 fee = userConfigs[msg.sender].penaltyFee;
        require(fiatCredit[msg.sender] >= fee, "Insufficient credit");

        // Trừ tiền
        fiatCredit[msg.sender] -= fee;
        
        // Ghi Log tự động sang contract kia
        decisionLog.recordDecision(
            msg.sender, "FORCE_EXECUTE", fee, order.riskScore, order.reason
        );

        order.active = false;
        emit OrderExecuted(msg.sender, "FORCE");
    }

    // 3. User chọn CHỜ (Free) -> GHI LOG
    function executeFree() external {
        PendingOrder storage order = pendingOrders[msg.sender];
        require(order.active, "No pending order");
        require(block.timestamp >= order.unlockTime, "Cool-off time not over");

        decisionLog.recordDecision(
            msg.sender, "FREE_EXECUTE", 0, order.riskScore, order.reason
        );

        order.active = false;
        emit OrderExecuted(msg.sender, "FREE");
    }
}