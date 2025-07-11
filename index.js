// Replace with your contract address and ABI after deployment
const CONTRACT_ADDRESS = "0xe1E924Bec107340b5E225042A7b80080D3F8A680";
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			}
		],
		"name": "announceWinner",
		"outputs": [
			{
				"internalType": "string",
				"name": "winnerName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "winnerVotes",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_endDate",
				"type": "uint256"
			},
			{
				"internalType": "string[]",
				"name": "_candidateNames",
				"type": "string[]"
			}
		],
		"name": "createVotingEvent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "candidateIndex",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "events",
		"outputs": [
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "endDate",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "winnerAnnounced",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "winnerIndex",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			}
		],
		"name": "getCandidates",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "voteCount",
						"type": "uint256"
					}
				],
				"internalType": "struct Voting.Candidate[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserVote",
		"outputs": [
			{
				"internalType": "bool",
				"name": "voted",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "candidateIndex",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			}
		],
		"name": "getWinner",
		"outputs": [
			{
				"internalType": "string",
				"name": "winnerName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "winnerVotes",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let provider, signer, contract, userAddress;

document.getElementById('connectWallet').onclick = async () => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    document.getElementById('walletInfo').innerText = `Connected: ${userAddress}`;
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    loadEvents();
  } else {
    alert("Please install MetaMask!");
  }
};

async function loadEvents() {
  document.getElementById('events').innerHTML = "<h2>Voting Events</h2>";
  try {
    const eventCount = await contract.events.length();
    for (let i = 0; i < eventCount; i++) {
      const event = await contract.events(i);
      const candidates = await contract.getCandidates(i);
      const endDate = new Date(event.endDate * 1000).toLocaleString();
      let html = `<div class="event-card">
        <strong>${event.title}</strong><br/>
        Ends: ${endDate}<br/>
        <div class="candidate-list">Candidates:<br/>`;
      candidates.forEach((cand, idx) => {
        html += `${cand.name} (${cand.voteCount} votes) <button onclick="vote(${i},${idx})">Vote</button><br/>`;
      });
      html += `</div>`;
      html += `<button onclick="showWinner(${i})">Show Winner</button>`;
      html += `</div>`;
      document.getElementById('events').innerHTML += html;
    }
  } catch (err) {
    document.getElementById('events').innerHTML += `<div>Error loading events: ${err.message}</div>`;
  }
}

window.vote = async (eventId, candidateIdx) => {
  try {
    const tx = await contract.vote(eventId, candidateIdx);
    await tx.wait();
    alert("Vote cast!");
    loadEvents();
  } catch (err) {
    alert("Voting failed: " + err.message);
  }
};

window.showWinner = async (eventId) => {
  try {
    const winner = await contract.getWinner(eventId);
    alert(`Winner: ${winner[0]} with ${winner[1]} votes`);
  } catch (err) {
    alert("Winner not announced yet or error: " + err.message);
  }
};