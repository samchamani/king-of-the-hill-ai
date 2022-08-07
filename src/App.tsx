import * as React from "react";
import { Board } from "./View/Board";
import { API } from "./API";
import { Data } from "./View/Data";

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

let api = new API();
let isAborted = false;

/**
 * Initial FEN that will be used to set up the python server state and visualize the board.
 * Originally, this would have been replaced with a WebSocket listener that is connected to
 * a game or tournament server.
 *
 * Planned usage:
 * ```
 * const ws = new WebSocket("some url")
 * ws.onmessage(handleMessage)
 * ws.send(login || move)
 * ```
 *
 */
const FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const maxGameDurationInMin = 60;
const maxMovesAssumption = 40;
const panicMoveSpeedInSec = 10;
const algoRatio = 0.7;

function App() {
  const [board, setBoard] = React.useState(FEN);
  const splittedFEN = board.split(/\s+/);
  const fullMoveCount = parseInt(splittedFEN[5]);
  const timeOver = React.useRef(Date.now() + maxGameDurationInMin * 60 * 1000);
  const remainingTimeInSec = React.useRef((timeOver.current - Date.now()) / 1000);
  const isPanic = React.useRef((maxGameDurationInMin / 2) * 60 >= remainingTimeInSec.current);
  const leftMovesUntilMax = React.useRef(maxMovesAssumption - fullMoveCount > 0 ? maxMovesAssumption - fullMoveCount : 0);
  const moveTimeInSec = React.useRef(leftMovesUntilMax.current > 0 && !isPanic.current ? remainingTimeInSec.current / leftMovesUntilMax.current : panicMoveSpeedInSec);
  const alphaBetaSec = React.useRef(!isPanic.current ? moveTimeInSec.current * algoRatio : moveTimeInSec.current * (1 - algoRatio));
  const mctsSec = React.useRef(!isPanic.current ? moveTimeInSec.current * (1 - algoRatio) : moveTimeInSec.current * algoRatio);
  const nextBestMoves = React.useRef<movesResp>();
  const selectedMove = React.useRef<move>();
  const lastMovePos = React.useRef<move>();

  console.log(`
Remaining time in sec: ${remainingTimeInSec.current}
     Move time in sec: ${moveTimeInSec.current}
`);
  if (isPanic.current) console.log("Getting panic...");

  React.useEffect(() => {
    remainingTimeInSec.current = (timeOver.current - Date.now()) / 1000;
    isPanic.current = (maxGameDurationInMin / 2) * 60 >= remainingTimeInSec.current;
    leftMovesUntilMax.current = maxMovesAssumption - fullMoveCount > 0 ? maxMovesAssumption - fullMoveCount : 0;
    moveTimeInSec.current = leftMovesUntilMax.current > 0 && !isPanic.current ? remainingTimeInSec.current / leftMovesUntilMax.current : panicMoveSpeedInSec;
    alphaBetaSec.current = !isPanic.current ? moveTimeInSec.current * algoRatio : moveTimeInSec.current * (1 - algoRatio);
    mctsSec.current = !isPanic.current ? moveTimeInSec.current * (1 - algoRatio) : moveTimeInSec.current * algoRatio;
  });

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
    if (seconds === 0) return;
    let depth = 1;
    const end = Date.now() + seconds * 1000;
    console.log("...Looking for good moves...");
    while (Date.now() < end - 500) {
      const resp = await api.post("http://127.0.0.1:5000/alphabeta", JSON.stringify({ depth: depth, stopTime: end }));
      if (resp && isAlphaBetaResp(resp)) {
        if (Date.now() < end - 500) {
          nextBestMoves.current = resp;
          console.log(
            nextBestMoves.current.moves.map((move) => move.toString),
            `\nvalue: ${nextBestMoves.current.value}\ndepth: ${nextBestMoves.current.depth}`
          );
          if (nextBestMoves.current.value === 10000 || nextBestMoves.current.value === -10000) break;
          depth += 1;
        } else {
          console.log(`Iteration of depth ${depth} was cancelled due to timeout`);
          break;
        }
      }
      console.log("Done");
    }
  }

  async function doMove() {
    if (!selectedMove.current) {
      console.log("No move selected!");
      return;
    }
    const resp = await api.post("http://127.0.0.1:5000/doMove", JSON.stringify({ move: selectedMove.current }));
    if (resp && isBoardResp(resp)) {
      lastMovePos.current = selectedMove.current;
      setBoard(resp.board);
    }
    console.log("executed move");
    selectedMove.current = undefined;
    nextBestMoves.current = undefined;
  }

  async function undoMove() {
    const resp = await api.get("http://127.0.0.1:5000/undoLastMove");
    console.log("Undoing last move: ", resp);
    if (resp && isBoardResp(resp)) setBoard(resp.board);
  }

  async function pickMCTSMove(seconds: number) {
    if (!nextBestMoves.current) {
      console.log("...Executing MCTS for all possible moves...");
      const resp = await api.post("http://127.0.0.1:5000/mcts", JSON.stringify({ stopTime: Date.now() + seconds * 1000 }));
      console.log(resp);
      if (resp && isMoveResp(resp)) selectedMove.current = resp.move;
      return;
    }
    if (nextBestMoves.current.moves.length === 1) {
      console.log("Only one move available!");
      selectedMove.current = nextBestMoves.current.moves[0];
    } else {
      const moves = nextBestMoves.current.moves.map((o) => o.toString);
      const end = Date.now() + seconds * 1000;
      console.log("...Looking for best of best moves according to MCTS...");
      const resp = await api.post("http://127.0.0.1:5000/mcts", JSON.stringify({ moves: moves, stopTime: end }));
      console.log(resp);
      if (resp && isMoveResp(resp)) selectedMove.current = resp.move;
    }
    console.log("picked", selectedMove.current);
  }

  async function automaticPlay() {
    let isDone = false;
    isAborted = false;
    await initBoard();
    while (!isDone && !isAborted && remainingTimeInSec.current > 0) {
      if (alphaBetaSec.current !== 0) {
        console.log(`Taking about ${alphaBetaSec.current} seconds for AlphaBeta`);
        await alphaBeta(alphaBetaSec.current);
      }
      console.log(`Taking about ${mctsSec.current} seconds for MCTS`);
      await pickMCTSMove(mctsSec.current);
      if (!selectedMove.current) isDone = true;
      await doMove();
    }
    console.log("Stopped automatic play");
  }

  async function abort() {
    await api.controller.abort();
    isAborted = true;
    api = new API();
  }

  return (
    <>
      <div className="title">{"KING-OF-THE-HILL AI"}</div>
      <div className="chess-ui">
        <div className="buttons">
          <div className="special-button" onClick={() => automaticPlay()}>
            {"Automatic play"}
          </div>
          <div className="button" onClick={() => initBoard()}>
            {"Set board (on server)"}
          </div>
          <div className="button" onClick={() => getMoves()}>
            {"Get all possible moves"}
          </div>
          <div className="button" onClick={() => alphaBeta(alphaBetaSec.current)}>
            {"Get alpha-beta moves"}
          </div>
          <div className="button" onClick={() => pickMCTSMove(mctsSec.current)}>
            {"Pick MCTS move"}
          </div>
          <div className="button" onClick={() => doMove()}>
            {"Do selected move"}
          </div>
          <div className="button" onClick={() => undoMove()}>
            {"Undo last move"}
          </div>
          <div className="button" onClick={() => abort()}>
            {"Abort current call"}
          </div>
        </div>
        <Board board={splittedFEN[0]} lastMovePos={lastMovePos.current} />
        <div className="data">
          <Data label="Turn" content={splittedFEN[1]} />
          <Data label="Castle rights" content={splittedFEN[2]} />
          <Data label="En passant" content={splittedFEN[3]} />
          <Data label="Halfmove clock" content={splittedFEN[4]} />
          <Data label="Fullmove count" content={splittedFEN[5]} />
          <Data label="For more info open your browser console" content="" />
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
