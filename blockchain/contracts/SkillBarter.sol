// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SkillBarter {
    IERC20 public pidToken;
    address public platformWallet;
    uint256 public constant MATCH_FEE = 10 ether; // 10 PID

    struct Offer {
        address owner;
        string title;
        string description;
        uint256 price; // in PID (18 decimals)
        bool active;
    }

    struct MatchRequest {
        uint256 offerId;
        address requester;
        string message;
        bool accepted;
        bool completed;
    }

    Offer[] public offers;
    MatchRequest[] public matchRequests;
    
    // Mapping for quick lookups
    mapping(uint256 => uint256[]) public offerMatchRequests; // offerId -> matchRequestIds
    mapping(address => uint256[]) public userMatchRequests; // user -> matchRequestIds

    event OfferCreated(uint256 indexed id, address owner, string title, uint256 price);
    event MatchRequested(uint256 indexed matchId, uint256 indexed offerId, address requester, string message);
    event MatchAccepted(uint256 indexed matchId, address offerOwner, address requester);
    event MatchCompleted(uint256 indexed matchId);

    constructor(address _pidToken, address _platformWallet) {
        pidToken = IERC20(_pidToken);
        platformWallet = _platformWallet;
    }

    // Create a free skill offer
    function createOffer(
        string memory title,
        string memory description,
        uint256 price
    ) external {
        offers.push(Offer(msg.sender, title, description, price, true));
        emit OfferCreated(offers.length - 1, msg.sender, title, price);
    }

    // Request to match with an offer (User B pays 10 PID fee)
    function requestMatch(
        uint256 offerId,
        string memory message
    ) external {
        Offer storage offer = offers[offerId];
        require(offer.active, "Offer inactive");
        require(msg.sender != offer.owner, "Cannot match own offer");
        
        // Charge 10 PID platform fee from requester
        require(pidToken.transferFrom(msg.sender, platformWallet, MATCH_FEE), "Fee payment failed");
        
        uint256 matchId = matchRequests.length;
        matchRequests.push(MatchRequest(offerId, msg.sender, message, false, false));
        
        // Update mappings for quick access
        offerMatchRequests[offerId].push(matchId);
        userMatchRequests[msg.sender].push(matchId);
        userMatchRequests[offer.owner].push(matchId);
        
        emit MatchRequested(matchId, offerId, msg.sender, message);
    }

    // Accept a match request (User A pays 10 PID fee)
    function acceptMatch(uint256 matchId) external {
        MatchRequest storage matchRequest = matchRequests[matchId];
        Offer storage offer = offers[matchRequest.offerId];
        
        require(msg.sender == offer.owner, "Only offer owner can accept");
        require(!matchRequest.accepted, "Match already accepted");
        require(offer.active, "Offer inactive");
        
        // Charge 10 PID platform fee from offer owner
        require(pidToken.transferFrom(msg.sender, platformWallet, MATCH_FEE), "Fee payment failed");
        
        matchRequest.accepted = true;
        emit MatchAccepted(matchId, msg.sender, matchRequest.requester);
    }

    // Complete the match (execute the skill swap)
    function completeMatch(uint256 matchId) external {
        MatchRequest storage matchRequest = matchRequests[matchId];
        Offer storage offer = offers[matchRequest.offerId];
        
        require(matchRequest.accepted, "Match not accepted");
        require(!matchRequest.completed, "Match already completed");
        require(msg.sender == offer.owner || msg.sender == matchRequest.requester, "Not authorized");
        
        // Execute the actual payment for the offer (if not free)
        if (offer.price > 0) {
            require(pidToken.transferFrom(matchRequest.requester, offer.owner, offer.price), "Payment failed");
        }
        
        offer.active = false;
        matchRequest.completed = true;
        
        emit MatchCompleted(matchId);
    }

    // Get all active offers
    function getAllOffers() external view returns (Offer[] memory) {
        return offers;
    }

    // Get match requests for a specific offer
    function getMatchRequestsForOffer(uint256 offerId) external view returns (MatchRequest[] memory) {
        uint256[] memory matchIds = offerMatchRequests[offerId];
        MatchRequest[] memory requests = new MatchRequest[](matchIds.length);
        
        for (uint256 i = 0; i < matchIds.length; i++) {
            requests[i] = matchRequests[matchIds[i]];
        }
        return requests;
    }

    // Get user's match requests (both as requester and offer owner)
    function getMyMatchRequests() external view returns (MatchRequest[] memory) {
        uint256[] memory matchIds = userMatchRequests[msg.sender];
        MatchRequest[] memory requests = new MatchRequest[](matchIds.length);
        
        for (uint256 i = 0; i < matchIds.length; i++) {
            requests[i] = matchRequests[matchIds[i]];
        }
        return requests;
    }

    // Get specific match request
    function getMatchRequest(uint256 matchId) external view returns (MatchRequest memory) {
        return matchRequests[matchId];
    }
}