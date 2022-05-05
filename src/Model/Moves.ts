import { gameState } from "../App";
// import { figType } from "../View/Figure";
import { isIndexOnBoard, isWhite, isEmpty, isBeatable } from "./Utils";
import { makeField } from "./Parser";

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
  if (isIndexOnBoard(oneAhead)) {
    if (isEmpty(board[oneAhead][col])) {
      moves.push(fig + makeField(row, col) + "-" + makeField(oneAhead, col));
    } else if (isBeatable(fig, board[oneAhead][col])) {
      moves.push(fig + makeField(row, col) + "-" + makeField(oneAhead, col));
    }
  }

  // TODO: 2 Step vor:
  const twoAhead = row + colorFactor * 2;
  if (isIndexOnBoard(twoAhead) && row + colorFactor * -2.5 === 3.5) {
    if (isEmpty(board[twoAhead][col])) {
      moves.push(fig + makeField(row, col) + "-" + makeField(twoAhead, col));
    } else if (isBeatable(fig, board[twoAhead][col])) {
      moves.push(fig + makeField(row, col) + "-" + makeField(twoAhead, col));
    }
  }

  // TODO: schräger Schlagzug:

  const diaLeftRow = row + colorFactor * -1;
  const diaLeftCol = col -1;

  const diaRightRow = row + colorFactor * -1;
  const diaRightCol = col + 1;

  if (
    isIndexOnBoard(diaLeftCol, diaLeftRow) &&
    !isEmpty(board[diaLeftRow][diaLeftCol]) &&
    isBeatable(fig, board[diaLeftRow][diaLeftCol])
  ) {
    moves.push(
      fig + makeField(row, col) + "-" + makeField(diaLeftRow, diaLeftCol)
    );
  }

  if (
    isIndexOnBoard(diaRightCol, diaRightRow) &&
    !isEmpty(board[diaRightRow][diaRightCol]) &&
    isBeatable(fig, board[diaRightRow][diaRightCol])
  ) {
    moves.push(
      fig + makeField(row, col) + "-" + makeField(diaRightRow, diaRightCol)
    );
  }


  // TODO: En Passant:
  const passLeftCol = col - 1;
  const passRightCol = col +1;

  if (
    isIndexOnBoard(diaLeftCol, diaLeftRow, passLeftCol) &&
    isEmpty(board[diaLeftRow][diaLeftCol]) &&
    isBeatable(fig, board[row][passLeftCol])
  ) {
    moves.push(
      fig + makeField(row, col) + "-" + makeField(diaLeftRow, diaLeftCol)
    );
  }

  if (
    isIndexOnBoard(diaRightCol, diaRightRow, passRightCol) &&
    isEmpty(board[diaRightRow][diaRightCol]) &&
    isBeatable(fig, board[row][passRightCol])
  ) {
    moves.push(
      fig + makeField(row, col) + "-" + makeField(diaLeftRow, diaLeftCol)
    );
  } 
  
  return moves;
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
