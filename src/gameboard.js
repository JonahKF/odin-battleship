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
    this.hitShots = [];
    this.ships = [];
    this.queuedShips = [
      "carrier",
      "battleship",
      "destroyer",
      "submarine",
      "patrolboat",
    ];
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
    this.queuedShips.splice(this.queuedShips.indexOf(ship.type), 1); // Remove from queue

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
    this.hitShots.push(coords);
    return "hit";
  }

  checkSunkShips() {
    this.ships = this.ships.filter((ship) => !ship.sunk);

    return this.ships.length === 0;
  }
}

class Player {
  constructor(name, isHuman = false) {
    this.name = name;
    this.human = isHuman;
    this.gameboard = new Gameboard();
  }
}

export { Ship, Gameboard, Player };
