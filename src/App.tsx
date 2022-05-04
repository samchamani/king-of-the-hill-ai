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
  console.log(parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"));
  

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
  const board = Array.from(Array(8), () => new Array(8));
  const rows = fen.split("/");
  if (rows.length === 8) {
    let rowNo = 0;
    for (const row of rows) {
      let colNo = 0;
      for (let i = 0; i < row.length; i++) {
        let numberFields = parseInt(row[i]);
        if (isNaN(numberFields)) {
          board[rowNo][colNo] = row[i];
        } else {
          for (let n = 0; n < numberFields; n++) {
            board[rowNo][colNo + n] = "";
          }
          if (numberFields > 1) {
            colNo += --numberFields;
          }
        }
        colNo++;
      }
      rowNo++;
    }
  }
  return board;
};

export default App;
