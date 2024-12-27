import "./styles.css";
import { Ship, Gameboard, Player } from "./gameboard.js";

console.log("Battleship script loaded.");
console.log("Welcome aboard captain. All systems online.");

// Game logic
class GameController {
  constructor() {
    this.playerOne = null;
    this.playerTwo = null;
    this.currentPlayer = null;
    this.gamePhase = "setup";
    this.shipTypes = [
      "carrier",
      "battleship",
      "destroyer",
      "submarine",
      "patrolboat",
    ];
    this.currentShipIndex = 0;
  }

  startGame() {
    // Create new Players (human and AI)
    this.playerOne = new Player("Player One", true);
    this.playerTwo = new Player("Computer Player");

    // Set currentPlayer to playerOne
    this.currentPlayer = this.playerOne;

    // FOR TESTING - Place two ships for each player
    const carrierOne = new Ship("carrier");
    const submarineOne = new Ship("submarine");
    const carrierTwo = new Ship("carrier");
    const submarineTwo = new Ship("submarine");
    this.playerOne.gameboard.placeShip(carrierOne, [2, 3], false);
    this.playerOne.gameboard.placeShip(submarineOne, [5, 4], true);
    this.playerTwo.gameboard.placeShip(carrierTwo, [0, 0], false);
    this.playerTwo.gameboard.placeShip(submarineTwo, [2, 3], true);
    this.gamePhase = "playing";

    // Return object with both players
    return { playerOne: this.playerOne, playerTwo: this.playerTwo };
  }

  placeShip(coords, isVertical) {
    // Check if all ships placed
    if (this.currentShipIndex >= this.shipTypes.length) {
      return false;
    }

    // Create new ship of current type
    const newShip = new Ship(this.shipTypes[this.currentShipIndex]);

    // Try to place ship on current player's board
    const placed = this.currentPlayer.gameboard.placeShip(
      newShip,
      coords,
      isVertical,
    );

    // If successful (placed can be false if coords occupied already):
    if (placed) {
      this.currentShipIndex++;
      // Check if all ships placed
      if (this.currentShipIndex === this.shipTypes.length) {
        if (this.currentPlayer === this.playerOne) {
          this.currentPlayer = this.playerTwo;
          this.currentShipIndex = 0; // Reset for player 2
        } else {
          this.gamePhase = "playing";
          this.currentPlayer = this.playerOne;
        }
      }
    }

    // Return whether placement was successful
    return placed;
  }

  makeAttack(coords) {
    // If not in playing phase, return false
    if (this.gamePhase !== "playing") return false;

    // Get opponent's board
    const targetBoard =
      this.currentPlayer === this.playerOne
        ? this.playerTwo.gameboard
        : this.playerOne.gameboard;

    const result = targetBoard.receiveAttack(coords);
    this.checkVictory();

    if (result) {
      this.switchTurn();

      if (!this.currentPlayer.human) {
        setTimeout(() => {
          this.computerAttack();
        }, 500);
        this.checkVictory();
      }
    }
    return result; // "hit" or "miss"
  }

  switchTurn() {
    this.currentPlayer =
      this.currentPlayer === this.playerOne ? this.playerTwo : this.playerOne;
    console.log(`Switching to ${this.currentPlayer.name}`);
  }

  computerAttack() {
    const getRandomCoord = () => {
      return [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
    };

    let coords = getRandomCoord();
    while (this.playerOne.gameboard.missedShots.includes(coords)) {
      coords = getRandomCoord();
    }

    console.log(`AI is attacking ${coords}`);
    return this.makeAttack(coords);
  }

  checkVictory() {
    const playerOneVictory = this.playerTwo.gameboard.checkSunkShips();
    const playerTwoVictory = this.playerOne.gameboard.checkSunkShips();

    if (playerOneVictory) {
      console.log(`${this.playerOne.name} wins!`);
      return true;
    }
    if (playerTwoVictory) {
      console.log(`${this.playerTwo.name} wins!`);
      return true;
    }
    return false;
  }

  getGameState() {
    return {
      currentPlayer: this.currentPlayer,
      gamePhase: this.gamePhase,
      playerOneBoard: this.playerOne.gameboard.board,
      playerTwoBoard: this.playerTwo.gameboard.board,
      currentShipType: this.shipTypes[this.currentShipIndex],
      playerOneMisses: this.playerOne.gameboard.missedShots,
      playerTwoMisses: this.playerTwo.gameboard.missedShots,
    };
  }
}

class ScreenController {
  constructor(gameController) {
    this.gameController = gameController;
    this.boardOne = document.querySelector(".board-one");
    this.boardTwo = document.querySelector(".board-two");
    this.isVertical = false;
  }

  renderBoard(htmlBoard, playerBoard, missedShots, isEnemy) {
    // Clear dom board
    htmlBoard.innerHTML = "";

    const rowHeaders = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

    for (let row = 0; row < 10; row++) {
      // Add row label
      const rowLabel = document.createElement("div");
      rowLabel.classList.add("label");
      rowLabel.textContent = rowHeaders[row];
      htmlBoard.appendChild(rowLabel);

      // Add game cells
      for (let col = 0; col < 10; col++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = row;
        cell.dataset.col = col;

        const ship = playerBoard[row][col];

        // Add appropriate classes
        if (ship !== null && !isEnemy) {
          // remove enemy check to show enemy board
          cell.classList.add("ship");
          cell.innerHTML = ship.type[0].toUpperCase();
          if (ship.sunk) cell.classList.add("sunk");
        }

        // Check if cell is in missedShots
        if (missedShots.some(([r, c]) => r === row && c === col)) {
          cell.classList.add("miss");
        }

        // Add event listeners based on game phase
        if (this.gameController.gamePhase === "setup" && !isEnemy) {
          cell.addEventListener("click", () =>
            this.handlePlacement([row, col]),
          );
        } else if (this.gameController.gamePhase === "playing" && isEnemy) {
          cell.addEventListener("click", () => this.handleAttack([row, col]));
        }

        htmlBoard.appendChild(cell);
      }
    }

    // Add column labels at the bottom
    // First add empty corner label
    const cornerLabel = document.createElement("div");
    cornerLabel.classList.add("label");
    htmlBoard.appendChild(cornerLabel);

    // Then add number labels (0-9)
    for (let col = 0; col < 10; col++) {
      const label = document.createElement("div");
      label.classList.add("label");
      label.textContent = col;
      htmlBoard.appendChild(label);
    }
  }

  handlePlacement(coords) {
    console.log("Handling placement.");
    const placed = this.gameController.placeShip(coords, this.isVertical);
    if (placed) {
      this.updateDisplay();
    }
  }

  handleAttack(coords) {
    console.log("Handling attack.");
    const result = this.gameController.makeAttack(coords);
    if (result) {
      console.log(result);
      this.updateDisplay();
    }
  }

  updateDisplay() {
    const gameState = this.gameController.getGameState();

    if (this.gameController.playerTwo.human) {
      // Player vs Player
      if (gameState.currentPlayer === this.gameController.playerOne) {
        this.renderBoard(
          this.boardOne,
          gameState.playerOneBoard,
          gameState.playerOneMisses,
          false,
        );
        this.renderBoard(
          this.boardTwo,
          gameState.playerTwoBoard,
          gameState.playerTwoMisses,
          true,
        );
      } else {
        this.renderBoard(
          this.boardOne,
          gameState.playerOneBoard,
          gameState.playerOneMisses,
          true,
        );
        this.renderBoard(
          this.boardTwo,
          gameState.playerTwoBoard,
          gameState.playerTwoMisses,
          false,
        );
      }
    } else {
      // Player vs AI - always show Player 1's perspective
      this.renderBoard(
        this.boardOne,
        gameState.playerOneBoard,
        gameState.playerOneMisses,
        false,
      );
      this.renderBoard(
        this.boardTwo,
        gameState.playerTwoBoard,
        gameState.playerTwoMisses,
        true,
      );
    }
  }

  initialize() {
    // Start game
    this.gameController.startGame();
    this.updateDisplay();

    // Add rotation keyboard listener
    document.addEventListener("keypress", (e) => {
      if (e.key === "r") {
        this.isVertical = !this.isVertical;
      }
    });
  }
}

const game = new GameController();
const screen = new ScreenController(game);
screen.initialize();
