import { figType } from "../View/Figure";
import { evaluateBoard } from "./Evaluater";
import { assignedColor } from "../App";

const colNames = ["a", "b", "c", "d", "e", "f", "g", "h"];
const rowNames = ["8", "7", "6", "5", "4", "3", "2", "1"];

export const parseFEN = (fen: string): figType[][] => {
  const rows = fen.split("/");
  const board: figType[][] = [];
  for (const row of rows) {
    let rowContent: figType[] = [];
    const cells = [...row];
    cells.forEach((cell) => {
      /\d/.test(cell)
        ? (rowContent = [...rowContent, ...new Array(parseInt(cell)).fill("")])
        : rowContent.push(cell as figType);
    });
    board.push(rowContent);
  }

  console.log("Score: ", evaluateBoard(board, assignedColor === "w")); //TODO: Remove

  return board;
};

//TODO: Implement (but maybe not necessary. Depends on Game Server)
export const toFEN = (board: figType[][]) => {
  return "";
};

export function makeField(row: number, col: number) {
  return rowNames[row] + colNames[col];
}
