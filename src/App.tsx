import "./App.css";
import * as React from "react";
import { Board } from "./View/Board";
import { figType } from "./View/Figure";
import { useState } from "react";
import { parseFEN, toStateHistoryFEN } from "./Model/Parser";
import { Moves } from "./Model/Moves";
import { isGameDone } from "./Model/Utils";
import { alphaBeta } from "./Model/Evaluater";
import { runTest } from "./Test/test";

//"8/p3k3/5N2/4P3/8/B7/8/K7 b - - 0 1" end
//"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" start
// "r1br2k1/pppp1pp1/7p/2b1p3/2Pn4/4QN2/PP2PPBP/RN3RK1 w - - 0 1" mid
const PlaceHolderIncomingFEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const stateHistory: string[] = [];

export type gameState = {
  board: figType[][];
  isWhiteTurn: boolean;
  /**
   * KQkq
   * Die Buchstaben, die nicht mehr möglichen Rochaden entsprechen,
   * werden ausgelassen, und der Strich „-“ wird dann und nur dann
   * geschrieben, wenn keine der vier Rochaden mehr möglich ist.
   */
  castleRight: string;
  /**
   * Sofern im letzten Zug ein Bauer zwei Felder vorgerückt ist,
   * wird das übersprungene Feld angegeben, unabhängig davon,
   * ob ein en-passant-Schlag auf dieses Feld tatsächlich möglich ist oder nicht.
   * Nach Bauer f2–>f4 wird in der FEN in der 4. Gruppe „f3“ angegeben.
   */
  enPassant: string;
  /**
   * Beginnt mit 0 und wird bei jedem Halbzug, bei dem kein Bauer bewegt
   * oder eine Figur geschlagen wurde, um 1 erhöht.
   * -> 50-Züge-Regel: Remi-Antrag, wenn diese Zahl 100 ist. Remi bei 150.
   */
  halfmoveClock: number;
  /**
   * Beginnt mit 1 und wird nach jedem Zug von schwarz um 1 erhöht
   */
  fullmoveCount: number;
};

function App() {
  runTest();
  const splittedFEN = PlaceHolderIncomingFEN.split(/\s+/);
  const [state, setState] = useState<gameState>({
    board: parseFEN(splittedFEN[0]),
    isWhiteTurn: splittedFEN[1] === "w",
    castleRight: splittedFEN[2],
    enPassant: splittedFEN[3],
    halfmoveClock: parseInt(splittedFEN[4]),
    fullmoveCount: parseInt(splittedFEN[5]),
  });

  function setNewState(state: gameState) {
    // console.time("Random move");
    console.time("Alphabeta time");
    const moves = new Moves(state).getMoves();
    let depth = 2;
    // if (moves.length < 20) depth = 3;
    // if (moves.length < 15) depth = 4;
    if (!isGameDone(state, moves, stateHistory)) {
      // console.log("Moves: ", moves);
      moves.forEach((move) => {
        move.value = alphaBeta({
          state: move.newState,
          depth: depth,
          alpha: -10000,
          beta: 10000,
          isMax: false,
          stateHistory: stateHistory,
        });
      });
      console.log(
        "AlphaBeta move evaluation: ",
        moves
          .sort((a, b) => {
            if (!!a.value && !!b.value) return a.value >= b.value ? -1 : 1;
            if (!!a.value && !b.value) return -1;
            if (!a.value && !!b.value) return 1;
            return 0;
          })
          .map((o) => `${o.move}: ${o.value} Points`)
      );
      const highestPoints = moves
        .map((o) => o.value)
        .reduce((prev, curr) => {
          if (curr === undefined) return prev;
          if (prev === undefined) return curr;
          return prev > curr ? prev : curr;
        });
      const bestMoves = moves.filter((o) => o.value === highestPoints);
      const pickedMove =
        bestMoves[Math.floor(Math.random() * bestMoves.length)];
      console.log("Picked move: " + pickedMove.move + " " + pickedMove.value);
      console.timeEnd("Alphabeta time");
      // console.timeEnd("Random move");
      const newState = toStateHistoryFEN(pickedMove.newState);
      setState(pickedMove.newState);
      stateHistory.push(newState);
      // console.log("History: ", stateHistory);
    } else {
      isGameDone(state, moves, stateHistory);
    }
  }

  return (
    <>
      <div
        className="login"
        onClick={() => {
          setNewState(state);
        }}
      >
        {"nextMove"}
      </div>
      <Board board={state.board} />
    </>
  );
}

export default App;
