import { figType } from "../View/Figure";
import { makeField, parseFEN } from "./Parser";
const { BitBoard } = require("bitboards");

export type tableEntry = {
  node?: string;
  upperbound?: number;
  lowerbound?: number;
  age?: number;
};

export class BoardModel {
  FEN: string | undefined;

  isWhiteTurn: boolean = true;

  /**
   * KQkq
   * Die Buchstaben, die nicht mehr möglichen Rochaden entsprechen,
   * werden ausgelassen, und der Strich „-“ wird dann und nur dann
   * geschrieben, wenn keine der vier Rochaden mehr möglich ist.
   */
  castleRight: string = "KQkq";

  /**
   * Sofern im letzten Zug ein Bauer zwei Felder vorgerückt ist,
   * wird das übersprungene Feld angegeben, unabhängig davon,
   * ob ein en-passant-Schlag auf dieses Feld tatsächlich möglich ist oder nicht.
   * Nach Bauer f2–>f4 wird in der FEN in der 4. Gruppe „f3“ angegeben.
   */
  enPassant: string = "-";

  /**
   * Beginnt mit 0 und wird bei jedem Halbzug, bei dem kein Bauer bewegt
   * oder eine Figur geschlagen wurde, um 1 erhöht.
   * -> 50-Züge-Regel: Remi-Antrag, wenn diese Zahl 100 ist. Remi bei 150.
   */
  halfmoveClock: number = 0;

  /**
   * Beginnt mit 1 und wird nach jedem Zug von schwarz um 1 erhöht
   */
  fullmoveCount: number = 1;

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

  RANK_1 = new BitBoard(
    "1111111100000000000000000000000000000000000000000000000000000000"
  );
  RANK_2 = new BitBoard(
    "0000000011111111000000000000000000000000000000000000000000000000"
  );
  RANK_3 = new BitBoard(
    "0000000000000000111111110000000000000000000000000000000000000000"
  );
  RANK_4 = new BitBoard(
    "0000000000000000000000001111111100000000000000000000000000000000"
  );
  RANK_5 = new BitBoard(
    "0000000000000000000000000000000011111111000000000000000000000000"
  );
  RANK_6 = new BitBoard(
    "0000000000000000000000000000000000000000111111110000000000000000"
  );
  RANK_7 = new BitBoard(
    "0000000000000000000000000000000000000000000000001111111100000000"
  );
  RANK_8 = new BitBoard(
    "0000000000000000000000000000000000000000000000000000000011111111"
  );
  RANK_A = new BitBoard(
    "1000000010000000100000001000000010000000100000001000000010000000"
  );
  RANK_B = new BitBoard(
    "0100000001000000010000000100000001000000010000000100000001000000"
  );
  RANK_C = new BitBoard(
    "0010000000100000001000000010000000100000001000000010000000100000"
  );
  RANK_D = new BitBoard(
    "0001000000010000000100000001000000010000000100000001000000010000"
  );
  RANK_E = new BitBoard(
    "0000100000001000000010000000100000001000000010000000100000001000"
  );
  RANK_F = new BitBoard(
    "0000010000000100000001000000010000000100000001000000010000000100"
  );
  RANK_G = new BitBoard(
    "0000001000000010000000100000001000000010000000100000001000000010"
  );
  RANK_H = new BitBoard(
    "0000000100000001000000010000000100000001000000010000000100000001"
  );

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

  NOT_WHITE_PIECES = new BitBoard(this.ZERO_STRING);
  BLACK_PIECES = new BitBoard(this.ZERO_STRING);
  EMPTY = new BitBoard(this.ZERO_STRING);

  //transposition table
  table!: tableEntry[];

  constructor(FEN?: string) {
    this.FEN = FEN;
    this.initBoard();
    this.convertArraysToBitboards();
  }

  initBoard() {
    if (this.FEN) {
      const splittedFEN = this.FEN.split(/\s+/);
      this.chessBoard = parseFEN(splittedFEN[0]);
      this.isWhiteTurn = splittedFEN[1] === "w";
      this.castleRight = splittedFEN[2];
      this.enPassant = splittedFEN[3];
      this.halfmoveClock = parseInt(splittedFEN[4]);
      this.fullmoveCount = parseInt(splittedFEN[5]);
    }
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

  getMovesW() {
    //including black king, because he can't be eaten
    this.NOT_WHITE_PIECES.or(this.WP, true)
      .or(this.WN, true)
      .or(this.WB, true)
      .or(this.WR, true)
      .or(this.WQ, true)
      .or(this.WK, true)
      .or(this.BK, true)
      .not(true);

    //same here
    this.BLACK_PIECES.or(this.BP, true)
      .or(this.BN, true)
      .or(this.BB, true)
      .or(this.BR, true)
      .or(this.BQ, true);

    //board with empty fields
    this.EMPTY.or(this.WP, true)
      .or(this.WN, true)
      .or(this.WB, true)
      .or(this.WR, true)
      .or(this.WQ, true)
      .or(this.WK, true)
      .or(this.BP, true)
      .or(this.BN, true)
      .or(this.BB, true)
      .or(this.BR, true)
      .or(this.BQ, true)
      .or(this.BK, true)
      .not(true);

    console.log(this.getMovesWP());
  }

  getMovesWP() {
    let moves = [];

    //beat right
    let PAWN_MOVES = this.WP.copy()
      .shiftRight(7, true)
      .and(this.BLACK_PIECES, true)
      .and(this.RANK_1.not(), true)
      .and(this.RANK_A.not(), true);
    for (let i = 0; i < 64; i++) {
      if (PAWN_MOVES.shiftRight(i).and(this.ONE).getIndex(0) === 1) {
        moves.push(
          makeField(Math.floor(i / 8) + 1, (i % 8) - 1) +
            "x" +
            makeField(Math.floor(i / 8), i % 8)
        );
      }
    }

    //beat left
    PAWN_MOVES = this.WP.copy()
      .shiftRight(9, true)
      .and(this.BLACK_PIECES, true)
      .and(this.RANK_1.not(), true)
      .and(this.RANK_H.not(), true);
    for (let i = 0; i < 64; i++) {
      if (PAWN_MOVES.shiftRight(i).and(this.ONE).getIndex(0) === 1) {
        moves.push(
          makeField(Math.floor(i / 8) + 1, (i % 8) + 1) +
            "x" +
            makeField(Math.floor(i / 8), i % 8)
        );
      }
    }

    //move 1 forward
    PAWN_MOVES = this.WP.copy()
      .shiftRight(8, true)
      .and(this.EMPTY, true)
      .and(this.RANK_1.not(), true);
    for (let i = 0; i < 64; i++) {
      if (PAWN_MOVES.shiftRight(i).and(this.ONE).getIndex(0) === 1) {
        moves.push(
          makeField(Math.floor(i / 8) + 1, i % 8) +
            "-" +
            makeField(Math.floor(i / 8), i % 8)
        );
      }
    }

    //move 2 forward
    PAWN_MOVES = this.WP.copy()
      .shiftRight(16, true)
      .and(this.EMPTY, true)
      .and(this.EMPTY.shiftRight(8), true)
      .and(this.RANK_4, true);
    for (let i = 0; i < 64; i++) {
      if (PAWN_MOVES.shiftRight(i).and(this.ONE).getIndex(0) === 1) {
        moves.push(
          makeField(Math.floor(i / 8) + 2, i % 8) +
            "-" +
            makeField(Math.floor(i / 8), i % 8)
        );
      }
    }
    return moves;
  }

  printArray() {
    //create new empty board
    let newChessBoard: figType[][] = Array.from(Array(8), () => new Array(8));
    for (let i = 0; i < 64; i++) {
      let row = Math.floor(i / 8);
      let col = i % 8;
      newChessBoard[row][col] = "";
    }

    //get the right figures for the board from bitboards
    for (let i = 0; i < 64; i++) {
      let row = Math.floor(i / 8);
      let col = i % 8;

      if (this.WP.shiftRight(i).and(this.ONE).getIndex(0) === 1)
        newChessBoard[row][col] = "P";
      if (this.WN.shiftRight(i).and(this.ONE).getIndex(0) === 1)
        newChessBoard[row][col] = "N";
      if (this.WB.shiftRight(i).and(this.ONE).getIndex(0) === 1)
        newChessBoard[row][col] = "B";
      if (this.WR.shiftRight(i).and(this.ONE).getIndex(0) === 1)
        newChessBoard[row][col] = "R";
      if (this.WQ.shiftRight(i).and(this.ONE).getIndex(0) === 1)
        newChessBoard[row][col] = "Q";
      if (this.WK.shiftRight(i).and(this.ONE).getIndex(0) === 1)
        newChessBoard[row][col] = "K";
      if (this.BP.shiftRight(i).and(this.ONE).getIndex(0) === 1)
        newChessBoard[row][col] = "p";
      if (this.BN.shiftRight(i).and(this.ONE).getIndex(0) === 1)
        newChessBoard[row][col] = "n";
      if (this.BB.shiftRight(i).and(this.ONE).getIndex(0) === 1)
        newChessBoard[row][col] = "b";
      if (this.BR.shiftRight(i).and(this.ONE).getIndex(0) === 1)
        newChessBoard[row][col] = "r";
      if (this.BQ.shiftRight(i).and(this.ONE).getIndex(0) === 1)
        newChessBoard[row][col] = "q";
      if (this.BK.shiftRight(i).and(this.ONE).getIndex(0) === 1)
        newChessBoard[row][col] = "k";
    }
    console.log(newChessBoard);
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
