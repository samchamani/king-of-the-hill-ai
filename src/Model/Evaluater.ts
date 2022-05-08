import { gameState } from "../App";
import { Moves, moveType } from "./Moves";
import { toStateHistoryFEN } from "./Parser";
import { isWhite, isCheck, isKingOfTheHill, isMate, isGameDone } from "./Utils";

/**
 * Values from https://www.chess.com/terms/chess-piece-value
 *
 * @param board
 * @param playsWhite
 * @returns
 */

// TODO: Punkte für Matt setzen
export const evaluateBoard = (state: gameState, playsWhite: boolean) => {
  const board = state.board;
  let sum = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === "") continue;
      const colorFactor = playsWhite === isWhite(cell) ? 1 : -1;
      switch (cell) {
        case "P":
          sum += colorFactor * 1;
          break;
        case "N":
          sum += colorFactor * 3;
          break;
        case "B":
          sum += colorFactor * 3;
          break;
        case "R":
          sum += colorFactor * 5;
          break;
        case "Q":
          sum += colorFactor * 9;
          break;
        case "K":
          sum += colorFactor * 1000;
          break;
        case "p":
          sum += colorFactor * 1;
          break;
        case "n":
          sum += colorFactor * 3;
          break;
        case "b":
          sum += colorFactor * 3;
          break;
        case "r":
          sum += colorFactor * 5;
          break;
        case "q":
          sum += colorFactor * 9;
          break;
        case "k":
          sum += colorFactor * 1000;
          break;
      }
    }
  }
  // if ((isCheck(state, playsWhite === !state.isWhiteTurn), true)) sum += 10;
  // if ((isKingOfTheHill(state) && !state.isWhiteTurn === playsWhite, true))
  //   sum += 100;
  // if (
  //   isCheck(state, playsWhite === !state.isWhiteTurn) &&
  //   isMate(state, new Moves(state).getMoves(), true)
  // )
  //   sum += 1000;
  return sum;
};

export type alphaBetaType = {
  state: gameState;
  depth: number;
  alpha: number;
  beta: number;
  isMax: boolean;
  stateHistory: string[];
};

export function alphaBeta(ab: alphaBetaType): number {
  const moves = new Moves(ab.state).getMoves();
  if (ab.depth === 0 || isGameDone(ab.state, moves, ab.stateHistory))
    return evaluateBoard(ab.state, ab.isMax);
  if (ab.isMax) {
    let value = ab.alpha;
    for (const move of moves) {
      const newHist = [...ab.stateHistory];
      newHist.push(toStateHistoryFEN(move.newState));
      const childAB = alphaBeta({
        state: move.newState,
        depth: ab.depth - 1,
        alpha: value,
        beta: ab.beta,
        isMax: !ab.isMax,
        stateHistory: newHist,
      });
      value = value > childAB ? value : childAB;
      if (value >= ab.beta) break;
    }
    return value;
  } else {
    let value = ab.beta;
    for (const move of moves) {
      const newHist = [...ab.stateHistory];
      newHist.push(toStateHistoryFEN(move.newState));
      const childAB = alphaBeta({
        state: move.newState,
        depth: ab.depth - 1,
        alpha: ab.alpha,
        beta: value,
        isMax: !ab.isMax,
        stateHistory: newHist,
      });
      value = value < childAB ? value : childAB;
      if (value <= ab.alpha) break;
    }
    return value;
  }
}
