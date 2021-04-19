// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 < 0.9.0;

/**
 * @title Checkers
 * @dev Play checkers against other players
 */
contract Checkers {

    struct Player {
        address playerAddr;
        bool registered;
        uint rank;
        uint wins;
        uint losses;
    }

    struct Game {
        uint id;
        bool created;
        bool started;
        bool ended;
        uint stake;
        Player[2] players;
        uint8 statePlayer;
        uint8[8][8] stateBoard;
    }

    struct Coordinate {
        uint8 x;
        uint8 y;
    }

    struct Vector {
        int8 x;
        int8 y;
    }

    address public admin;
    uint public gameCounter = 0;
    mapping(address => Player) public allPlayers;
    mapping(uint => Game) public games;
    uint[] public createdGames;

    modifier restricted() {
        require (
            msg.sender == admin,
            "This function is restricted to the contract's owner"
        );
        _;
    }

    modifier registered() {
        require (
            allPlayers[msg.sender].registered,
            "This function is restricted to registered players"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
        registerPlayer(admin);
    }

    function register() payable public {
        require (
            msg.value >= 2 ether,
            "Need to pay at least 2 ether to register"
        );
        require (
            allPlayers[msg.sender].registered == false,
            "Player is already registered"
        );

        //admin.call{value: msg.value}('');
        //admin.transfer(msg.value);
        registerPlayer(msg.sender);
    }

    function registerPlayer(address playerAddr) private {
        Player storage player = allPlayers[playerAddr];
        player.playerAddr = playerAddr;
        player.registered = true;
        player.rank = 100;
        player.wins = 0;
        player.losses = 0;
    }

    function createGame(uint stake) public restricted {
        gameCounter++;
        games[gameCounter].id = gameCounter;
        games[gameCounter].created = true;
        games[gameCounter].started = false;
        games[gameCounter].ended = false;
        games[gameCounter].stake = stake;
        games[gameCounter].statePlayer = 0;
        games[gameCounter].stateBoard = [
            [uint8(1), 0, 1, 0, 1, 0, 1, 0],
            [uint8(0), 1, 0, 1, 0, 1, 0, 1],
            [uint8(1), 0, 1, 0, 1, 0, 1, 0],
            [uint8(0), 0, 0, 0, 0, 0, 0, 0],
            [uint8(0), 0, 0, 0, 0, 0, 0, 0],
            [uint8(0), 3, 0, 3, 0, 3, 0, 3],
            [uint8(3), 0, 3, 0, 3, 0, 3, 0],
            [uint8(0), 3, 0, 3, 0, 3, 0, 3]
        ];

        createdGames.push(gameCounter);
    }

    function joinGame(uint gameId) public payable registered {
        Game storage game = games[gameId];
        Player storage player = allPlayers[msg.sender];

        require (
            player.registered,
            "Player not registered"
        );
        require (
            game.created,
            "Game does not exist"
        );
        require (
            !game.started,
            "Game has already started"
        );
        require (
            game.players[0].playerAddr != msg.sender,
            "Player already joined the game"
        );
        require (
            msg.value == game.stake,
            "Need to pay the exact game stake amount to join"
        );

        uint8 joinedPlayerCount = getJoinedPlayerCount(gameId);
        if (joinedPlayerCount < 2) {
            game.players[joinedPlayerCount] = player;
        }
        if (joinedPlayerCount == 1) {
            games[gameId].started = true;
        }
    }

    function makeMove(uint gameId, uint8 fromX, uint8 fromY, uint8 toX, uint8 toY) public {
        Coordinate memory from = Coordinate(fromX, fromY);
        Coordinate memory to = Coordinate(toX, toY);

        require (
            playerIsJoinedGame(msg.sender, gameId),
            "Player is not part of this game"
        );
        require (
            gameStarted(gameId),
            "Game has not started"
        );
        require (
            !gameEnded(gameId),
            "Game has already ended"
        );
        require (
            isPlayersMove(msg.sender, gameId),
            "Not players turn to make a move"
        );
        require (
            isValidMove(gameId, from, to),
            "Given move is invalid"
        );

        executeMove(gameId, from, to);
    }

    function executeMove(uint gameId, Coordinate memory from, Coordinate memory to) private {
        Game storage game = games[gameId];

        uint8 fromCellValue = game.stateBoard[from.x][from.y];
        uint8 pawnValue = 1 + 2*game.statePlayer;
        uint8 enemyPawnValue = 3 - 2*game.statePlayer;

        game.stateBoard[from.x][from.y] -= fromCellValue;
        game.stateBoard[to.x][to.y] += fromCellValue;

        if (fromCellValue == pawnValue && (game.statePlayer == 0 && to.x == 7 || game.statePlayer == 1 && to.x == 0)) {
            game.stateBoard[to.x][to.y] += 1;
        }

        Vector memory diff = Vector(int8(to.x) - int8(from.x), int8(to.y) - int8(from.y));
        Vector memory diffAbs = Vector(getAbs(diff.x), getAbs(diff.y));
        Vector memory singleDiff = Vector(diff.x / diffAbs.x, diff.y / diffAbs.y);
        bool enemyFound = false;

        for (int8 i = 1; i < diffAbs.x; i++) {
            uint8 newX = uint8(int8(from.x) + i*singleDiff.x);
            uint8 newY = uint8(int8(from.y) + i*singleDiff.y);
            if (game.stateBoard[newX][newY] == enemyPawnValue || game.stateBoard[newX][newY] == enemyPawnValue + 1) {
                enemyFound = true;
                game.stateBoard[newX][newY] = 0;
                break;
            }
        }

        if (enemyFound && noMoreEnemiesLeft(gameId)) {
            endGame(gameId);
        } else if (!enemyFound || !moreCapturesExist(gameId, to)) {
            game.statePlayer = 1 - game.statePlayer;
        }
    }

    function endGame(uint gameId) private {
        Game storage game = games[gameId];
        game.ended = true;

        address payable winnerAddress = payable(game.players[game.statePlayer].playerAddr);
        address loserAddress = game.players[1 - game.statePlayer].playerAddr;

        allPlayers[winnerAddress].wins++;
        allPlayers[loserAddress].losses++;

        winnerAddress.transfer(2*game.stake);
    }

    /* Utility views ********************************************************************************/

    function getPlayer() public view returns (Player memory) {
        return allPlayers[msg.sender];
    }

    function getAdminAddress() public view returns (address) {
        return admin;
    }

    function playerIsAdmin(address player) private view returns (bool) {
        return player == admin;
    }

    function gameCreated(uint gameId) private view returns (bool) {
        return games[gameId].started;
    }

    function gameStarted(uint gameId) private view returns (bool) {
        return games[gameId].started;
    }

    function gameEnded(uint gameId) private view returns (bool) {
        return games[gameId].ended;
    }

    function getBoard(uint gameId) public view returns (uint8[8][8] memory) {
        require (
            playerIsAdmin(msg.sender) || playerIsJoinedGame(msg.sender, gameId),
            "Player is not allowed to access the game board"
        );

        uint8[8][8] memory gameBoard = games[gameId].stateBoard;
        return gameBoard;
    }

    function getSenderGames() public view registered returns (Game[] memory) {
        Game[] memory returnedGameList = new Game[](createdGames.length);
        uint indexCounter = 0;

        for (uint i = 0; i < createdGames.length; i++) {
            uint gameId = createdGames[i];
            Game storage game = games[gameId];

            if (!game.started || playerIsJoinedGame(msg.sender, game.id)) {
                returnedGameList[indexCounter] = game;
                indexCounter++;
            }
        }

        return returnedGameList;
    }

    function getJoinedPlayerCount(uint gameId) private view returns (uint8) {
        if (games[gameId].players[0].playerAddr == address(0)) {
            return 0;
        }
        if (games[gameId].players[1].playerAddr == address(0)) {
            return 1;
        }

        return 2;
    }

    function playerIsJoinedGame(address playerAddr, uint gameId) private view returns (bool) {
        return games[gameId].players[0].playerAddr == playerAddr || games[gameId].players[1].playerAddr == playerAddr;
    }

    function isPlayersMove(address playerAddr, uint gameId) private view returns (bool) {
        uint playerToMove = games[gameId].statePlayer;
        return games[gameId].players[playerToMove].playerAddr == playerAddr;
    }

    function isValidMove(uint gameId, Coordinate memory from, Coordinate memory to) private view returns (bool) {
        Game memory game = games[gameId];

        if (from.x > 7 || from.y > 7 || to.x > 7 || to.y > 7) {
            return false;
        }

        uint8 fromCellValue = game.stateBoard[from.x][from.y];
        uint8 toCellValue = game.stateBoard[to.x][to.y];

        uint8 pawnValue = 1 + 2*game.statePlayer;
        uint8 enemyPawnValue = 3 - 2*game.statePlayer;

        if (toCellValue != 0) {
            return false;
        }
        if (fromCellValue != pawnValue && fromCellValue != pawnValue + 1) {
            return false;
        }

        Vector memory diff = Vector(int8(to.x) - int8(from.x), int8(to.y) - int8(from.y));
        Vector memory diffAbs = Vector(getAbs(diff.x), getAbs(diff.y));
        Vector memory singleDiff = Vector(diff.x / diffAbs.x, diff.y / diffAbs.y);

        if (fromCellValue == pawnValue) { // Check pawn moves
            int8 directionModifier = 1 - int8(2*game.statePlayer); // If white then go down (1), if black then go up (-1)

            if (diff.x == directionModifier && (diff.y == 1 || diff.y == -1)) {
                return true;
            }
            if ((diff.x == 2 || diff.x == -2) && (diff.y == 2 || diff.y == -2)) {
                uint8 newX = uint8(int8(from.x) + singleDiff.x);
                uint8 newY = uint8(int8(from.y) + singleDiff.y);
                uint8 middlePieceValue = game.stateBoard[newX][newY];
                if (middlePieceValue == enemyPawnValue || middlePieceValue == enemyPawnValue + 1) {
                    return true;
                }
            }
        } else { // Check king moves
            if (diffAbs.x != diffAbs.y) { // Can move only diagonally
                return false;
            }
            uint8 enemyCounter = 0;

            for (int8 i = 1; i < diffAbs.x; i++) {
                uint8 newX = uint8(int8(from.x) + i*singleDiff.x);
                uint8 newY = uint8(int8(from.y) + i*singleDiff.y);
                if (game.stateBoard[newX][newY] == enemyPawnValue || game.stateBoard[newX][newY] == enemyPawnValue + 1) {
                    enemyCounter++;
                }
            }

            if (enemyCounter <= 1) { // Cant jump over more than one enemy
                return true;
            }
        }

        return false;
    }

    function moreCapturesExist(uint gameId, Coordinate memory from) public view returns (bool) {
        Game storage game = games[gameId];
        
        uint8 fromCellValue = game.stateBoard[from.x][from.y];
        uint8 pawnValue = 1 + 2*game.statePlayer;
        uint8 enemyPawnValue = 3 - 2*game.statePlayer;

        int8 limit;
        if (fromCellValue == pawnValue) {
            limit = 2;
        } else {
            limit = 7;
        }

        for (int8 xDirection = -1; xDirection <= 1; xDirection += 2) {
            for (int8 yDirection = -1; yDirection <= 1; yDirection += 2) { // All diagonals
                for (int8 i = 1; i < limit; i++) { // All cells along diagonal
                    int8 newX = int8(from.x) + i*xDirection;
                    int8 newY = int8(from.y) + i*yDirection;
                    if (newX < 1 || newX > 6 || newY < 1 || newY > 6) {
                        break;
                    }
                    uint8 targetCellValue = game.stateBoard[uint8(newX)][uint8(newY)];
                    if (targetCellValue == enemyPawnValue || targetCellValue == enemyPawnValue + 1) {
                        if (game.stateBoard[uint8(newX + xDirection)][uint8(newY + yDirection)] == 0) { // Check there's an empty spot behind enemy
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    function noMoreEnemiesLeft(uint gameId) private view returns (bool) {
        Game storage game = games[gameId];
        uint8 enemyPawnValue = 3 - 2*game.statePlayer;

        for (uint8 i = 0; i < 8; i++) {
            for (uint8 j = 0; j < 8; j++) {
                uint8 targetCellValue = game.stateBoard[i][j];
                if (targetCellValue == enemyPawnValue || targetCellValue == enemyPawnValue + 1) {
                    return false;
                }
            }
        }

        return true;
    }

    function getAbs(int8 x) private pure returns (int8) {
        if (x < 0) {
            return -1*x;
        } else {
            return x;
        }
    }

    /************************************************************************************************/

    /* Test views */
    function isPlayerRegistered(address player) public view returns(bool) {
        return allPlayers[player].registered;
    }

    function isGameCreated(uint gameId) public view returns(bool) {
        return games[gameId].created;
    }

    function isGameStarted(uint gameId) public view returns(bool) {
        return games[gameId].started;
    }

    function isJoinedGame(uint gameId) public view returns(bool) {
        return games[gameId].players[0].playerAddr == msg.sender || games[gameId].players[1].playerAddr == msg.sender;
    }

    function getGamePlayers(uint gameId) public view returns(address[2] memory) {
        address[2] memory addresses;
        addresses[0] = games[gameId].players[0].playerAddr;
        addresses[1] = games[gameId].players[1].playerAddr;
        return addresses;
    }
}
