import { figType } from "../View/Figure";
import { isWhite } from "./Utils";

/**
 * Values from https://www.chess.com/terms/chess-piece-value
 *
 * @param board
 * @param playsWhite
 * @returns
 */
export const evaluateBoard = (board: figType[][], playsWhite: boolean) => {
  let sum = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === "") continue;
      const colorFactor = playsWhite && isWhite(cell) ? 1 : -1;
      switch (cell) {
        case "P":
          sum += colorFactor * 1;
          break;
        case "N":
          sum += colorFactor * 3;
          break;
        case "B":
          sum += colorFactor * 3;
          break;
        case "R":
          sum += colorFactor * 5;
          break;
        case "Q":
          sum += colorFactor * 9;
          break;
        case "K":
          sum += colorFactor * 1000;
          break;
        case "p":
          sum += colorFactor * 1;
          break;
        case "n":
          sum += colorFactor * 3;
          break;
        case "b":
          sum += colorFactor * 3;
          break;
        case "r":
          sum += colorFactor * 5;
          break;
        case "q":
          sum += colorFactor * 9;
          break;
        case "k":
          sum += colorFactor * 1000;
          break;
      }
    }
  }
  return sum;
};