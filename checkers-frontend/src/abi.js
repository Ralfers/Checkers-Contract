export const abiJson = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "allPlayers",
    "outputs": [
      {
        "internalType": "address",
        "name": "playerAddr",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "registered",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "rank",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "wins",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "losses",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "createdGames",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "gameCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "games",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "created",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "started",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "ended",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "stake",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "statePlayer",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [],
    "name": "register",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "stake",
        "type": "uint256"
      }
    ],
    "name": "createGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "joinGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "fromX",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "fromY",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "toX",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "toY",
        "type": "uint8"
      }
    ],
    "name": "makeMove",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayer",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "playerAddr",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "registered",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "rank",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "wins",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "losses",
            "type": "uint256"
          }
        ],
        "internalType": "struct Checkers.Player",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getAdminAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "getBoard",
    "outputs": [
      {
        "internalType": "uint8[8][8]",
        "name": "",
        "type": "uint8[8][8]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getSenderGames",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "created",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "started",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "ended",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "stake",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "playerAddr",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "registered",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "rank",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "wins",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "losses",
                "type": "uint256"
              }
            ],
            "internalType": "struct Checkers.Player[2]",
            "name": "players",
            "type": "tuple[2]"
          },
          {
            "internalType": "uint8",
            "name": "statePlayer",
            "type": "uint8"
          },
          {
            "internalType": "uint8[8][8]",
            "name": "stateBoard",
            "type": "uint8[8][8]"
          }
        ],
        "internalType": "struct Checkers.Game[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint8",
            "name": "x",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "y",
            "type": "uint8"
          }
        ],
        "internalType": "struct Checkers.Coordinate",
        "name": "from",
        "type": "tuple"
      }
    ],
    "name": "moreCapturesExist",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "isPlayerRegistered",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "isGameCreated",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "isGameStarted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "isJoinedGame",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "getGamePlayers",
    "outputs": [
      {
        "internalType": "address[2]",
        "name": "",
        "type": "address[2]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
]