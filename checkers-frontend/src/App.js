import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';

import { abiJson } from './abi.js';

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            blockNumber: 0,
            selectedAccount: "",
            games: [],
            player: {},
            adminAccount: "",
            inputStakeValue: 0,
            playedGameId: undefined,
            nextMoveFromX: 0,
            nextMoveFromY: 0,
            nextMoveToX: 0,
            nextMoveToY: 0,
        };

        const contractAddress = "0xA72BFc9fe06579fB4aAE72a7466dC8d68897b65c"

        const Web3 = require("web3");
        this.web3 = new Web3(window.ethereum)
        window.ethereum.enable()

        this.contract = new this.web3.eth.Contract(abiJson, contractAddress)
    }

    componentDidMount() {
        this.fetchAdminAddress()
        this.fetchNewData()
    }

    async fetchAdminAddress() {
        let admin
        try {
            admin = await this.contract.methods.getAdminAddress().call()
        } catch (e) {
            console.log('Error when fetching admin account')
            console.log(e)
        }

        this.setState({
            adminAccount: admin,
        })
    }

    fetchAccount() {
        return this.web3.eth.getAccounts()
    }

    fetchPlayer(account) {
        return this.contract.methods.getPlayer().call({from: account})
    }

    fetchGames(account) {
        return this.contract.methods.getSenderGames().call({from: account})
    }

    async fetchNewData() {
        let account
        let player
        let games

        try {
            const accounts = await this.fetchAccount()
            account = accounts[0]
        } catch (e) {
            console.log('Error when fetching accounts')
            console.log(e)
            return
        }

        try {
            player = await this.fetchPlayer(account)
        } catch (e) {
            console.log('Error when fetching player')
            console.log(e)
        }

        try {
            games = await this.fetchGames(account)
        } catch (e) {
            console.log('Error when fetching games')
            console.log(e)
        }

        this.setState({
            selectedAccount: account,
            player: player,
            games: games,
        })
    }

    register() {
        this.contract.methods.register().send({from: this.state.selectedAccount, value: 2000000000000000000})
            .then(resp => {
                this.fetchNewData()
            })
            .catch(e => {
                console.log('Error while registering account:')
                console.log(e)
            })
    }

    createGame() {
        const bn = this.web3.utils.toBN(this.state.inputStakeValue)
        this.contract.methods.createGame(bn).send({from: this.state.selectedAccount})
            .then(resp => {
                this.fetchNewData()
            })
            .catch(e => {
                console.log('Error while creating game:')
                console.log(e)
            })
    }

    joinGame(gameId) {
        const game = this.state.games.filter(game => {return game[0] === gameId})[0]
        const bn = this.web3.utils.toBN(gameId)
        const gameStake = parseInt(game[4])

        this.contract.methods.joinGame(bn).send({from: this.state.selectedAccount, value: gameStake})
            .then(resp => {
                this.fetchNewData()
            })
            .catch(e => {
                console.log('Error while joining game:')
                console.log(e)
            })
    }

    playGame(gameId) {
        this.setState({
            playedGameId: gameId
        })
    }

    makeMove(gameId) {
        const bnGameId = this.web3.utils.toBN(gameId)
        const bnFromX = this.web3.utils.toBN(this.state.nextMoveFromX)
        const bnFromY = this.web3.utils.toBN(this.state.nextMoveFromY)
        const bnToX = this.web3.utils.toBN(this.state.nextMoveToX)
        const bnToY = this.web3.utils.toBN(this.state.nextMoveToY)

        this.contract.methods.makeMove(bnGameId, bnFromX, bnFromY, bnToX, bnToY).send({from: this.state.selectedAccount})
            .then(resp => {
                this.fetchNewData()
            })
            .catch(e => {
                console.log('Error while making move:')
                console.log(e)
            })
    }

    getPlayerCount(game) {
        if (game[5][0][0] === "0x0000000000000000000000000000000000000000") {
            return 0
        } else if (game[5][1][0] === "0x0000000000000000000000000000000000000000") {
            return 1
        }
        return 2
    }

    playerWaitingForGame(game) {
        if (game[2]) {
            return false
        }
        return game[5][0][0] === this.state.selectedAccount
    }

    playerCanJoinGame(game) {
        if (game[2]) {
            return false
        }
        return game[5][0][0] !== this.state.selectedAccount
    }

    playerCanPlayGame(game) {
        if (!game[2]) {
            return false
        }
        return game[5][0][0] === this.state.selectedAccount ||
                game[5][1][0] === this.state.selectedAccount
    }

    playerIsPlayingGame(game) {
        return this.state.playedGameId === game[0]
    }

    //game[0] == id
    //game[1] == created
    //game[2] == started
    //game[3] == ended
    //game[4] == stake
    //game[5] == players
    //game[6] == statePlayer
    //game[7] == stateBoard
    getGameElements() {
        return this.state.games && this.state.games.map((game, i) => 
            <Card key={i}>
                <Card.Body>
                    <Card.Title>Game: {game[0]}</Card.Title>
                    <Card.Text>
                        Stake: {game[4]} wei
                    </Card.Text>
                    <Card.Text>
                        Players: {this.getPlayerCount(game)}/2
                    </Card.Text>
                    {this.playerWaitingForGame(game) &&
                        <Form.Control style={{width: '6rem'}} readOnly value="Waiting" />
                    }
                    {this.playerIsPlayingGame(game) &&
                        <Form.Control style={{width: '6rem'}} readOnly value="Playing" />
                    }
                    {this.playerCanJoinGame(game) &&
                        <Button variant="primary" size="sm" onClick={this.joinGame.bind(this, game[0])}>
                            Join Game
                        </Button>
                    }
                    {!this.playerIsPlayingGame(game) && this.playerCanPlayGame(game) &&
                        <Button variant="primary" size="sm" onClick={this.playGame.bind(this, game[0])}>
                            Play Game
                        </Button>
                    }
                </Card.Body>
            </Card>
        )
    }

    getGameRow(playedGame, row, i) {
        const gameBoard = playedGame[7]
        const isWhite = this.playerIsWhite(playedGame)
        const pawnValue = isWhite ? 1 : 3
        const enemyPawnValue = isWhite ? 3 : 1

        const indexColStyle = {
            fontSize: '25px',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderColor: 'transparent',
        }

        const styleDict = {
            fontSize: '25px',
            backgroundColor: 'rgb(220,220,220)',
            borderStyle: 'solid',
            borderWidth: '1px',
        }

        const firstCol = <Col style={indexColStyle} xl={"auto"} key={8}>
            {i}
        </Col>

        const rowCols = row.map((col, j) => {
            let pieceColor = undefined
            if (gameBoard[i][j] == pawnValue) {
                pieceColor = 'rgb(147, 197, 114)'
            } else if (gameBoard[i][j] == pawnValue + 1) {
                pieceColor = 'rgb(42, 170, 138)'
            } else if (gameBoard[i][j] == enemyPawnValue) {
                pieceColor = 'rgb(205,92,92)'
            } else if (gameBoard[i][j] == enemyPawnValue + 1) {
                pieceColor = 'rgb(179,27,27)'
            }

            const colStyle = pieceColor ? {...styleDict, backgroundColor: pieceColor} : styleDict

            return <Col style={colStyle} xl={"auto"} key={j}>
                {gameBoard[i][j]}
            </Col>
        })

        return [].concat(firstCol).concat(rowCols)
    }

    getGameBoard(playedGame) {
        const gameBoard = playedGame[7]

        const indexColStyle = {
            fontSize: '25px',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderColor: 'transparent',
        }

        const indexRow = <Row xl={{ span: 6 }} key={8}>
            <Col style={{...indexColStyle, color: 'transparent'}} xl={"auto"} key={0}>0</Col>
            <Col style={indexColStyle} xl={"auto"} key={1}>0</Col>
            <Col style={indexColStyle} xl={"auto"} key={2}>1</Col>
            <Col style={indexColStyle} xl={"auto"} key={3}>2</Col>
            <Col style={indexColStyle} xl={"auto"} key={4}>3</Col>
            <Col style={indexColStyle} xl={"auto"} key={5}>4</Col>
            <Col style={indexColStyle} xl={"auto"} key={6}>5</Col>
            <Col style={indexColStyle} xl={"auto"} key={7}>6</Col>
            <Col style={indexColStyle} xl={"auto"} key={8}>7</Col>
        </Row>

        const gameBoardRows = gameBoard.map((row, i) => {
            return <Row xl={{ span: 6 }} key={i}>
                {this.getGameRow(playedGame, row, i)}
            </Row>
        })

        return [].concat(indexRow).concat(gameBoardRows)
    }

    playerIsWhite(game) {
        return game[5][0][0] === this.state.selectedAccount
    }

    selectedPlayersTurn(game) {
        if (game[6] === "0") {
            return game[5][0][0] === this.state.selectedAccount
        } else {
            return game[5][1][0] === this.state.selectedAccount
        }
    }

    gameEnded(game) {
        return game[3]
    }

    render() {
        const isRegistered = this.state.player.registered
        const isAdmin = this.state.player.playerAddr === this.state.adminAccount
        const gameElements = this.getGameElements()

        const playedGame = this.state.playedGameId && this.state.games ?
                this.state.games.filter(game => {return game[0] === this.state.playedGameId})[0] :
                undefined

        return <Container>

            <Row>
                <Col>
                    <Form.Label>Currently selected account:</Form.Label>
                    <Form.Control readOnly value={this.state.selectedAccount} />
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    <Button variant="primary" size="sm" onClick={this.fetchNewData.bind(this)}>
                        Refresh
                    </Button>
                </Col>
            </Row>

            {!isRegistered &&
                <Row className="mt-4">
                    <Col xl={{ span: 2 }}>
                        <Form.Label>User not registered:</Form.Label>
                    </Col>
                    <Col>
                        <Button variant="primary" size="sm" onClick={this.register.bind(this)}>
                            Register
                        </Button>
                    </Col>
                </Row>
            }

            {isAdmin &&
                <Row className="mt-4">
                    <Col xl={{ span: 2 }}>
                        <Form.Label>Create a game:</Form.Label>
                    </Col>
                    <Col xl={{ span: 2 }}>
                        <Form.Control placeholder="Enter game stake" onChange={e => this.setState({inputStakeValue: parseInt(e.target.value)})} />
                    </Col>
                    <Col xl={{ span: 2 }}>
                        <Button variant="primary" size="sm" onClick={this.createGame.bind(this)}>
                            Create
                        </Button>
                    </Col>
                </Row>
            }

            {isRegistered && <>
                <Row className="mt-4">
                    <Col xl={{ span: 2 }}>
                        <Form.Label>Player rank: {this.state.player.rank}</Form.Label>
                    </Col>
                    <Col xl={{ span: 2 }}>
                        <Form.Label>Player wins: {this.state.player.wins}</Form.Label>
                    </Col>
                    <Col xl={{ span: 2 }}>
                        <Form.Label>Player losses: {this.state.player.losses}</Form.Label>
                    </Col>
                </Row>
                <Row className="mt-4">
                    {gameElements}
                </Row>
            </>}

            {playedGame && <>
                <Row className="mt-4">
                    Playing game: <span style={{fontWeight: 'bold'}}>{this.state.playedGameId}</span>
                </Row>
                {!this.gameEnded(playedGame) &&
                    <Row>
                        <Form.Label>
                            Turn: {this.selectedPlayersTurn(playedGame) ?
                                <span style={{color: 'green', fontWeight: 'bold'}}>You</span> :
                                <span style={{color: 'red', fontWeight: 'bold'}}>Enemy</span>}
                        </Form.Label>
                    </Row>
                }
                {!this.gameEnded(playedGame) && this.selectedPlayersTurn(playedGame) &&
                    <Row className="mt-2">
                        <Col xl={"auto"}>
                            <Form.Label>Enter next move:</Form.Label>
                        </Col>
                        <Col xl={"auto"}>
                            <Form.Control style={{width: '76px'}} placeholder="From X" onChange={e => this.setState({nextMoveFromX: parseInt(e.target.value)})} />
                            <Form.Control style={{width: '76px'}} placeholder="From Y" onChange={e => this.setState({nextMoveFromY: parseInt(e.target.value)})} />
                        </Col>
                        <Col xl={"auto"}>
                            <Form.Control style={{width: '76px'}} placeholder="To X" onChange={e => this.setState({nextMoveToX: parseInt(e.target.value)})} />
                            <Form.Control style={{width: '76px'}} placeholder="To Y" onChange={e => this.setState({nextMoveToY: parseInt(e.target.value)})} />
                        </Col>
                        <Col xl={{ span: 2 }}>
                            <Button variant="primary" size="sm" onClick={this.makeMove.bind(this, playedGame[0])}>
                                Make move
                            </Button>
                        </Col>
                    </Row>
                }
                {this.gameEnded(playedGame) &&
                    <Row className="mt-2">
                        <Form.Label>
                            {this.selectedPlayersTurn(playedGame) ?
                                <span style={{color: 'green', fontWeight: 'bold'}}>You won!</span> :
                                <span style={{color: 'red', fontWeight: 'bold'}}>You lost!</span>}
                        </Form.Label>
                    </Row>
                }
                <Row className="mt-3">
                    <Container>
                        {this.getGameBoard(playedGame)}
                    </Container>
                </Row>
            </>}

        </Container>
    }
}


export default App;
