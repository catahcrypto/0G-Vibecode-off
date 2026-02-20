// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IB33fCoin.sol";

/**
 * @title CloutBattle
 * @dev Main contract for the Clout Battle dApp
 * Handles user registration, battles, sentiment scores, and rewards
 */
contract CloutBattle is Ownable, ReentrancyGuard {
    // B33fCoin token contract
    IB33fCoin public b33fCoin;

    // Battle status enum
    enum BattleStatus {
        Pending,    // Battle created, waiting for sentiment analysis
        Resolved,   // Battle resolved, winner determined
        Cancelled   // Battle cancelled
    }

    // User information
    struct User {
        string twitterHandle;
        string redditHandle;
        uint256 sentimentScore;      // Current sentiment score (0-100)
        uint256 battlesWon;
        uint256 battlesLost;
        bool registered;
    }

    // Battle information
    struct Battle {
        address challenger;           // User who initiated the battle
        address opponent;             // User being challenged
        uint256 challengerSentiment;  // Sentiment score at battle time
        uint256 opponentSentiment;    // Sentiment score at battle time
        address winner;               // Winner address (zero if pending)
        BattleStatus status;
        uint256 createdAt;            // Block timestamp when battle created
        uint256 resolvedAt;           // Block timestamp when battle resolved
        bytes32 daBlobHash;           // Hash of DA blob for verification
        uint256 rewardAmount;         // B33f Coin reward amount
    }

    // Mapping: wallet address => User
    mapping(address => User) public users;

    // Mapping: battle ID => Battle
    mapping(uint256 => Battle) public battles;

    // Mapping: user => array of battle IDs
    mapping(address => uint256[]) public userBattles;

    // Battle counter
    uint256 public battleCounter;

    // Reward amount per battle win (in B33f Coin, with 18 decimals)
    uint256 public rewardPerWin = 100 * 10**18; // 100 B33f Coin default

    // Events
    event UserRegistered(address indexed user, string twitterHandle, string redditHandle);
    event BattleCreated(
        uint256 indexed battleId,
        address indexed challenger,
        address indexed opponent,
        uint256 timestamp
    );
    event SentimentUpdated(address indexed user, uint256 newScore, uint256 timestamp);
    event BattleResolved(
        uint256 indexed battleId,
        address indexed winner,
        address indexed loser,
        uint256 rewardAmount,
        bytes32 daBlobHash
    );
    event BattleCancelled(uint256 indexed battleId);
    event RewardAmountUpdated(uint256 oldAmount, uint256 newAmount);

    constructor(address _b33fCoin, address initialOwner) Ownable(initialOwner) {
        require(_b33fCoin != address(0), "CloutBattle: B33fCoin address cannot be zero");
        b33fCoin = IB33fCoin(_b33fCoin);
    }

    /**
     * @dev Register a new user with social media handles
     * @param twitterHandle Twitter/X handle (without @)
     * @param redditHandle Reddit username
     */
    function registerUser(
        string calldata twitterHandle,
        string calldata redditHandle
    ) external {
        require(!users[msg.sender].registered, "CloutBattle: user already registered");
        require(bytes(twitterHandle).length > 0, "CloutBattle: twitter handle cannot be empty");
        require(bytes(redditHandle).length > 0, "CloutBattle: reddit handle cannot be empty");

        users[msg.sender] = User({
            twitterHandle: twitterHandle,
            redditHandle: redditHandle,
            sentimentScore: 0,
            battlesWon: 0,
            battlesLost: 0,
            registered: true
        });

        emit UserRegistered(msg.sender, twitterHandle, redditHandle);
    }

    /**
     * @dev Update user's social media handles
     * @param twitterHandle New Twitter/X handle
     * @param redditHandle New Reddit username
     */
    function updateUserHandles(
        string calldata twitterHandle,
        string calldata redditHandle
    ) external {
        require(users[msg.sender].registered, "CloutBattle: user not registered");
        require(bytes(twitterHandle).length > 0, "CloutBattle: twitter handle cannot be empty");
        require(bytes(redditHandle).length > 0, "CloutBattle: reddit handle cannot be empty");

        users[msg.sender].twitterHandle = twitterHandle;
        users[msg.sender].redditHandle = redditHandle;
    }

    /**
     * @dev Create a new battle challenge
     * @param opponent Address of the user to challenge
     * @return battleId The ID of the created battle
     */
    function createBattle(address opponent) external returns (uint256) {
        require(users[msg.sender].registered, "CloutBattle: challenger not registered");
        require(users[opponent].registered, "CloutBattle: opponent not registered");
        require(msg.sender != opponent, "CloutBattle: cannot battle yourself");

        uint256 battleId = battleCounter++;
        
        battles[battleId] = Battle({
            challenger: msg.sender,
            opponent: opponent,
            challengerSentiment: users[msg.sender].sentimentScore,
            opponentSentiment: users[opponent].sentimentScore,
            winner: address(0),
            status: BattleStatus.Pending,
            createdAt: block.timestamp,
            resolvedAt: 0,
            daBlobHash: bytes32(0),
            rewardAmount: rewardPerWin
        });

        userBattles[msg.sender].push(battleId);
        userBattles[opponent].push(battleId);

        emit BattleCreated(battleId, msg.sender, opponent, block.timestamp);
        
        return battleId;
    }

    /**
     * @dev Update user's sentiment score (called by backend after AI analysis)
     * @param user Address of the user
     * @param newScore New sentiment score (0-100)
     */
    function updateSentimentScore(address user, uint256 newScore) external onlyOwner {
        require(users[user].registered, "CloutBattle: user not registered");
        require(newScore <= 100, "CloutBattle: sentiment score must be <= 100");

        users[user].sentimentScore = newScore;
        emit SentimentUpdated(user, newScore, block.timestamp);
    }

    /**
     * @dev Resolve a battle with winner determined by backend
     * @param battleId ID of the battle to resolve
     * @param winner Address of the winner
     * @param daBlobHash Hash of the DA blob containing battle verification data
     */
    function resolveBattle(
        uint256 battleId,
        address winner,
        bytes32 daBlobHash
    ) external onlyOwner nonReentrant {
        Battle storage battle = battles[battleId];
        require(battle.status == BattleStatus.Pending, "CloutBattle: battle not pending");
        require(winner == battle.challenger || winner == battle.opponent, "CloutBattle: invalid winner");

        address loser = winner == battle.challenger ? battle.opponent : battle.challenger;

        battle.winner = winner;
        battle.status = BattleStatus.Resolved;
        battle.resolvedAt = block.timestamp;
        battle.daBlobHash = daBlobHash;

        // Update user stats
        users[winner].battlesWon++;
        users[loser].battlesLost++;

        // Mint reward to winner
        b33fCoin.mint(winner, battle.rewardAmount);

        emit BattleResolved(battleId, winner, loser, battle.rewardAmount, daBlobHash);
    }

    /**
     * @dev Cancel a pending battle
     * @param battleId ID of the battle to cancel
     */
    function cancelBattle(uint256 battleId) external {
        Battle storage battle = battles[battleId];
        require(
            msg.sender == battle.challenger || msg.sender == owner(),
            "CloutBattle: not authorized to cancel"
        );
        require(battle.status == BattleStatus.Pending, "CloutBattle: battle not pending");

        battle.status = BattleStatus.Cancelled;
        emit BattleCancelled(battleId);
    }

    /**
     * @dev Set the reward amount per battle win
     * @param newReward New reward amount (in B33f Coin with 18 decimals)
     */
    function setRewardPerWin(uint256 newReward) external onlyOwner {
        uint256 oldReward = rewardPerWin;
        rewardPerWin = newReward;
        emit RewardAmountUpdated(oldReward, newReward);
    }

    /**
     * @dev Get user information
     * @param user Address of the user
     * @return User struct
     */
    function getUser(address user) external view returns (User memory) {
        return users[user];
    }

    /**
     * @dev Get battle information
     * @param battleId ID of the battle
     * @return Battle struct
     */
    function getBattle(uint256 battleId) external view returns (Battle memory) {
        return battles[battleId];
    }

    /**
     * @dev Get all battle IDs for a user
     * @param user Address of the user
     * @return Array of battle IDs
     */
    function getUserBattles(address user) external view returns (uint256[] memory) {
        return userBattles[user];
    }

    /**
     * @dev Get total number of battles
     * @return Total battle count
     */
    function getTotalBattles() external view returns (uint256) {
        return battleCounter;
    }
}
