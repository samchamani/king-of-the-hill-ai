import { gameState } from "../App";
import { figType } from "../View/Figure";
import { isIndexOnBoard, isWhite, isEmpty, isBeatable } from "./Utils";
import { makeField, makeIndex } from "./Parser";
import { evaluateBoard } from "./Evaluater";

export type moveType = {
  move: string;
  newState: gameState;
  value: number;
  // isMateMove: boolean
};

export const getMoves = (state: gameState) => {
  let moves: moveType[] = [];
  for (const row in state.board) {
    for (const col in state.board[row]) {
      const fig = state.board[row][col];
      if (!isEmpty(fig)) {
        if (state.isWhiteTurn === isWhite(fig))
          moves = [...moves, ...getMovesFor(state, [row, col])];
      }
    }
  }
  return moves;
};

const getMovesFor = (state: gameState, [row, col]: [string, string]) => {
  const rowNum = parseInt(row);
  const colNum = parseInt(col);
  const fig = state.board[rowNum][colNum].toUpperCase();
  let moves: moveType[] = [];
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
  let moves: moveType[] = [];
  const board = state.board;
  const fig = board[row][col];
  const colorFactor = isWhite(fig) ? -1 : 1;

  // 1 Step vor:
  const oneAhead = row + colorFactor;
  if (isIndexOnBoard(oneAhead) && isEmpty(board[oneAhead][col])) {
    moves.push(
      createMove(
        fig,
        state,
        // updateState(state, {
        //   moveFrom: [row, col],
        //   moveTo: [oneAhead, col],
        // }),
        row,
        col,
        oneAhead,
        col
      )
    );
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
    moves.push(createMove(fig, state, row, col, twoAhead, col));
  }

  // schräger Schlagzug + en Passant:
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
    moves.push(createMove(fig, state, row, col, diaLeftRow, diaLeftCol, true));
  } else if (
    isEnPass &&
    isIndexOnBoard(diaLeftCol, diaLeftRow) &&
    isEmpty(board[diaLeftRow][diaLeftCol]) &&
    isBeatable(fig, board[row][enPasCol]) &&
    diaLeftRow === enPasRow &&
    diaLeftCol === enPasCol
  ) {
    moves.push(createMove(fig, state, row, col, diaLeftRow, diaLeftCol, true));
  }
  if (
    isIndexOnBoard(diaRightCol, diaRightRow) &&
    !isEmpty(board[diaRightRow][diaRightCol]) &&
    isBeatable(fig, board[diaRightRow][diaRightCol])
  ) {
    moves.push(
      createMove(fig, state, row, col, diaRightRow, diaRightCol, true)
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
      createMove(fig, state, row, col, diaRightRow, diaRightCol, true)
    );
  }
  return moves;

  //TODO: Bauer in letzter Gegnerreihe => Umwandlung in beliebigen Stein: wie notieren?
};

const getMovesB = (state: gameState, [row, col]: [number, number]) => {
  return [
    ...getAllMovesInDir(1, 1, row, col, state),
    ...getAllMovesInDir(1, -1, row, col, state),
    ...getAllMovesInDir(-1, 1, row, col, state),
    ...getAllMovesInDir(-1, -1, row, col, state),
  ];
};

const getMovesN = (state: gameState, [row, col]: [number, number]) => {
  return getMovesLikeL(row, col, state);
};

//TODO: Rochade
const getMovesR = (state: gameState, [row, col]: [number, number]) => {
  return [
    ...getAllMovesInDir(1, 0, row, col, state),
    ...getAllMovesInDir(-1, 0, row, col, state),
    ...getAllMovesInDir(0, 1, row, col, state),
    ...getAllMovesInDir(0, -1, row, col, state),
  ];
};

const getMovesQ = (state: gameState, [row, col]: [number, number]) => {
  return [
    ...getAllMovesInDir(1, 1, row, col, state),
    ...getAllMovesInDir(1, -1, row, col, state),
    ...getAllMovesInDir(-1, 1, row, col, state),
    ...getAllMovesInDir(-1, -1, row, col, state),
    ...getAllMovesInDir(1, 0, row, col, state),
    ...getAllMovesInDir(-1, 0, row, col, state),
    ...getAllMovesInDir(0, 1, row, col, state),
    ...getAllMovesInDir(0, -1, row, col, state),
  ];
};

const getMovesK = (state: gameState, [row, col]: [number, number]) => {
  let moves: moveType[] = [];
  const board = state.board;
  const fig = board[row][col];

  const getMovesHelper = (newRow: number, newCol: number) => {
    if (isIndexOnBoard(newRow, newCol)) {
      if (isEmpty(board[newRow][newCol])) {
        moves.push(createMove(fig, state, row, col, newRow, newCol));
      } else if (isBeatable(fig, board[newRow][newCol])) {
        moves.push(createMove(fig, state, row, col, newRow, newCol, true));
      }
    }
  };

  //move up
  const upRow = row - 1;
  const rightCol = col + 1;
  const leftCol = col - 1;
  const downRow = row + 1;
  getMovesHelper(upRow, col);

  //move up right
  getMovesHelper(upRow, rightCol);

  //move up left
  getMovesHelper(upRow, leftCol);

  //move right
  getMovesHelper(row, rightCol);

  //move left
  getMovesHelper(row, leftCol);

  //move down
  getMovesHelper(downRow, col);

  // move down right
  getMovesHelper(downRow, rightCol);

  //move down left
  getMovesHelper(downRow, leftCol);

  return moves;
};

/**
 * Get all moves in a given direction
 * @param xDir should be 1 (=right), -1 (=left) or 0 (=stays on row)
 * @param yDir should be 1 (=up), -1 (=down) or 0 (=stays on col)
 * @param row
 * @param col
 * @param state
 * @returns
 */
const getAllMovesInDir = (
  xDir: number,
  yDir: number,
  row: number,
  col: number,
  state: gameState
) => {
  let moves: moveType[] = [];
  let x = 1;
  let y = 1;
  const board = state.board;
  const fig = board[row][col];
  const isW = isWhite(fig);
  while (
    isIndexOnBoard(col + xDir * x, row + yDir * y) &&
    isEmpty(board[row + yDir * y][col + xDir * x])
  ) {
    moves.push(
      createMove(fig, state, row, col, row + yDir * y, col + xDir * x)
    );
    x += 1;
    y += 1;
  }
  if (
    isIndexOnBoard(col + xDir * x, row + yDir * y) &&
    isBeatable(fig, board[row + yDir * y][col + xDir * x])
  ) {
    moves.push(
      createMove(fig, state, row, col, row + yDir * y, col + xDir * x, true)
    );
  }
  return moves;
};

const getMovesLikeL = (row: number, col: number, state: gameState) => {
  let moves: moveType[] = [];
  const board = state.board;
  const fig = board[row][col];
  const nextPos = [
    [row - 2, col - 1],
    [row - 2, col + 1],
    [row + 2, col - 1],
    [row + 2, col + 1],
    [row - 1, col + 2],
    [row + 1, col + 2],
    [row - 1, col - 2],
    [row + 1, col - 2],
  ];
  for (const pos of nextPos) {
    const newRow = pos[0];
    const newCol = pos[1];
    if (isIndexOnBoard(newRow, newCol)) {
      if (isEmpty(board[newRow][newCol])) {
        moves.push(createMove(fig, state, row, col, newRow, newCol));
      } else if (isBeatable(fig, board[newRow][newCol])) {
        moves.push(createMove(fig, state, row, col, newRow, newCol, true));
      }
    }
  }
  return moves;
};

const isMate = (state: gameState, isWhiteKing: boolean) => {
  const kingsPos = searchFirst(state, isWhiteKing ? "K" : "k");
  if (kingsPos === undefined || kingsPos.length !== 2) {
    console.log("No king found!!");
    return;
  }
  return checkDanger(kingsPos[0], kingsPos[1], state);
};

const checkDanger = (row: number, col: number, state: gameState) => {
  return (
    checkDangerLikeL(row, col, state) || checkDangerAllDir(row, col, state)
  );
};

const checkDangerLikeL = (row: number, col: number, state: gameState) => {
  const board = state.board;
  const fig = board[row][col];
  const nextPos = [
    [row - 2, col - 1],
    [row - 2, col + 1],
    [row + 2, col - 1],
    [row + 2, col + 1],
    [row - 1, col + 2],
    [row + 1, col + 2],
    [row - 1, col - 2],
    [row + 1, col - 2],
  ];
  for (const pos of nextPos) {
    const newRow = pos[0];
    const newCol = pos[1];
    if (
      isIndexOnBoard(newRow, newCol) &&
      isBeatable(fig, board[newRow][newCol]) &&
      fig.toUpperCase() === "N"
    ) {
      return true;
    }
  }
  return false;
};

const checkDangerAllDir = (row: number, col: number, state: gameState) => {
  const allDir = [
    {
      xDir: 1,
      yDir: 1,
      dangerFrom: "QB",
      pawnDanger: true,
    },
    {
      xDir: 1,
      yDir: -1,
      dangerFrom: "QB",
      pawnDanger: true,
    },
    {
      xDir: -1,
      yDir: 1,
      dangerFrom: "QB",
      pawnDanger: true,
    },
    {
      xDir: -1,
      yDir: -1,
      dangerFrom: "QB",
      pawnDanger: true,
    },
    {
      xDir: 1,
      yDir: 0,
      dangerFrom: "QR",
      pawnDanger: false,
    },
    {
      xDir: 0,
      yDir: 1,
      dangerFrom: "QR",
      pawnDanger: false,
    },
    {
      xDir: -1,
      yDir: 0,
      dangerFrom: "QR",
      pawnDanger: false,
    },
    {
      xDir: 0,
      yDir: -1,
      dangerFrom: "QR",
      pawnDanger: false,
    },
  ];
  const board = state.board;
  const fig = board[row][col];
  for (const dir of allDir) {
    let x = 1;
    let y = 1;
    while (
      isIndexOnBoard(col + dir.xDir * x, row + dir.yDir * y) &&
      isEmpty(board[row + dir.yDir * y][col + dir.xDir * x])
    ) {
      x += 1;
      y += 1;
    }
    if (
      isIndexOnBoard(col + dir.xDir * x, row + dir.yDir * y) &&
      isBeatable(fig, board[row + dir.yDir * y][col + dir.xDir * x]) &&
      (dir.dangerFrom.includes(
        board[row + dir.yDir * y][col + dir.xDir * x].toUpperCase()
      ) ||
        (x === 1 && y === 1 && dir.pawnDanger))
    ) {
      return true;
    }
  }
  return false;
};

const searchFirst = (state: gameState, searchFig: figType) => {
  const fig = searchFig;
  const board = state.board;
  let figsPos = [];
  for (const row in board) {
    for (const col in board[row]) {
      if (board[row][col] === fig) {
        figsPos.push(parseInt(row), parseInt(col));
        return figsPos;
      }
    }
  }
};

const createMove = (
  fig: figType,
  state: gameState,
  row: number,
  col: number,
  toRow: number,
  toCol: number,
  isHit: boolean = false
) => {
  const move: moveType = {
    move:
      fig + makeField(row, col) + (isHit ? "x" : "-") + makeField(toRow, toCol),
    newState: state, //TODO: generate newState
    value: evaluateBoard(
      state.board,
      isWhite(state.board[row][col]) as boolean
    ),
  };
  return move;
};

const updateState = (
  state: gameState,
  options: {
    moveFrom: number[]; //[row,col]
    moveTo: number[]; //[toRow,toCol]
    didPWalk2?: boolean;
    didEnPassKill?: boolean;
    didLongCastle?: boolean;
    didShortCastle?: boolean;
    didPawnMoveOrAnyDie?: boolean;
  }
) => {
  const fig = state.board[options.moveFrom[0]][options.moveFrom[1]];
  const isW = isWhite(fig);
  const colorFactor = isW ? -1 : 1;
  let newBoard = Object.assign(state.board);
  let usedCastle = "";
  newBoard[options.moveFrom[0]][options.moveFrom[1]] = "";
  newBoard[options.moveTo[0]][options.moveTo[1]] = fig;
  if (options.didEnPassKill)
    newBoard[options.moveTo[0] - 1 * colorFactor][options.moveTo[1]] = "";
  if (options.didLongCastle) {
    isW
      ? (newBoard[options.moveTo[0]][2] = "R")
      : (newBoard[options.moveTo[0]][2] = "r");
    newBoard[options.moveTo[0]][0] = "";
    usedCastle = isW ? "Q" : "q";
  }
  if (options.didShortCastle) {
    isW
      ? (newBoard[options.moveTo[0]][5] = "R")
      : (newBoard[options.moveTo[0]][5] = "r");
    newBoard[options.moveTo[0]][7] = "";
    usedCastle = isW ? "K" : "k";
  }
  let newCastleRight =
    usedCastle !== ""
      ? state.castleRight.replace(usedCastle, "")
      : state.castleRight;
  const newState: gameState = {
    board: newBoard,
    isWhiteTurn: !state.isWhiteTurn,
    castleRight: newCastleRight === "" ? "-" : newCastleRight,
    enPassant: options.didPWalk2
      ? newBoard[options.moveTo[0] + 1 * colorFactor][options.moveTo[1]]
      : "-",
    halfmoveClock: options.didPawnMoveOrAnyDie ? 0 : state.halfmoveClock + 1,
    fullmoveCount: isW ? state.fullmoveCount : state.fullmoveCount + 1,
  };
  return newState;
};
