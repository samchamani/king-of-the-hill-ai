import * as React from "react";
import { Board } from "./View/Board";
import { API } from "./API";
import { Chess } from "chess.js";
import { Data } from "./View/Data";

let api = new API();

export type boardResp = {
  board: string;
};

export type move = {
  toString: string;
  type: string;
  from: number | string;
  to: number | string;
  enemy?: number | string;
  double?: string;
  promoType?: string;
};

export type movesResp = {
  depth: number;
  moves: move[];
  value: number;
};

export type moveResp = {
  move: move;
};

/**
 * WebSocket of game server
 */
// const ws = new WebSocket("")
// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
// r1br2k1/pppp1pp1/7p/2b1p3/2Pn4/4QN2/PP2PPBP/RN3RK1 w - - 0 1
// 8/p3k3/5N2/4P3/8/B7/8/K7 b - - 0 1
// 8/6k1/8/8/8/8/1K6/8 w - - 0 1
// 6Bk/Q7/8/8/8/3K4/8/8 w - - 0 1
// 6Bk/Q7/8/8/8/K7/8/8 w - - 0 1
const PlaceHolderIncomingFEN = "6Bk/Q7/8/8/8/3K4/8/8 w - - 0 1";

function App() {
  const [board, setBoard] = React.useState(PlaceHolderIncomingFEN);
  const [infoLog, setInfoLog] = React.useState("");
  const nextBestMoves = React.useRef<movesResp>();
  const selectedMove = React.useRef<move>();
  const lastMovePos = React.useRef<move>();

  async function initBoard() {
    const resp = await api.post(
      "http://127.0.0.1:5000/initBoard",
      JSON.stringify({
        FEN: board,
      })
    );
    console.log(resp);
    if (resp && isBoardResp(resp)) setBoard(resp.board);
  }

  async function getMoves() {
    console.log(await api.get("http://127.0.0.1:5000/getMoves"));
  }

  async function alphaBeta(seconds: number) {
    let depth = 1;
    const end = Date.now() + seconds * 1000;
    setInfoLog("...Looking for good moves...\n" + infoLog);
    console.log("...Looking for good moves...");
    let timeout = setTimer(seconds);
    while (Date.now() < end - 500) {
      const resp = await api.post("http://127.0.0.1:5000/alphabeta", JSON.stringify({ depth: depth, stopTime: end }));
      if (resp && isAlphaBetaResp(resp)) {
        nextBestMoves.current = resp;
        setInfoLog("new best moves!\n" + infoLog);
        console.log(
          nextBestMoves.current.moves.map((move) => move.toString),
          `\nvalue: ${nextBestMoves.current.value}\ndepth: ${nextBestMoves.current.depth}`
        );
        if (nextBestMoves.current.value === 10000 || nextBestMoves.current.value === -10000) break;
      }
      depth += 1;
    }
    clearTimeout(timeout);
    setInfoLog("Alpha-Beta is done\n" + infoLog);
    console.log("Done");
  }

  async function doMove() {
    if (!selectedMove.current) {
      console.log("No move selected!");
      setInfoLog("No moves selected!\n" + infoLog);
      return;
    }
    const resp = await api.post("http://127.0.0.1:5000/doMove", JSON.stringify({ move: selectedMove.current }));
    if (resp && isBoardResp(resp)) {
      lastMovePos.current = selectedMove.current;
      setBoard(resp.board);
    }
    console.log("executed move");
    setInfoLog("Executing selected move!\n" + infoLog);
    selectedMove.current = undefined;
    nextBestMoves.current = undefined;
  }

  async function undoMove() {
    const resp = await api.get("http://127.0.0.1:5000/undoLastMove");
    setInfoLog("Undoing last move!\n" + infoLog);
    console.log("Undoing last move: ", resp);
    if (resp && isBoardResp(resp)) setBoard(resp.board);
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

  function pickRandomMove() {
    if (!nextBestMoves.current) {
      console.log("No moves available!");
      return;
    }
    if (nextBestMoves.current.moves.length === 1) {
      selectedMove.current = nextBestMoves.current.moves[0];
    } else {
      selectedMove.current = nextBestMoves.current.moves[Math.floor(Math.random() * nextBestMoves.current.moves.length)];
    }
    console.log("picked", selectedMove.current);
  }

  async function pickMCTSMove(seconds: number) {
    if (!nextBestMoves.current) {
      console.log("No moves available!");
      return;
    }
    if (nextBestMoves.current.moves.length === 1) {
      console.log("Only one move available!");
      selectedMove.current = nextBestMoves.current.moves[0];
    } else {
      const end = Date.now() + seconds * 1000;
      console.log("...Looking for best of best moves according to MCTS...");
      const resp = await api.post("http://127.0.0.1:5000/mcts", JSON.stringify({ stopTime: end }));
      console.log(resp);
      if (resp && isMoveResp(resp)) selectedMove.current = resp.move;
    }
  }

  return (
    <>
      <div className="title">{"KING-OF-THE-HILL AI"}</div>
      <div className="chess-ui">
        <div className="buttons">
          <div className="button" onClick={async () => initBoard()}>
            {"Set board (on server)"}
          </div>
          <div className="button" onClick={async () => getMoves()}>
            {"Get all possible moves"}
          </div>
          <div className="button" onClick={async () => alphaBeta(10)}>
            {"Get alpha-beta moves"}
          </div>
          <div className="button" onClick={async () => pickRandomMove()}>
            {"Pick random move"}
          </div>
          <div className="button" onClick={async () => pickMCTSMove(5)}>
            {"Pick MCTS move"}
          </div>
          <div className="button" onClick={async () => doMove()}>
            {"Do selected move"}
          </div>
          <div className="button" onClick={async () => undoMove()}>
            {"Undo last move"}
          </div>
          <div className="button" onClick={() => getChessJSMoves()}>
            {"Check moves of chess.js"}
          </div>
        </div>
        <Board board={board} lastMovePos={lastMovePos.current} />
        <div className="data">
          <Data label="Log" content={infoLog} />
          <Data label="Next Best Moves" content={nextBestMoves.current ? nextBestMoves.current.moves.map((o) => o.toString).join("\n") : "No moves found"} />
          <Data label="Selected Move" content={selectedMove.current ? selectedMove.current.toString : "No move selected"} />
        </div>
      </div>
    </>
  );
}

export default App;

function isBoardResp(resp: any): resp is boardResp {
  return "board" in resp;
}

function isAlphaBetaResp(resp: any): resp is movesResp {
  return "moves" in resp && "value" in resp && "depth" in resp;
}

function isMoveResp(resp: any): resp is moveResp {
  return "move" in resp;
}
