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
    const playerOne = new Player(true);
    const playerTwo = new Player();

    // Set currentPlayer to playerOne
    this.currentPlayer = playerOne;

    // FOR TESTING - Place two ships for each player
    playerOne.gameboard.placeShip(carrier, [0, 0], false);
    playerOne.gameboard.placeShip(submarine, [2, 3], true);
    playerTwo.gameboard.placeShip(carrier, [0, 0], false);
    playerTwo.gameboard.placeShip(submarine, [2, 3], true);

    // Return object with both players
    return { playerOne, playerTwo };
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
      //   - Increment currentShipIndex
      //   - Check if all ships placed for current player
      //   - Switch players or start game if both done
    }

    // Return whether placement was successful
    return placed;
  }

  makeAttack(coords) {
    // If not in playing phase, return false
    if (this.gamePhase !== "playing") return false;

    // Get opponent's board
    // Make attack and get result
    // Switch turns if attack was valid
    // Return attack result ("hit"/"miss")
  }

  switchTurn() {
    this.currentPlayer =
      this.currentPlayer === this.playerOne ? this.playerTwo : this.playerOne;
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
      for (let col = 0; col < 10; col++) {
        if (col === 0) {
          // Add row labels
          const label = document.createElement("div");
          label.classList.add("label");
          label.textContent = rowHeaders[row];
          htmlBoard.appendChild(label);
        } else {
          // Add game cell
          const cell = document.createElement("div");
          cell.classList.add("cell");
          cell.dataset.row = row;
          cell.dataset.col = col;

          const ship = playerBoard[row][col];

          // Add appropriate classes
          if (ship !== null && !isEnemy) {
            cell.classList.add("ship");
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
    }

    // Add column labels
    for (let col = 0; col < 11; col++) {
      if (col === 0) {
        const label = document.createElement("div");
        label.classList.add("label");
        htmlBoard.appendChild(label);
      } else {
        const label = document.createElement("div");
        label.classList.add("label");
        label.textContent = col;
        htmlBoard.appendChild(label);
      }
    }
  }

  handlePlacement(coords) {
    const placed = this.gameController.placeShip(coords, this.isVertical);
    if (placed) {
      this.updateDisplay();
    }
  }

  handleAttack(coords) {
    const result = this.gameController.makeAttack(coords);
    if (result) {
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
