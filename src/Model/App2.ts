import { alphaBeta, Board } from "./Board";

export const App = () => {
  const FEN = "";

  const board = new Board(FEN);
  for (const move of board.moves()) {
    alphaBeta({
      board: board,
      move: move,
      alpha: -999999,
      beta: 999999,
      depth: 0,
      isMax: true,
      callback: (obj) => {
        board.table.push(obj);
      },
    });
  }
};
