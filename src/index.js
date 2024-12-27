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

  placeShip(ship, coords, vertical = false) {} // A cell (arr[x][y]) can be made to = ship, which will contain a reference to a single ship

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

export { Gameboard }; // Export for testing
