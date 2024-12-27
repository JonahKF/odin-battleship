import { Ship, Gameboard, Player } from "./gameboard.js";
import { GameController } from "./index.js";

// Ship Test Suite
test("tests Ship existing", () => {
  expect(typeof new Ship("carrier")).toEqual("object");
});

test("tests Ship lengths", () => {
  expect(new Ship("carrier").length).toEqual(5);
  expect(new Ship("battleship").length).toEqual(4);
  expect(new Ship("submarine").length).toEqual(3);
  expect(new Ship("destroyer").length).toEqual(3);
  expect(new Ship("patrolboat").length).toEqual(2);
});

// Gameboard Test Suite
test("tests Gameboard existing", () => {
  expect(typeof new Gameboard()).toEqual("object");
});

test("tests ship placement", () => {
  const board = new Gameboard();
  const carrier = new Ship("carrier");
  const submarine = new Ship("submarine");

  board.placeShip(carrier, [0, 0], false);
  board.placeShip(submarine, [2, 3], true);

  expect(typeof board.board[0][0]).toEqual("object");
  expect(board.board[0][0].type).toEqual("carrier");
  expect(board.board[0][1].type).toEqual("carrier");
  expect(board.board[0][4].type).toEqual("carrier");
  expect(board.board[0][5]).toEqual(null);
});

// Player Test Suite
test("tests ship placement within a Player gameboard", () => {
  const testPlayer = new Player();
  expect(testPlayer.human).toBe(false);

  const carrier = new Ship("carrier");
  const submarine = new Ship("submarine");

  testPlayer.gameboard.placeShip(carrier, [0, 0], false);
  testPlayer.gameboard.placeShip(submarine, [2, 3], true);

  expect(typeof testPlayer.gameboard.board[0][0]).toEqual("object");
  expect(testPlayer.gameboard.board[0][0].type).toEqual("carrier");
  expect(testPlayer.gameboard.board[0][1].type).toEqual("carrier");
  expect(testPlayer.gameboard.board[0][4].type).toEqual("carrier");
  expect(testPlayer.gameboard.board[0][5]).toEqual(null);
});
