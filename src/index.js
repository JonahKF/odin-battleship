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
    this.shipTypes = {
      carrier: { length: 5, placed: false },
      battleship: { length: 4, placed: false },
      destroyer: { length: 3, placed: false },
      submarine: { length: 3, placed: false },
      patrolboat: { length: 2, placed: false },
    };
    this.currentShipIndex = 0;
  }

  startGame() {
    // Create new Players (human and computer)
    this.playerOne = new Player("Player One", true);
    this.playerTwo = new Player("Computer Player");

    // Set currentPlayer to playerOne
    this.currentPlayer = this.playerOne;

    // Return object with both players
    return { playerOne: this.playerOne, playerTwo: this.playerTwo };
  }

  placeShip(coords, shipType, isVertical) {
    if (this.shipTypes[shipType].placed) return false;

    const newShip = new Ship(shipType);

    // Try to place ship on current player's board
    const placed = this.currentPlayer.gameboard.placeShip(
      newShip,
      coords,
      isVertical,
    );

    // If successful (placed can be false if coords invalid):
    if (placed) {
      this.shipTypes[shipType].placed = true;

      const allShipsPlaced = Object.values(this.shipTypes).every(
        (ship) => ship.placed,
      );

      if (allShipsPlaced) {
        if (
          this.currentPlayer === this.playerOne &&
          this.playerTwo.human === true
        ) {
          this.currentPlayer = this.playerTwo;
          Object.keys(this.shipTypes).forEach((type) => {
            this.shipTypes[type].placed = false;
          });
        } else if (
          this.currentPlayer === this.playerOne &&
          this.playerTwo.human === false
        ) {
          this.placeComputerShips();
        } else {
          // All ships placed
          this.gamePhase = "playing";
          this.currentPlayer = this.playerOne;
        }
      }
    }

    return placed;
  }

  placeComputerShips() {
    this.currentPlayer = this.playerTwo;
    Object.keys(this.shipTypes).forEach((type) => {
      this.shipTypes[type].placed = false;
    });

    const getRandomCoord = () => {
      return [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
    };

    Object.keys(this.shipTypes).forEach((ship) => {
      let coords = getRandomCoord();
      let isVertical = Math.random() < 0.5;

      while (
        !this.playerTwo.gameboard.checkValidPlacement(
          new Ship(ship),
          coords,
          isVertical,
        )
      ) {
        coords = getRandomCoord(); // Reassign existing variables
        isVertical = Math.random() < 0.5;
      }

      this.placeShip(coords, ship, isVertical);
    });

    // All ships placed
    this.gamePhase = "playing";
    this.currentPlayer = this.playerOne;
  }

  makeAttack(coords) {
    if (this.gamePhase !== "playing") return false;

    const targetBoard =
      this.currentPlayer === this.playerOne
        ? this.playerTwo.gameboard
        : this.playerOne.gameboard;

    const targetPlayer =
      this.currentPlayer === this.playerOne ? this.playerTwo : this.playerOne;

    const result = targetBoard.receiveAttack(coords);
    let isVictory = this.checkVictory(targetPlayer);

    if (result) {
      if (!isVictory) this.switchTurn();

      if (!isVictory && !this.currentPlayer.human) {
        return {
          playerResult: result,
          isVictory,
          winner: isVictory ? this.currentPlayer.name : null,
          computerTurn: true,
        };
      }
      return {
        playerResult: result,
        isVictory,
        winner: isVictory ? this.currentPlayer.name : null,
        computerTurn: false,
      };
    }
    return false;
  }

  switchTurn() {
    this.currentPlayer =
      this.currentPlayer === this.playerOne ? this.playerTwo : this.playerOne;
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

  checkVictory(player) {
    return player.gameboard.checkSunkShips();
  }

  getGameState() {
    return {
      currentPlayer: this.currentPlayer,
      gamePhase: this.gamePhase,
      playerOneBoard: this.playerOne.gameboard.board,
      playerTwoBoard: this.playerTwo.gameboard.board,
      currentShipType: this.shipTypes[this.currentShipIndex],
      playerOneHits: this.playerOne.gameboard.hitShots,
      playerTwoHits: this.playerTwo.gameboard.hitShots,
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

  renderBoard(htmlBoard, playerBoard, hitShots, missedShots, isEnemy) {
    htmlBoard.innerHTML = "";

    if (isEnemy && this.gameController.gamePhase === "setup") {
      const enemyOverlay = document.createElement("div");
      enemyOverlay.classList.add("board-two-overlay");
      htmlBoard.appendChild(enemyOverlay);
    }

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
        if (!isEnemy) cell.classList.add("player");
        if (isEnemy && this.gameController.gamePhase === "playing") {
          cell.classList.add("enemy-active");
        }

        cell.dataset.row = rowHeaders[row];
        cell.dataset.rownum = row;
        cell.dataset.col = col;

        const ship = playerBoard[row][col];
        const isHit = hitShots.some(([r, c]) => r === row && c === col);
        const isMissed = missedShots.some(([r, c]) => r === row && c === col);
        const isAttacked = isHit || isMissed;

        if (this.gameController.gamePhase === "setup" && !isEnemy) {
          cell.addEventListener("dragover", (e) => {
            e.preventDefault();
            cell.classList.add("drag-over");

            // Color adjacent cells for placement visualization
            const dragging = document.querySelector(".dragging");
            const dragShipLength =
              this.gameController.shipTypes[dragging.dataset.shipType].length;
            const currentRow = parseInt(cell.dataset.rownum);
            const currentCol = parseInt(cell.dataset.col);

            const allCells = htmlBoard.querySelectorAll(".cell");
            allCells.forEach((cell) => cell.classList.remove("drag-over"));

            for (let i = 0; i < dragShipLength; i++) {
              let targetCell;
              if (this.isVertical) {
                if (currentRow + i < 10) {
                  // Check bounds
                  targetCell = htmlBoard.querySelector(
                    `[data-rownum="${currentRow + i}"][data-col="${currentCol}"]`,
                  );
                }
              } else {
                if (currentCol + i < 10) {
                  // Check bounds
                  targetCell = htmlBoard.querySelector(
                    `[data-rownum="${currentRow}"][data-col="${currentCol + i}"]`,
                  );
                }
              }
              if (targetCell) {
                targetCell.classList.add("drag-over");
              }
            }
          });

          cell.addEventListener("mouseover", () => {
            const tooltip = document.querySelector(".tooltip");
            tooltip.style.display = "flex";
          });

          cell.addEventListener("mouseout", () => {
            const tooltip = document.querySelector(".tooltip");
            tooltip.style.display = "none";
          });

          cell.addEventListener("mousemove", (e) => {
            const tooltip = document.querySelector(".tooltip");
            const x = e.clientX;
            const y = e.clientY;
            const offsetX = 15;
            const offsetY = -30;

            tooltip.style.left = `${x + offsetX}px`;
            tooltip.style.top = `${y + offsetY}px`;

            tooltip.innerHTML = `${cell.dataset.row}, ${cell.dataset.col}`;
          });

          cell.addEventListener("dragleave", () => {
            const allCells = htmlBoard.querySelectorAll(".cell");
            allCells.forEach((cell) => cell.classList.remove("drag-over"));
          });

          cell.addEventListener("drop", (e) => {
            e.preventDefault();
            const allCells = htmlBoard.querySelectorAll(".cell");
            allCells.forEach((cell) => cell.classList.remove("drag-over"));
            const shipType = e.dataTransfer.getData("text/plain");
            this.handleShipPlacement([row, col], shipType, this.isVertical);
          });
        }

        if (ship !== null && !isEnemy) {
          cell.classList.add("ship");
          cell.innerHTML = ship.type[0].toUpperCase();
        }

        if (isHit) cell.classList.add("hit");
        if (isMissed) cell.classList.add("miss");

        if (
          this.gameController.gamePhase === "playing" &&
          isEnemy &&
          !isAttacked
        ) {
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

  updateSidebar() {
    if (this.gameController.gamePhase === "setup") {
      // Populate w/ Ships for drag-and-drop
      const ships = document.querySelector(".ship-and-text");
      ships.innerHTML = "";

      const remainingShips = Object.entries(this.gameController.shipTypes)
        .filter(([_, data]) => !data.placed)
        .map(([shipType, _]) => shipType);

      remainingShips.forEach((shipType) => {
        const shipDiv = document.createElement("div");
        shipDiv.classList.add("draggable-ship");
        shipDiv.dataset.shipType = shipType;
        shipDiv.draggable = true;

        shipDiv.addEventListener("dragstart", this.handleDragStart.bind(this));
        shipDiv.addEventListener("dragend", this.handleDragEnd.bind(this));

        // Create cells based on ship length
        const shipLength = this.gameController.shipTypes[shipType].length;
        for (let i = 0; i < shipLength; i++) {
          const cell = document.createElement("div");
          cell.classList.add("ship-cell");
          cell.textContent = shipType[0].toUpperCase();
          shipDiv.appendChild(cell);
        }

        ships.appendChild(shipDiv);
      });

      // Rotation button with kbd tag
      const rotateShipBtn = document.createElement("button");
      rotateShipBtn.classList.add("rotate-button");
      const kbd = document.createElement("kbd");
      kbd.dataset.kbd = "R";
      kbd.classList.add("rotate-kbd");
      kbd.innerHTML = "R";
      const indicator = document.createElement("div");
      indicator.classList.add("rotate-indicator");

      rotateShipBtn.innerHTML = "Rotate";
      rotateShipBtn.appendChild(kbd);
      rotateShipBtn.appendChild(indicator);

      rotateShipBtn.addEventListener("click", () => {
        this.isVertical = !this.isVertical;
      });

      ships.appendChild(rotateShipBtn);
    }

    if (this.gameController.gamePhase === "playing") {
      // Terminal-like text updates about game state
      const textbox = document.querySelector(".ship-and-text");
      textbox.innerHTML = "";
    }
  }

  handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.shipType);
    e.target.classList.add("dragging");

    e.dataTransfer.setDragImage(e.target, 20, e.target.offsetHeight / 2);
  }

  handleDragEnd(e) {
    e.target.classList.remove("dragging");
  }

  handleShipPlacement(coords, shipType, isVertical) {
    const placed = this.gameController.placeShip(coords, shipType, isVertical);

    if (placed) {
      this.updateDisplay();
      this.updateSidebar();

      // Check if all ships are placed
      const allShipsPlaced = Object.values(this.gameController.shipTypes).every(
        (ship) => ship.placed,
      );

      if (allShipsPlaced) {
        // Start game
        this.gameStartTransition();
      }
    }
  }

  gameStartTransition() {
    // Prompt that game has started
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    const message = document.createElement("div");
    message.classList.add("game-start-message");
    message.textContent = "Battleship start. Click anywhere to begin.";

    overlay.appendChild(message);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", () => {
      overlay.remove();
    });

    // Remove filter over enemy board
    this.removeEnemyBoardOverlay();
  }

  async handleAttack(coords) {
    const result = await this.gameController.makeAttack(coords);
    if (result) {
      console.log(result);
      this.updateDisplay();
      this.updateSidebar();

      if (result.isVictory) {
        this.showVictoryPrompt(result.winner);
        return;
      }

      // Computer attack logic
      if (result.computerTurn) {
        setTimeout(async () => {
          const computerResult = this.gameController.computerAttack();
          this.updateDisplay();
          this.updateSidebar();

          const computerVictory = this.gameController.checkVictory(
            this.gameController.playerOne,
          );
          if (computerVictory) {
            this.showVictoryPrompt(this.gameController.playerTwo.name);
          }
        }, 500);
      }
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
          gameState.playerOneHits,
          gameState.playerOneMisses,
          false,
        );
        this.renderBoard(
          this.boardTwo,
          gameState.playerTwoBoard,
          gameState.playerTwoHits,
          gameState.playerTwoMisses,
          true,
        );
      } else {
        this.renderBoard(
          this.boardOne,
          gameState.playerOneBoard,
          gameState.playerOneHits,
          gameState.playerOneMisses,
          true,
        );
        this.renderBoard(
          this.boardTwo,
          gameState.playerTwoBoard,
          gameState.playerTwoHits,
          gameState.playerTwoMisses,
          false,
        );
      }
    } else {
      // Player vs AI - always show Player 1's perspective
      this.renderBoard(
        this.boardOne,
        gameState.playerOneBoard,
        gameState.playerOneHits,
        gameState.playerOneMisses,
        false,
      );
      this.renderBoard(
        this.boardTwo,
        gameState.playerTwoBoard,
        gameState.playerTwoHits,
        gameState.playerTwoMisses,
        true,
      );
    }
  }

  removeEnemyBoardOverlay() {
    const overlay = document.querySelector(".board-two-overlay");
    overlay.style.display = "none";
  }

  initialize() {
    // Start game
    this.gameController.startGame();
    this.updateDisplay();
    this.updateSidebar();

    // Add rotation keyboard listener
    document.addEventListener("keypress", (e) => {
      if (e.key === "r") {
        this.isVertical = !this.isVertical;
      }
    });
  }

  rotateShips() {
    this.isVertical = !this.isVertical;
  }

  showVictoryPrompt(winner) {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    const message = document.createElement("div");
    message.classList.add("victory-message");
    message.textContent = `${winner} wins! Click anywhere to play again.`;

    overlay.appendChild(message);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", () => {
      overlay.remove();
      this.newGameLogic();
    });
  }

  newGameLogic() {
    this.gameController = new GameController();
    this.isVertical = false;

    this.initialize();
  }
}

const game = new GameController();
const screen = new ScreenController(game);
screen.initialize();
