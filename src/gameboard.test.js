import { Ship, Gameboard, Player } from "./gameboard.js";

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
