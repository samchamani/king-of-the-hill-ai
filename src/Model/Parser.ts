import { figType } from "../View/Figure";
import { gameState } from "../App";

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
  return board;
};

//TODO: Implement (but maybe not necessary. Depends on Game Server)
export const toFEN = (state: gameState) => {
  let resRaw = "";
  for (const row in state.board) {
    state.board[row].forEach((cell) => {
      resRaw += cell === "" ? "1" : cell;
    });
    if (row !== "7") resRaw += "/";
  }
  const boardString = resRaw.replace(/11+/g, (match) => {
    return String(match.match(/1/g)!.length);
  });
  const player = state.isWhiteTurn ? "w" : "b";
  return `${boardString} ${player} ${state.castleRight} ${state.enPassant} ${state.halfmoveClock} ${state.fullmoveCount}`;
};

export const toStateHistoryFEN = (state: gameState) => {
  let resRaw = "";
  for (const row in state.board) {
    state.board[row].forEach((cell) => {
      resRaw += cell === "" ? "1" : cell;
    });
    if (row !== "7") resRaw += "/";
  }
  const boardString = resRaw.replace(/11+/g, (match) => {
    return String(match.match(/1/g)!.length);
  });
  const player = state.isWhiteTurn ? "w" : "b";
  return `${boardString} ${player} ${state.castleRight} ${state.enPassant}`;
};

export function makeField(row: number, col: number) {
  return colNames[col] + rowNames[row];
}

export function makeIndex(pos: string) {
  if (pos.length !== 2) return [-1, -1];
  return [rowNames.indexOf(pos[1]), colNames.indexOf(pos[0])];
}
