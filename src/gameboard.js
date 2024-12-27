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
    return this.hits >= this.length;
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

  // board.placeShip(carrier, [0, 0], false // Places horizontally on top left
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

  receiveAttack(coords) {
    const [row, col] = coords;
    const target = this.board[row][col];

    if (target === null) {
      this.missedShots.push(coords);
      return "miss";
    }

    target.hit();
    return "hit";
  }

  checkSunkShips() {
    // Returns true if all ships sunk, false if ships remain
    if (this.ships.length === 0) return true;

    this.ships.forEach((ship, index) => {
      if (ship.sunk) this.ships.splice(index, 1);
    });

    return false;
  }

  displayMissedAttacks() {
    // Update DOM grid w/ missed attacks
  }

  // logBoard() {
  //   let header = "   0 1 2 3 4 5 6 7 8 9";
  //   console.log(header);

  //   this.board.forEach((row, index) => {
  //     let rowStr = row.map((cell) => (cell === null ? "·" : cell)).join(" ");
  //     console.log(`${index}  ${rowStr}`);
  //   });
  // }
}

class Player {
  constructor(isHuman = false) {
    this.human = isHuman;
    this.gameboard = new Gameboard();
  }
}

export { Ship, Gameboard, Player };
