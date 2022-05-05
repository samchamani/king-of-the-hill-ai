import { gameState } from "../App";
// import { figType } from "../View/Figure";
import { isIndexOnBoard, isWhite, isEmpty, isBeatable } from "./Utils";
import { makeField, makeIndex } from "./Parser";
import { getConfigFileParsingDiagnostics } from "typescript";

export const getMoves = (state: gameState) => {
  let moves: string[] = [];
  for (const row in state.board) {
    for (const col in state.board[row]) {
      if (true /*TODO: nur relevante Figuren, zB Farbe wie assignedColor*/)
        moves = [...moves, ...getMovesFor(state, [row, col])];
    }
  }
  return moves;
};

const getMovesFor = (state: gameState, [row, col]: [string, string]) => {
  const rowNum = parseInt(row);
  const colNum = parseInt(col);
  const fig = state.board[rowNum][colNum].toUpperCase();
  let moves: string[] = [];
  switch (fig) {
    case "P":
      moves = [...moves, ...getMovesP(state, [rowNum, colNum])];
      break;
    case "N":
      moves = [...moves, ...getMovesN(state, [rowNum, colNum])];
      break;
    case "B":
      moves = [...moves, ...getMovesB(state, [rowNum, colNum])];
      break;
    case "R":
      moves = [...moves, ...getMovesR(state, [rowNum, colNum])];
      break;
    case "Q":
      moves = [...moves, ...getMovesQ(state, [rowNum, colNum])];
      break;
    case "K":
      moves = [...moves, ...getMovesK(state, [rowNum, colNum])];
      break;
  }
  return moves;
};

// TODO: implement move rools
// Ist der Ansatz gut? Eventuell hier schon Bewertungsfunktion anwenden.
// Eventuell FEN oder Folgestate mitausgeben für KI

const getMovesP = (state: gameState, [row, col]: [number, number]) => {
  let moves: string[] = [];
  const board = state.board;
  const fig = board[row][col];
  const colorFactor = isWhite(fig) ? -1 : 1;

  // 1 Step vor:
  const oneAhead = row + colorFactor;
  if (isIndexOnBoard(oneAhead) && isEmpty(board[oneAhead][col])) {
    moves.push(fig + makeField(row, col) + "-" + makeField(oneAhead, col));
  }

  // 2 Step vor aus Startposition:
  // TODO: state =>  en Passant
  const twoAhead = row + colorFactor * 2;
  const isStartPos = row + colorFactor * 2.5 === 3.5;
  if (
    isStartPos &&
    isEmpty(board[twoAhead][col]) &&
    isEmpty(board[oneAhead][col])
  ) {
    moves.push(fig + makeField(row, col) + "-" + makeField(twoAhead, col));
  }

  // TODO: schräger Schlagzug + en Passant:

  const diaLeftRow = row + colorFactor * 1;
  const diaLeftCol = col - 1;

  const diaRightRow = row + colorFactor * 1;
  const diaRightCol = col + 1;

  const isEnPass = state.enPassant !== "-";
  const [enPasRow, enPasCol]: number[] = makeIndex(state.enPassant);

  if (
    isIndexOnBoard(diaLeftCol, diaLeftRow) &&
    !isEmpty(board[diaLeftRow][diaLeftCol]) &&
    isBeatable(fig, board[diaLeftRow][diaLeftCol])
  ) {
    moves.push(
      fig + makeField(row, col) + "x" + makeField(diaLeftRow, diaLeftCol)
    );
  } else if (
    isEnPass &&
    isIndexOnBoard(diaLeftCol, diaLeftRow) &&
    isEmpty(board[diaLeftRow][diaLeftCol]) &&
    isBeatable(fig, board[row][enPasCol]) &&
    diaLeftRow === enPasRow &&
    diaLeftCol === enPasCol
  ) {
    moves.push(
      "ENPASSANT: " +
        fig +
        makeField(row, col) +
        "x" +
        makeField(diaLeftRow, diaLeftCol)
    );
  }

  if (
    isIndexOnBoard(diaRightCol, diaRightRow) &&
    !isEmpty(board[diaRightRow][diaRightCol]) &&
    isBeatable(fig, board[diaRightRow][diaRightCol])
  ) {
    moves.push(
      fig + makeField(row, col) + "x" + makeField(diaRightRow, diaRightCol)
    );
  } else if (
    isEnPass &&
    isIndexOnBoard(diaRightCol, diaRightRow) &&
    isEmpty(board[diaRightRow][diaRightCol]) &&
    isBeatable(fig, board[row][enPasCol]) &&
    diaRightRow === enPasRow &&
    diaRightCol === enPasCol
  ) {
    moves.push(
      "ENPASSANT: " +
        fig +
        makeField(row, col) +
        "x" +
        makeField(diaRightRow, diaRightCol)
    );
  }
  return moves;

  //TODO: Bauer in letzter Gegnerreihe => Umwandlung in beliebigen Stein: wie notieren?
};

const getMovesB = (state: gameState, [row, col]: [number, number]) => {
  return "";
};

const getMovesN = (state: gameState, [row, col]: [number, number]) => {
  return "";
};

const getMovesR = (state: gameState, [row, col]: [number, number]) => {
  return "";
};

const getMovesQ = (state: gameState, [row, col]: [number, number]) => {
  return "";
};

const getMovesK = (state: gameState, [row, col]: [number, number]) => {
  return "";
};
