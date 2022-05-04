import "./App.css";
import * as React from "react";
import { Board } from "./View/Board";
// fuer Server Kommunikation
// let ws = new WebSocket("ws://localhost:8025/websockets/game");

function App() {
  // fuer Server Kommunikation
  // console.log(ws);
  // ws.onmessage = (e) => {
  //   let message = e.data;
  //   console.log(message);
  //   let parsedMessage = JSON.parse(message);
  //   console.log("Message from server: \n" + message);
  // };

  return (
    <>
      <div className="login" onClick={handleClick}>
        {"Login"}
      </div>
      <Board fen={"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"} />
    </>
  );
}

const handleClick = () => {
  // fuer Server Kommunikation
  // ws.send(
  //   JSON.stringify({
  //     type: 0,
  //     username: "Gruppe AI",
  //   })
  // );
};

const parseFEN = (fen: string) => {
  fen;
};

export default App;
