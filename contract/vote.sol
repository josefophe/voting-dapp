// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint voteCount;
    }

    struct Voter {
        bool voted;
        uint candidateIndex;
    }

    struct VotingEvent {
        string title;
        uint endDate;
        Candidate[] candidates;
        mapping(address => Voter) voters;
        bool winnerAnnounced;
        uint winnerIndex;
    }

    VotingEvent[] public events;

    // Create a new voting event
    function createVotingEvent(string memory _title, uint _endDate, string[] memory _candidateNames) public {
        require(_endDate > block.timestamp, "End date must be in the future");
        VotingEvent storage newEvent = events.push();
        newEvent.title = _title;
        newEvent.endDate = _endDate;
        for (uint i = 0; i < _candidateNames.length; i++) {
            newEvent.candidates.push(Candidate({name: _candidateNames[i], voteCount: 0}));
        }
        newEvent.winnerAnnounced = false;
    }

    // Register a vote for a candidate in a specific event
    function vote(uint eventId, uint candidateIndex) public {
        VotingEvent storage ve = events[eventId];
        require(block.timestamp < ve.endDate, "Voting has ended");
        require(candidateIndex < ve.candidates.length, "Invalid candidate");
        require(!ve.voters[msg.sender].voted, "Already voted");

        ve.voters[msg.sender] = Voter({voted: true, candidateIndex: candidateIndex});
        ve.candidates[candidateIndex].voteCount += 1;
    }

    // Get candidate info for an event
    function getCandidates(uint eventId) public view returns (Candidate[] memory) {
        return events[eventId].candidates;
    }

    // Get user voting info for an event
    function getUserVote(uint eventId, address user) public view returns (bool voted, uint candidateIndex) {
        Voter memory v = events[eventId].voters[user];
        return (v.voted, v.candidateIndex);
    }

    // Announce winner after voting ends
    function announceWinner(uint eventId) public returns (string memory winnerName, uint winnerVotes) {
        VotingEvent storage ve = events[eventId];
        require(block.timestamp >= ve.endDate, "Voting not ended");
        require(!ve.winnerAnnounced, "Winner already announced");

        uint maxVotes = 0;
        uint winnerIdx = 0;
        for (uint i = 0; i < ve.candidates.length; i++) {
            if (ve.candidates[i].voteCount > maxVotes) {
                maxVotes = ve.candidates[i].voteCount;
                winnerIdx = i;
            }
        }
        ve.winnerAnnounced = true;
        ve.winnerIndex = winnerIdx;
        return (ve.candidates[winnerIdx].name, maxVotes);
    }

    // Get winner info (after announced)
    function getWinner(uint eventId) public view returns (string memory winnerName, uint winnerVotes) {
        VotingEvent storage ve = events[eventId];
        require(ve.winnerAnnounced, "Winner not announced yet");
        return (ve.candidates[ve.winnerIndex].name, ve.candidates[ve.winnerIndex].voteCount);
    }
}