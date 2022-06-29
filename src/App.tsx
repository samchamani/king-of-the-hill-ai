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
const PlaceHolderIncomingFEN = "8/8/5k2/8/8/2K5/8/8 w - - 0 1";

const initBoard = "initBoard";
const getMoves = "getMoves";
const doMove = "doMove";
const alphabeta = "alphabeta";

function App() {
  const [board, setBoard] = React.useState(PlaceHolderIncomingFEN);

  //TODO
  async function setNextBoard(action: string) {
    const url = "http://127.0.0.1:5000/" + action;
    switch (action) {
      case initBoard:
        console.log(
          await api.post(
            url,
            JSON.stringify({
              FEN: board,
            })
          )
        );
        break;
      case doMove:
        console.log(
          await api.post(
            url,
            JSON.stringify({
              FEN: board,
            })
          )
        );
        break;
      case getMoves:
        console.log(await api.get(url));
        break;
      case alphabeta:
        console.log(await api.get(url));
        break;
    }
    setBoard(board);
  }

  return (
    <>
      <div>
        <div
          className="button"
          onClick={async () => {
            setNextBoard(initBoard);
          }}
        >
          {initBoard}
        </div>
        <div
          className="button"
          onClick={async () => {
            setNextBoard(getMoves);
          }}
        >
          {getMoves}
        </div>
        <div
          className="button"
          onClick={async () => {
            setNextBoard(alphabeta);
          }}
        >
          {alphabeta}
        </div>
        <div
          className="button"
          onClick={async () => {
            setNextBoard(doMove);
          }}
        >
          {doMove}
        </div>
      </div>
      <Board board={board} />
    </>
  );
}

export default App;
