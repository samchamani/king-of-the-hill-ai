import { gameState } from "./State";
import { figType } from "../View/Figure";
import { isIndexOnBoard, isWhite, isEmpty, isBeatable, isCheck } from "./Utils";
import { makeField, makeIndex } from "./Parser";

export type moveType = {
  move: string;
  newState: gameState;
  value?: number;
  isCheckMove: boolean | undefined;
  isKingOfTheHillMove: boolean;
  hitMoveBy: string;
};

/**
 * class that creates a list of all possible moves from a given state
 */
export class Moves {
  state: gameState;
  value: number | undefined;
  moves: moveType[];

  constructor(state: gameState) {
    this.state = state;
    this.moves = this.getMoves();
  }

  setValue(val: number) {
    this.value = val;
  }

  getMoves() {
    let moves: moveType[] = [];
    for (const row in this.state.board) {
      for (const col in this.state.board[row]) {
        const fig = this.state.board[row][col];
        if (!isEmpty(fig)) {
          if (this.state.isWhiteTurn === isWhite(fig)) moves = [...moves, ...this.getMovesFor([row, col])];
        }
      }
    }
    return moves.filter((o) => !o.isCheckMove);
  }

  getMovesFor([row, col]: [string, string]) {
    const rowNum = parseInt(row);
    const colNum = parseInt(col);
    const fig = this.state.board[rowNum][colNum].toUpperCase();
    let moves: moveType[] = [];
    switch (fig) {
      case "P":
        moves = [...moves, ...this.getMovesP([rowNum, colNum])];
        break;
      case "N":
        moves = [...moves, ...this.getMovesN([rowNum, colNum])];
        break;
      case "B":
        moves = [...moves, ...this.getMovesB([rowNum, colNum])];
        break;
      case "R":
        moves = [...moves, ...this.getMovesR([rowNum, colNum])];
        break;
      case "Q":
        moves = [...moves, ...this.getMovesQ([rowNum, colNum])];
        break;
      case "K":
        moves = [...moves, ...this.getMovesK([rowNum, colNum])];
        break;
    }
    return moves;
  }

  getMovesP([row, col]: [number, number]) {
    let moves: moveType[] = [];
    const board = this.state.board;
    const fig = board[row][col];
    const colorFactor = isWhite(fig) ? -1 : 1;
    const doPromotion = (toRow: number, toCol: number, isHit: boolean) => {
      const promos = ["Q", "R", "B", "N"];
      for (const promo of promos) {
        moves.push(
          this.createMove({
            moveFrom: [row, col],
            moveTo: [toRow, toCol],
            isHit: isHit,
            promotionAs: promo as "Q" | "R" | "B" | "N" | undefined,
          })
        );
      }
    };
    // 1 Step vor:
    const oneAhead = row + colorFactor;
    if (isIndexOnBoard(oneAhead) && isEmpty(board[oneAhead][col])) {
      oneAhead === 0 || oneAhead === 7
        ? doPromotion(oneAhead, col, false)
        : moves.push(
            this.createMove({
              moveFrom: [row, col],
              moveTo: [oneAhead, col],
            })
          );
    }

    // 2 Step vor aus Startposition:
    const twoAhead = row + colorFactor * 2;
    const isStartPos = row + colorFactor * 2.5 === 3.5;
    if (isStartPos && isEmpty(board[twoAhead][col]) && isEmpty(board[oneAhead][col])) {
      moves.push(
        this.createMove({
          moveFrom: [row, col],
          moveTo: [twoAhead, col],
          didPWalk2: true,
        })
      );
    }

    // schräger Schlagzug + en Passant:
    const diaLeftRow = row + colorFactor * 1;
    const diaLeftCol = col - 1;

    const diaRightRow = row + colorFactor * 1;
    const diaRightCol = col + 1;

    const isEnPass = this.state.enPassant !== "-";
    const [enPasRow, enPasCol]: number[] = makeIndex(this.state.enPassant);

    if (isIndexOnBoard(diaLeftCol, diaLeftRow) && !isEmpty(board[diaLeftRow][diaLeftCol]) && isBeatable(fig, board[diaLeftRow][diaLeftCol])) {
      oneAhead === 0 || oneAhead === 7
        ? doPromotion(diaLeftRow, diaLeftCol, true)
        : moves.push(
            this.createMove({
              moveFrom: [row, col],
              moveTo: [diaLeftRow, diaLeftCol],
              isHit: true,
            })
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
        this.createMove({
          moveFrom: [row, col],
          moveTo: [diaLeftRow, diaLeftCol],
          isHit: true,
          didEnPassKill: true,
        })
      );
    }
    if (isIndexOnBoard(diaRightCol, diaRightRow) && !isEmpty(board[diaRightRow][diaRightCol]) && isBeatable(fig, board[diaRightRow][diaRightCol])) {
      oneAhead === 0 || oneAhead === 7
        ? doPromotion(diaRightRow, diaRightCol, true)
        : moves.push(
            this.createMove({
              moveFrom: [row, col],
              moveTo: [diaRightRow, diaRightCol],
              isHit: true,
            })
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
        this.createMove({
          moveFrom: [row, col],
          moveTo: [diaRightRow, diaRightCol],
          isHit: true,
          didEnPassKill: true,
        })
      );
    }
    return moves;

    //TODO: Check if Promotion Notation is correct
    // If special notation needed then parser needs to be changed too
  }

  getMovesB([row, col]: [number, number]) {
    return [
      ...this.getAllMovesInDir({ moveTo: [1, 1], moveFrom: [row, col] }),
      ...this.getAllMovesInDir({ moveTo: [1, -1], moveFrom: [row, col] }),
      ...this.getAllMovesInDir({ moveTo: [-1, 1], moveFrom: [row, col] }),
      ...this.getAllMovesInDir({ moveTo: [-1, -1], moveFrom: [row, col] }),
    ];
  }

  getMovesN([row, col]: [number, number]) {
    return this.getMovesLikeL(row, col);
  }

  getMovesR([row, col]: [number, number]) {
    const board = this.state.board;
    const isW = isWhite(board[row][col]);
    const longCastle = isW ? "Q" : "q";
    const shortCastle = isW ? "K" : "k";
    let lostLongCastle = false;
    let lostShortCastle = false;
    if (col === 0 && this.state.castleRight.includes(longCastle)) lostLongCastle = true;
    if (col === 7 && this.state.castleRight.includes(shortCastle)) lostShortCastle = true;
    return [
      ...this.getAllMovesInDir({
        moveTo: [1, 0],
        moveFrom: [row, col],
        lostLongCastle: lostLongCastle,
        lostShortCastle: lostShortCastle,
      }),
      ...this.getAllMovesInDir({
        moveTo: [-1, 0],
        moveFrom: [row, col],
        lostLongCastle: lostLongCastle,
        lostShortCastle: lostShortCastle,
      }),
      ...this.getAllMovesInDir({
        moveTo: [0, 1],
        moveFrom: [row, col],
        lostLongCastle: lostLongCastle,
        lostShortCastle: lostShortCastle,
      }),
      ...this.getAllMovesInDir({
        moveTo: [0, -1],
        moveFrom: [row, col],
        lostLongCastle: lostLongCastle,
        lostShortCastle: lostShortCastle,
      }),
    ];
  }

  getMovesQ([row, col]: [number, number]) {
    return [
      ...this.getAllMovesInDir({ moveTo: [1, 1], moveFrom: [row, col] }),
      ...this.getAllMovesInDir({ moveTo: [1, -1], moveFrom: [row, col] }),
      ...this.getAllMovesInDir({ moveTo: [-1, 1], moveFrom: [row, col] }),
      ...this.getAllMovesInDir({ moveTo: [-1, -1], moveFrom: [row, col] }),
      ...this.getAllMovesInDir({ moveTo: [1, 0], moveFrom: [row, col] }),
      ...this.getAllMovesInDir({ moveTo: [-1, 0], moveFrom: [row, col] }),
      ...this.getAllMovesInDir({ moveTo: [0, 1], moveFrom: [row, col] }),
      ...this.getAllMovesInDir({ moveTo: [0, -1], moveFrom: [row, col] }),
    ];
  }

  getMovesK([row, col]: [number, number]) {
    let moves: moveType[] = [];

    const upRow = row - 1;
    const rightCol = col + 1;
    const leftCol = col - 1;
    const downRow = row + 1;
    const nextPos = [
      [upRow, col],
      [upRow, rightCol],
      [upRow, leftCol],
      [row, rightCol],
      [row, leftCol],
      [downRow, col],
      [downRow, rightCol],
      [downRow, leftCol],
    ];

    const board = this.state.board;
    const isW = isWhite(board[row][col]);
    const longCastle = isW ? "Q" : "q";
    const shortCastle = isW ? "K" : "k";
    const canLongCastle = this.state.castleRight.includes(longCastle);
    const canShortCastle = this.state.castleRight.includes(shortCastle);
    const isNotCheck = !isCheck(this.state, isW as boolean);

    for (const pos of nextPos) {
      const newMove = this.getMovesHelper({
        moveFrom: [row, col],
        moveTo: [pos[0], pos[1]],
        lostLongCastle: canLongCastle,
        lostShortCastle: canShortCastle,
      });
      !!newMove ? moves.push(newMove) : null;
    }

    if (canShortCastle && board[row][5] === "" && board[row][6] === "" && isNotCheck)
      moves.push(
        this.createMove({
          moveFrom: [row, col],
          moveTo: [row, 6],
          didShortCastle: true,
        })
      );

    if (canLongCastle && board[row][1] === "" && board[row][2] === "" && board[row][3] === "" && isNotCheck)
      moves.push(
        this.createMove({
          moveFrom: [row, col],
          moveTo: [row, 2],
          didLongCastle: true,
        })
      );

    return moves;
  }

  getMovesHelper = (options: moveOptions) => {
    const [newRow, newCol] = options.moveTo;
    const [row, col] = options.moveFrom;
    if (isIndexOnBoard(newRow, newCol)) {
      if (isEmpty(this.state.board[newRow][newCol])) {
        return this.createMove(options);
      } else if (isBeatable(this.state.board[row][col], this.state.board[newRow][newCol])) {
        return this.createMove({
          ...options,
          isHit: true,
          isKingOfTheHillMove: isKingOnTheHill(this.state.board[row][col], newRow, newCol),
        });
      }
    }
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
  getAllMovesInDir(options: moveOptions) {
    let moves: moveType[] = [];
    let x = 1;
    let y = 1;
    const [row, col] = options.moveFrom;
    const [xDir, yDir] = options.moveTo;
    const board = this.state.board;
    const fig = board[row][col];
    while (isIndexOnBoard(col + xDir * x, row + yDir * y) && isEmpty(board[row + yDir * y][col + xDir * x])) {
      moves.push(
        this.createMove(
          Object.assign({}, options, {
            moveFrom: [row, col],
            moveTo: [row + yDir * y, col + xDir * x],
          })
        )
      );
      x += 1;
      y += 1;
    }
    if (isIndexOnBoard(col + xDir * x, row + yDir * y) && isBeatable(fig, board[row + yDir * y][col + xDir * x])) {
      moves.push(
        this.createMove(
          Object.assign({}, options, {
            moveFrom: [row, col],
            moveTo: [row + yDir * y, col + xDir * x],
            isHit: true,
          })
        )
      );
    }
    return moves;
  }

  getMovesLikeL(row: number, col: number) {
    let moves: moveType[] = [];
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
      const newMove = this.getMovesHelper({
        moveFrom: [row, col],
        moveTo: [newRow, newCol],
      });
      newMove ? moves.push(newMove) : null;
    }
    return moves;
  }

  createMove(
    options: moveOptions & {
      isHit?: boolean;
      isKingOfTheHillMove?: boolean;
    }
  ) {
    const [row, col] = options.moveFrom;
    const [toRow, toCol] = options.moveTo;
    const updatedState = this.updateState(options);
    const isW = isWhite(this.state.board[row][col]) as boolean;
    const fig = this.state.board[row][col];
    const move: moveType = {
      move: fig + makeField(row, col) + (options.isHit ? "x" : "-") + makeField(toRow, toCol),
      newState: updatedState,
      // value: evaluateBoard(updatedState, isW),
      isCheckMove: isCheck(updatedState, isW),
      isKingOfTheHillMove: !!options.isKingOfTheHillMove,
      hitMoveBy: options.isHit ? fig.toUpperCase() : "",
    };
    return move;
  }

  updateState(options: moveOptions) {
    const fig = this.state.board[options.moveFrom[0]][options.moveFrom[1]];
    const isW = isWhite(fig);
    const colorFactor = isW ? -1 : 1;
    let newBoard = JSON.parse(JSON.stringify(this.state.board)); //TODO: Better way to create deep copy?
    let usedCastle = "";
    newBoard[options.moveFrom[0]][options.moveFrom[1]] = "";
    newBoard[options.moveTo[0]][options.moveTo[1]] = fig;
    if (options.didEnPassKill) newBoard[options.moveTo[0] - 1 * colorFactor][options.moveTo[1]] = "";
    if (options.promotionAs) {
      newBoard[options.moveTo[0]][options.moveTo[1]] = isW ? options.promotionAs : options.promotionAs.toLowerCase();
    }
    if (options.didLongCastle) {
      isW ? (newBoard[options.moveTo[0]][3] = "R") : (newBoard[options.moveTo[0]][3] = "r");
      newBoard[options.moveTo[0]][0] = "";
      usedCastle = isW ? "QK" : "qk";
    }
    if (options.didShortCastle) {
      isW ? (newBoard[options.moveTo[0]][5] = "R") : (newBoard[options.moveTo[0]][5] = "r");
      newBoard[options.moveTo[0]][7] = "";
      usedCastle = isW ? "KQ" : "kq";
    }
    if (options.lostLongCastle) usedCastle = isW ? "Q" : "q";
    if (options.lostShortCastle) usedCastle += isW ? "K" : "k";
    let newCastleRight = this.state.castleRight;
    if (usedCastle !== "") {
      [...usedCastle].forEach((l) => {
        newCastleRight = newCastleRight.replace(l, "");
      });
    }
    const newState: gameState = {
      board: newBoard,
      isWhiteTurn: !this.state.isWhiteTurn,
      castleRight: newCastleRight === "" ? "-" : newCastleRight,
      enPassant: options.didPWalk2 ? makeField(options.moveTo[0] - 1 * colorFactor, options.moveTo[1]) : "-",
      halfmoveClock: options.didPawnMoveOrAnyDie ? 0 : this.state.halfmoveClock + 1,
      fullmoveCount: isW ? this.state.fullmoveCount : this.state.fullmoveCount + 1,
    };
    return newState;
  }
}

export function isKingOnTheHill(fig: figType, row: number, col: number) {
  if (fig.toUpperCase() === "K") {
    return (row === 3 || row === 4) && (col === 3 || col === 4);
  }
  return false;
}

export interface moveOptions {
  moveFrom: number[]; //[row,col]
  moveTo: number[]; //[toRow,toCol]
  didPWalk2?: boolean;
  didEnPassKill?: boolean;
  didLongCastle?: boolean;
  didShortCastle?: boolean;
  lostLongCastle?: boolean;
  lostShortCastle?: boolean;
  didPawnMoveOrAnyDie?: boolean;
  promotionAs?: "Q" | "R" | "B" | "N";
}
