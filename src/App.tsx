import "./App.css";
import * as React from "react";
import { Board } from "./View/Board";
import { parseFEN, toStateHistoryFEN } from "./Model2/Parser";
import { isGameDone } from "./Model2/Utils";
import { State } from "./Model2/State";
import { runTests } from "./Model2/Tests";
import { API } from "./Model/API";

const PlaceHolderIncomingFEN = "8/6k1/8/8/8/8/1K6/8 b - - 0 1";
const stateHistory: string[] = [];

const currState = JSON.stringify({
  FEN: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
});

const api = new API();

api.post("http://127.0.0.1:5000/moves", currState);

function App() {
  // runTests();

  const splittedFEN = PlaceHolderIncomingFEN.split(/\s+/);
  const [state, setState] = React.useState<State>(
    new State({
      board: parseFEN(splittedFEN[0]),
      isWhiteTurn: splittedFEN[1] === "w",
      castleRight: splittedFEN[2],
      enPassant: splittedFEN[3],
      halfmoveClock: parseInt(splittedFEN[4]),
      fullmoveCount: parseInt(splittedFEN[5]),
    })
  );
  const timeLimit = 6000;
  const maxDepth = 3;

  function setNewState(state: State, useAlphaBeta: boolean) {
    state.wipeData();
    state.generateNextStates();
    const moves = state.nextMoves ? state.nextMoves : [];
    if (!isGameDone(state, moves, stateHistory)) {
      const startTime = Date.now();
      let depth = 1;
      while (Date.now() - startTime < timeLimit) {
        if (useAlphaBeta) {
          state.alphaBeta(depth, -10000, 10000, true, stateHistory, state.currState.isWhiteTurn);
        } else {
          state.minimax(depth, true, state.currState.isWhiteTurn, stateHistory);
        }
        console.log(`Value at depth ${depth}: ${state.value}`);
        if (depth === maxDepth) break;
        depth = depth < maxDepth ? depth + 1 : maxDepth;
      }
      const pick = state.pickNext();
      console.log(state);
      console.log("Decision took " + (Date.now() - startTime) + "ms");
      const newState = toStateHistoryFEN(pick.currState);
      setState(pick);
      stateHistory.push(newState);
    } else {
      console.log("Game is done");
    }
  }

  return (
    <>
      <div>
        <div
          className="login"
          onClick={() => {
            setNewState(state, true);
          }}
        >
          {"AlphaBeta"}
        </div>
        <div
          className="login"
          onClick={() => {
            setNewState(state, false);
          }}
        >
          {"MiniMax"}
        </div>
      </div>
      <Board board={state.currState.board} />
    </>
  );
}

export default App;
