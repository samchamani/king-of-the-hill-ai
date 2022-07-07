import * as React from "react";
import { Board } from "./View/Board";
import { API } from "./API";
import { Chess } from "chess.js";

/**
 * API of python chess engine
 */
let api = new API();

export type initResp = {
  board: string;
};

export type alphaBetaResp = {
  move: string;
  value: number;
  depth: number;
};

/**
 * WebSocket of game server
 */
// const ws = new WebSocket("")
const PlaceHolderIncomingFEN = "8/p3k3/5N2/4P3/8/B7/8/K7 b - - 0 1";

const initBoard = "initBoard";

function App() {
  const [board, setBoard] = React.useState(PlaceHolderIncomingFEN);
  const nextBestMove = React.useRef({});

  async function initBoard() {
    const resp = await api.post(
      "http://127.0.0.1:5000/initBoard",
      JSON.stringify({
        FEN: board,
      })
    );
    console.log(resp);
    if (resp && isInitResp(resp)) setBoard(resp.board);
  }

  async function getMoves() {
    console.log(await api.get("http://127.0.0.1:5000/getMoves"));
  }

  async function alphaBeta(seconds: number) {
    let depth = 1;
    let alpha = -10000;
    let beta = 10000;
    const end = Date.now() + seconds * 1000;
    console.log("...Looking for good moves...");
    let timeout = setTimer(seconds);
    while (Date.now() < end - 500) {
      const resp = await api.post(
        "http://127.0.0.1:5000/alphabeta",
        JSON.stringify({
          depth: depth,
          alpha: alpha,
          beta: beta,
          stopTime: end,
        })
      );
      if (resp && isAlphaBetaResp(resp)) {
        nextBestMove.current = resp;
        console.log(nextBestMove.current);
      }
      depth += 1;
    }
    clearTimeout(timeout);
    console.log("Done");
  }

  function getChessJSMoves() {
    console.log(new Chess(PlaceHolderIncomingFEN).moves());
  }

  function setTimer(seconds: number) {
    return setTimeout(() => {
      api.controller.abort();
      api = new API();
    }, seconds * 1000);
  }

  return (
    <div className="chess-ui">
      <Board board={board} />
      <div>
        <div className="button" onClick={async () => initBoard()}>
          {"Set board (on server)"}
        </div>
        <div className="button" onClick={async () => getMoves()}>
          {"Get all possible moves"}
        </div>
        <div className="button" onClick={async () => alphaBeta(10)}>
          {"Get alpha-beta move"}
        </div>
        <div className="button" onClick={() => getChessJSMoves()}>
          {"Check moves of chess.js"}
        </div>
      </div>
    </div>
  );
}

export default App;

function isInitResp(resp: any): resp is initResp {
  return "board" in resp;
}

function isAlphaBetaResp(resp: any): resp is alphaBetaResp {
  return "move" in resp && "value" in resp && "depth" in resp;
}
