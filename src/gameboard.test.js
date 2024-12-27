import { Gameboard } from "./index.js";

test("tests Gameboard existing", () => {
  expect(typeof new Gameboard()).toEqual("object");
});
