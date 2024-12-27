class Ship {
  constructor(type) {
    this.type = type;
    this.length = this.initShip(type);
    this.hits = 0;
    this.sunk = false;
  }

  initShip(type) {
    if (typeof type != "string") return;
    if (type.toLowerCase() === "carrier") return 5;
    if (type.toLowerCase() === "battleship") return 4;
    if (
      type.toLowerCase() === "destroyer" ||
      type.toLowerCase() === "submarine"
    )
      return 3;
    if (type.toLowerCase() === "patrolboat") return 2;
  }

  hit() {
    this.hits += 1;
    if (this.isSunk()) this.sunk = true;
  }

  isSunk() {
    if (this.hits >= this.length) return true;
  }
}

class Gameboard {
  constructor() {
    this.board = Array(10)
      .fill(null)
      .map(() => Array(10).fill(null));
    this.missedShots = [];
    this.ships = [];
  }

  checkValidPlacement(ship, coords, isVertical) {
    const [row, col] = coords;

    // Check if out of bounds
    if (isVertical) {
      if (row + ship.length > 10) return false;
    } else {
      if (col + ship.length > 10) return false;
    }

    // Check if space is occupied
    for (let i = 0; i < ship.length; i++) {
      if (isVertical) {
        if (this.board[row + i][col] !== null) return false;
      } else {
        if (this.board[row][col + i] !== null) return false;
      }
    }

    return true;
  }

  placeShip(ship, coords, isVertical = false) {
    if (!this.checkValidPlacement(ship, coords, isVertical)) return false;

    const [row, col] = coords;

    for (let i = 0; i < ship.length; i++) {
      if (isVertical) {
        this.board[row + i][col] = ship;
      } else {
        this.board[row][col + i] = ship;
      }
    }

    this.ships.push(ship);
    return true;
  }

  receiveAttack(coords) {}

  // logBoard() {
  //   let header = "   0 1 2 3 4 5 6 7 8 9";
  //   console.log(header);

  //   this.board.forEach((row, index) => {
  //     let rowStr = row.map((cell) => (cell === null ? "·" : cell)).join(" ");
  //     console.log(`${index}  ${rowStr}`);
  //   });
  // }
}

// board.placeShip(carrier, [0, 0], false // Places horizontally on top left

const gameController = () => {};

export { Ship, Gameboard }; // Export for testing
