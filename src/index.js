import "./styles.css";
import { Ship, Gameboard, Player } from "./gameboard.js";

console.log("Battleship script loaded.");
console.log("Welcome aboard captain. All systems online.");

const gameController = () => {
  // Global Variables
  const boardOne = document.querySelector(".board-one");
  const boardTwo = document.querySelector(".board-two");

  // Global Functions
  const startGame = () => {
    // Ask if P2 is human using popups
    const human = false; // temp
    const playerOne = new Player(true);
    const playerTwo = new Player(human);
  };

  const updateScreens = () => {};

  const renderBoard = (player, board) => {};

  const setShip = (ship) => {};

  // Game Start
  startGame();
};

gameController();
