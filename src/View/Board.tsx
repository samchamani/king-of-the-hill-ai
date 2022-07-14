import * as React from "react";
import { BoardRow } from "./BoardRow";
import { Figures } from "./Figures";
import "./Board.css";
import { figType } from "./Figure";

const LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h"];

/**
 * Board representation
 */
export interface BoardProps {
  board: figType[][];
}

export const Board = (props: BoardProps) => {
  const rows: React.ReactNode[] = [];
  for (let i = 8; i >= 1; i--) {
    rows.push(
      <BoardRow key={`row-${i}`} rowNumber={i} isWhiteLeft={i % 2 === 0} />
    );
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
    <div className="chess-board-and-figures">
      <div className="chess-board">
        {rows}
        <div className="chess-board-col-letters">{colLetters}</div>
      </div>
      <Figures board={props.board} />
    </div>
  );
};
