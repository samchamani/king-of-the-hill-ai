import * as React from "react";
import { BoardRow } from "./BoardRow";
import { Figures } from "./Figures";
import "./Board.css";
import { figType } from "./Figure";
import { move } from "../App";

const LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h"];

/**
 * Board representation
 */
export interface BoardProps {
  board: string;
  lastMovePos: move | undefined;
}

export const Board = (props: BoardProps) => {
  const splittedFEN = props.board.split(/\s+/);

  const fenBoard = splittedFEN[0];
  const board: figType[][] = [];
  const fenRows = fenBoard.split("/");
  for (const row of fenRows) {
    let rowContent: figType[] = [];
    const cells = [...row];
    cells.forEach((cell) => {
      /\d/.test(cell) ? (rowContent = [...rowContent, ...new Array(parseInt(cell)).fill("")]) : rowContent.push(cell as figType);
    });
    board.push(rowContent);
  }

  const rows: React.ReactNode[] = [];
  for (let i = 8; i >= 1; i--) {
    rows.push(<BoardRow key={`row-${i}`} rowNumber={i} isWhiteLeft={i % 2 === 0} />);
  }

  const colLetters: React.ReactNode[] = [];
  for (const l of LETTERS) {
    colLetters.push(
      <div key={`col-${l}`} className="chess-board-col-letter">
        {l}
      </div>
    );
  }
  return (
    <div className="game-state">
      <div className="chess-board-and-figures">
        <div className="chess-board">
          {rows}
          <div className="chess-board-col-letters">{colLetters}</div>
        </div>
        <Figures board={board} lastMovePos={props.lastMovePos} />
      </div>
      <div className="state-data-container">
        <div className="state-data" style={{ gridColumnStart: 1, gridColumnEnd: 3 }}>{`turn: ${splittedFEN[1]}`}</div>
        <div className="state-data">{`castles: ${splittedFEN[2]}`}</div>
        <div className="state-data">{`enPass: ${splittedFEN[3]}`}</div>
        <div className="state-data">{`halfmove: ${splittedFEN[4]}`}</div>
        <div className="state-data">{`fullmove: ${splittedFEN[5]}`}</div>
      </div>
    </div>
  );
};
