import * as React from "react";
import { Board, parseFEN } from "./View/Board";
import { API } from "./API";

/**
 * API of python chess engine
 */
const api = new API();

/**
 * WebSocket of game server
 */
// const ws = new WebSocket("")
const PlaceHolderIncomingFEN = "8/6k1/8/8/8/8/1K6/8 b - - 0 1";

function App() {
  const [board, setBoard] = React.useState(PlaceHolderIncomingFEN);

  //TODO
  function setNextBoard() {
    console.log(
      api.post(
        "http://127.0.0.1:5000/moves",
        JSON.stringify({
          FEN: PlaceHolderIncomingFEN,
        })
      )
    );
    setBoard(board);
  }

  return (
    <>
      <div>
        <div
          className="button"
          onClick={() => {
            //TODO
            setNextBoard();
          }}
        >
          {"AlphaBeta"}
        </div>
        <div
          className="button"
          onClick={() => {
            //TODO
            setNextBoard();
          }}
        >
          {"MiniMax"}
        </div>
      </div>
      <Board board={parseFEN(board.split(/\s+/)[0])} />
    </>
  );
}

export default App;
