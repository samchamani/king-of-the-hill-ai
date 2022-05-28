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
const PlaceHolderIncomingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function App() {
  const [board, setBoard] = React.useState(PlaceHolderIncomingFEN);

  //TODO
  async function setNextBoard() {
    console.log(
      await api.post(
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
          onClick={async () => {
            //TODO
            setNextBoard();
          }}
        >
          {"AlphaBeta"}
        </div>
        <div
          className="button"
          onClick={async () => {
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
