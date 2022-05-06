import "./App.css";
import * as React from "react";
import { Board } from "./View/Board";
import { figType } from "./View/Figure";
import { useState } from "react";
import { parseFEN } from "./Model/Parser";
import { Moves } from "./Model/Moves";
// fuer Server Kommunikation
// let ws = new WebSocket("ws://localhost:8025/websockets/game");

const PlaceHolderIncomingFEN =
  "rnbqkbnr/pppppppp/8/PpP5/5P2/8/P1P1P1PP/RNBQKBNR w KQkq b6 0 1";
export const assignedColor: string = "w";

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
  // fuer Server Kommunikation
  // console.log(ws);
  // ws.onmessage = (e) => {
  //   let message = e.data;
  //   console.log(message);
  //   let parsedMessage = JSON.parse(message);
  //   console.log("Message from server: \n" + message);
  // };

  const splittedFEN = PlaceHolderIncomingFEN.split(/\s+/);
  const [state, setState] = useState<gameState>({
    board: parseFEN(splittedFEN[0]),
    isWhiteTurn: splittedFEN[1] === "w",
    castleRight: splittedFEN[2],
    enPassant: splittedFEN[3],
    halfmoveClock: parseInt(splittedFEN[4]),
    fullmoveCount: parseInt(splittedFEN[5]),
  });
  const moves = new Moves(state).getMoves();
  console.log("Moves: ", moves);

  return (
    <>
      <div className="login" onClick={login}>
        {"Login"}
      </div>
      <Board board={state.board} />
    </>
  );
}

const login = () => {
  // fuer Server Kommunikation
  // ws.send(
  //   JSON.stringify({
  //     type: 0,
  //     username: "Gruppe AI",
  //   })
  // );
};

export default App;
