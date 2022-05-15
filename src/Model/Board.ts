import { figType } from "../View/Figure";
import { parseFEN } from "./Parser";
const { BitBoard } = require("bitboards");

export type tableEntry = {
  node?: string;
  upperbound?: number;
  lowerbound?: number;
  age?: number;
};

export class BoardModel {
  FEN: string | undefined;

  isWhiteTurn!: boolean;

  /**
   * KQkq
   * Die Buchstaben, die nicht mehr möglichen Rochaden entsprechen,
   * werden ausgelassen, und der Strich „-“ wird dann und nur dann
   * geschrieben, wenn keine der vier Rochaden mehr möglich ist.
   */
  castleRight!: string;

  /**
   * Sofern im letzten Zug ein Bauer zwei Felder vorgerückt ist,
   * wird das übersprungene Feld angegeben, unabhängig davon,
   * ob ein en-passant-Schlag auf dieses Feld tatsächlich möglich ist oder nicht.
   * Nach Bauer f2–>f4 wird in der FEN in der 4. Gruppe „f3“ angegeben.
   */
  enPassant!: string;

  /**
   * Beginnt mit 0 und wird bei jedem Halbzug, bei dem kein Bauer bewegt
   * oder eine Figur geschlagen wurde, um 1 erhöht.
   * -> 50-Züge-Regel: Remi-Antrag, wenn diese Zahl 100 ist. Remi bei 150.
   */
  halfmoveClock!: number;

  /**
   * Beginnt mit 1 und wird nach jedem Zug von schwarz um 1 erhöht
   */
  fullmoveCount!: number;

  bitBoard: any;

  chessBoard: figType[][] = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ];
  ONE_STRING =
    "0000000000000000000000000000000000000000000000000000000000000001";
  ZERO_STRING =
    "0000000000000000000000000000000000000000000000000000000000000000";
  ONE = new BitBoard(this.ONE_STRING);
  WP = new BitBoard(this.ZERO_STRING);
  WN = new BitBoard(this.ZERO_STRING);
  WB = new BitBoard(this.ZERO_STRING);
  WR = new BitBoard(this.ZERO_STRING);
  WQ = new BitBoard(this.ZERO_STRING);
  WK = new BitBoard(this.ZERO_STRING);
  BP = new BitBoard(this.ZERO_STRING);
  BN = new BitBoard(this.ZERO_STRING);
  BB = new BitBoard(this.ZERO_STRING);
  BR = new BitBoard(this.ZERO_STRING);
  BQ = new BitBoard(this.ZERO_STRING);
  BK = new BitBoard(this.ZERO_STRING);

  //transposition table
  table!: tableEntry[];

  constructor(FEN?: string) {
    // this.FEN = FEN;
    // this.initBoard();
    this.convertArraysToBitboards();
  }
  convertArraysToBitboards() {
    for (let i = 0; i < 64; i++) {
      let b =
        this.ZERO_STRING.substring(i + 1) +
        "1" +
        this.ZERO_STRING.substring(0, i);

      let row = Math.floor(i / 8);
      let col = i % 8;
      switch (this.chessBoard[row][col]) {
        case "P":
          this.WP.xOr(new BitBoard(b), true);
          break;
        case "N":
          this.WN.xOr(new BitBoard(b), true);
          break;
        case "B":
          this.WB.xOr(new BitBoard(b), true);
          break;
        case "R":
          this.WR.xOr(new BitBoard(b), true);
          break;
        case "Q":
          this.WQ.xOr(new BitBoard(b), true);
          break;
        case "K":
          this.WK.xOr(new BitBoard(b), true);
          break;
        case "p":
          this.BP.xOr(new BitBoard(b), true);
          break;
        case "n":
          this.BN.xOr(new BitBoard(b), true);
          break;
        case "b":
          this.BB.xOr(new BitBoard(b), true);
          break;
        case "r":
          this.BR.xOr(new BitBoard(b), true);
          break;
        case "q":
          this.BQ.xOr(new BitBoard(b), true);
          break;
        case "k":
          this.BK.xOr(new BitBoard(b), true);
          break;
      }
    }
  }
  printArray() {
    let newChessBoard: figType[][] = Array.from(Array(8), () => new Array(8));
    for (let i = 0; i < 64; i++) {
      let row = Math.floor(i / 8);
      let col = i % 8;
      newChessBoard[row][col] = "";
    }
    for (let i = 0; i < 64; i++) {
      let row = Math.floor(i / 8);
      let col = i % 8;

      if (
        this.WP.shiftRight(i, false).and(this.ONE, false).toString() ===
        this.ONE.toString()
      ) {
        newChessBoard[row][col] = "P";
      }
      if (
        this.WN.shiftRight(i, false).and(this.ONE, false).toString() ===
        this.ONE.toString()
      )
        newChessBoard[row][col] = "N";
      if (
        this.WB.shiftRight(i, false).and(this.ONE, false).toString() ===
        this.ONE.toString()
      )
        newChessBoard[row][col] = "B";
      if (
        this.WR.shiftRight(i, false).and(this.ONE, false).toString() ===
        this.ONE.toString()
      )
        newChessBoard[row][col] = "R";
      if (
        this.WQ.shiftRight(i, false).and(this.ONE, false).toString() ===
        this.ONE.toString()
      )
        newChessBoard[row][col] = "Q";
      if (
        this.WK.shiftRight(i, false).and(this.ONE, false).toString() ===
        this.ONE.toString()
      )
        newChessBoard[row][col] = "K";
      if (
        this.BP.shiftRight(i, false).and(this.ONE, false).toString() ===
        this.ONE.toString()
      )
        newChessBoard[row][col] = "p";
      if (
        this.BN.shiftRight(i, false).and(this.ONE, false).toString() ===
        this.ONE.toString()
      )
        newChessBoard[row][col] = "n";
      if (
        this.BB.shiftRight(i, false).and(this.ONE, false).toString() ===
        this.ONE.toString()
      )
        newChessBoard[row][col] = "b";
      if (
        this.BR.shiftRight(i, false).and(this.ONE, false).toString() ===
        this.ONE.toString()
      )
        newChessBoard[row][col] = "r";
      if (
        this.BQ.shiftRight(i, false).and(this.ONE, false).toString() ===
        this.ONE.toString()
      )
        newChessBoard[row][col] = "q";
      if (
        this.BK.shiftRight(i, false).and(this.ONE, false).toString() ===
        this.ONE.toString()
      )
        newChessBoard[row][col] = "k";
    }
    console.log(newChessBoard);
  }

  initBoard() {
    if (this.FEN) {
      //todo parseFEN to bitboard
      const splittedFEN = this.FEN.split(/\s+/);
      this.chessBoard = parseFEN(splittedFEN[0]);
      this.isWhiteTurn = splittedFEN[1] === "w";
      this.castleRight = splittedFEN[2];
      this.enPassant = splittedFEN[3];
      this.halfmoveClock = parseInt(splittedFEN[4]);
      this.fullmoveCount = parseInt(splittedFEN[5]);
    }
  }

  moves(): Move[] {
    return [];
  }

  doMove(move: Move) {
    this.updateBoard(move);
    return this;
  }

  pickBestMove() {}

  getNewBoard(move: Move) {
    return new BoardModel("");
  }

  updateBoard(move: Move) {}

  toFEN() {
    return "";
  }
}

export type Move = () => {
  toString: string;
  bitMove: undefined;
  isKingOfTheHill: boolean;
  isCheck: boolean;
  isHit?: boolean;
};

const evaluateBoard = (board: BoardModel) => {
  board;
  return 0;
};

export const alphaBeta = (ab: alphaBetaType): number => {
  const { board, move, depth, isMax, callback } = ab;
  let { alpha, beta } = ab;

  //todo: look if node is already in table
  if (board.table) {
    const objFound = board.table[0];
    if (objFound.lowerbound! >= beta) return objFound.lowerbound!;
    if (objFound.upperbound! <= alpha) return objFound.upperbound!;
    alpha = Math.max(alpha, objFound.lowerbound!);
    beta = Math.min(beta, objFound.upperbound!);
  }
  if (depth === 0) {
    return evaluateBoard(board);
  }
  const newBoard = board.getNewBoard(move);
  let value;
  if (isMax) {
    value = alpha;
    for (const m of newBoard.moves()) {
      const childAB = alphaBeta({
        board: newBoard,
        move: m,
        depth: depth - 1,
        alpha: value,
        beta: beta,
        isMax: !isMax,
        callback: callback,
      });
      value = value > childAB ? value : childAB;
      if (value >= beta) break;
    }
  } else {
    value = beta;
    for (const m of newBoard.moves()) {
      const childAB = alphaBeta({
        board: newBoard,
        move: m,
        depth: depth - 1,
        alpha: alpha,
        beta: value,
        isMax: !isMax,
        callback: callback,
      });
      value = value < childAB ? value : childAB;
      if (value <= alpha) break;
    }
  }
  if (value <= alpha) {
    callback({ upperbound: value });
  }
  if (value > alpha && value < beta) {
    callback({ lowerbound: value, upperbound: value });
  }
  if (value >= beta) {
    callback({ lowerbound: value });
  }
  return value;
};

type alphaBetaType = {
  board: BoardModel;
  move: Move;
  depth: number;
  alpha: number;
  beta: number;
  isMax: boolean;
  callback: (obj: tableEntry) => void;
};
