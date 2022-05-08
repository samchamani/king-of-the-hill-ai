import { gameState } from "../App";
import { figType } from "../View/Figure";
import { moveType } from "./Moves";

export const isWhite = (str: string | figType) => {
  if (isEmpty(str as figType)) {
    console.log("Asked if white or black, but field is empty");
    return;
  }
  return str.toUpperCase() === str;
};

export const isIndexOnBoard = (...nums: number[]) => {
  for (const n of nums) {
    if (!(n >= 0 && n <= 7)) {
      return false;
    }
  }
  return true;
};

export const isEmpty = (fig: figType) => {
  return fig === "";
};

export const isBeatable = (fig1: figType, fig2: figType) => {
  if (isEmpty(fig1) || isEmpty(fig2)) return false;
  return isWhite(fig1) !== isWhite(fig2);
};

export const isKingOfTheHill = (
  state: gameState,
  suppressLog: boolean = false
) => {
  const hills = [
    [3, 3],
    [3, 4],
    [4, 3],
    [4, 4],
  ];

  for (const hill of hills) {
    if (state.board[hill[0]][hill[1]].toUpperCase() === "K") {
      // !suppressLog ? console.log("King of the hill!") : null; //TODO: buggy function call
      return true;
    }
  }
  return false;
};

export function has3SameStr(strs: string[]) {
  for (const str of strs) {
    const has3 = strs.filter((v) => v === str).length >= 3;
    if (has3) console.log("Remis because of threefold repetition");
    return has3;
  }
  return false;
}

export function isCheck(
  newState: gameState,
  isWhiteKing: boolean,
  suppressLog: boolean = false
) {
  const kingsPos = searchFirst(newState, isWhiteKing ? "K" : "k");
  if (kingsPos === undefined || kingsPos.length !== 2) {
    // !suppressLog ? console.log("No king found!!") : null; //TODO: buggy function call
    return;
  }
  return (
    checkDangerLikeL(newState, kingsPos[0], kingsPos[1]) ||
    checkDangerAllDir(newState, kingsPos[0], kingsPos[1])
  );
}

function checkDangerLikeL(state: gameState, row: number, col: number) {
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
}

function checkDangerAllDir(state: gameState, row: number, col: number) {
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
}

function searchFirst(state: gameState, searchFig: figType) {
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
}

export function isMate(
  state: gameState,
  moves: moveType[],
  suppressLog: boolean = true
) {
  const isMateState = isCheck(state, state.isWhiteTurn) && moves.length === 0;
  if (isMateState && !suppressLog)
    console.log(`${state.isWhiteTurn ? "White" : "Black"} is in checkmate!`);
  return isMateState;
}

export function isStaleMate(state: gameState, moves: moveType[]) {
  const isStaleMateState =
    !isCheck(state, state.isWhiteTurn) && moves.length === 0;
  if (isStaleMateState)
    console.log(`${state.isWhiteTurn ? "White" : "Black"} is in stalemate!`);
  return isStaleMateState;
}

export function isHalfmoveRemis(state: gameState) {
  const isRemi = state.halfmoveClock >= 100;
  if (isRemi) console.log(`Remis because of 50-moves-rule!`);
  return isRemi;
}

export function isGameDone(
  state: gameState,
  moves: moveType[],
  stateHistory: string[]
) {
  return (
    isMate(state, moves) ||
    isStaleMate(state, moves) ||
    isHalfmoveRemis(state) ||
    has3SameStr(stateHistory) ||
    isKingOfTheHill(state)
  );
}

export function sortAsWeakHits(moves: moveType[]) {
  return moves.sort((a, b) => {
    if (a.isKingOfTheHillMove && !b.isKingOfTheHillMove) return -1;
    if (a.hitMoveBy === "P" && b.hitMoveBy !== "P") return -1;
    if (a.hitMoveBy === "N" && b.hitMoveBy !== "N") return -1;
    if (a.hitMoveBy === "B" && b.hitMoveBy !== "B") return -1;
    if (a.hitMoveBy === "R" && b.hitMoveBy !== "R") return -1;
    if (a.hitMoveBy === "Q" && b.hitMoveBy !== "Q") return -1;
    if (a.hitMoveBy === "K" && b.hitMoveBy !== "K") return -1;
    if (a.hitMoveBy === "" && b.hitMoveBy !== "") return 1;
    return 0;
  });
}
