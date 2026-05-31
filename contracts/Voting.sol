// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Voting
/// @notice Minimal on-chain voting. The owner registers candidates; every
///         address may cast exactly one vote. Anyone can read the standings
///         and the current winner.
contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    /// @notice Account allowed to add candidates (set to the deployer).
    address public immutable owner;

    Candidate[] private candidates;

    /// @notice Whether an address has already voted.
    mapping(address => bool) public hasVoted;

    event CandidateAdded(uint256 indexed index, string name);
    event Voted(address indexed voter, uint256 indexed candidateIndex);

    error NotOwner();
    error AlreadyVoted();
    error InvalidCandidate();
    error NoCandidates();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Register a new candidate. Owner only.
    /// @param name Display name of the candidate.
    function addCandidate(string calldata name) external onlyOwner {
        candidates.push(Candidate({name: name, voteCount: 0}));
        emit CandidateAdded(candidates.length - 1, name);
    }

    /// @notice Cast one vote for a candidate. One vote per address.
    /// @param candidateIndex Index of the candidate in the candidate list.
    function vote(uint256 candidateIndex) external {
        if (hasVoted[msg.sender]) revert AlreadyVoted();
        if (candidateIndex >= candidates.length) revert InvalidCandidate();

        hasVoted[msg.sender] = true;
        candidates[candidateIndex].voteCount++;

        emit Voted(msg.sender, candidateIndex);
    }

    /// @notice Return every candidate with their current vote count.
    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    /// @notice Number of registered candidates.
    function candidateCount() external view returns (uint256) {
        return candidates.length;
    }

    /// @notice Name of the candidate with the most votes.
    /// @dev Reverts when no candidates exist. On a tie, the first-added
    ///      candidate among the leaders wins (deterministic).
    function getWinner() external view returns (string memory name) {
        uint256 len = candidates.length;
        if (len == 0) revert NoCandidates();

        uint256 winningCount = 0;
        uint256 winningIndex = 0;
        for (uint256 i = 0; i < len; i++) {
            if (candidates[i].voteCount > winningCount) {
                winningCount = candidates[i].voteCount;
                winningIndex = i;
            }
        }
        return candidates[winningIndex].name;
    }
}
