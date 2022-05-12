export type tableEntry = {
  node?: string;
  upperbound?: number;
  lowerbound?: number;
  age?: number;
};

export class Board {
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

  //transposition table
  table!: tableEntry[];

  constructor(FEN: string) {
    this.FEN = FEN;
    this.initBoard();
  }

  initBoard() {
    if (this.FEN) {
      //todo parseFEN to bitboard
      const splittedFEN = this.FEN.split(/\s+/);
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
    return new Board("");
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

const evaluateBoard = (board: Board) => {
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
  board: Board;
  move: Move;
  depth: number;
  alpha: number;
  beta: number;
  isMax: boolean;
  callback: (obj: tableEntry) => void;
};
