import { figType } from "../View/Figure";
import { evaluateBoard } from "./Evaluater";
import { assignedColor } from "../App";

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

//TODO: improve
function toFieldNotation(colIndex: string) {
  let result = "?";
  switch (colIndex) {
    case "0":
      result = "a";
      break;
    case "1":
      result = "b";
      break;
    case "2":
      result = "c";
      break;
    case "3":
      result = "d";
      break;
    case "4":
      result = "e";
      break;
    case "5":
      result = "f";
      break;
    case "6":
      result = "g";
      break;
    case "7":
      result = "h";
      break;
  }
  return result;
}
