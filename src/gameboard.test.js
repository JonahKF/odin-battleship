import { Ship, Gameboard } from "./index.js";

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
