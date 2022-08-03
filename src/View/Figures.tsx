import * as React from "react";
import "./Figures.css";
import { figType, Figure } from "./Figure";
import { move } from "../App";

export interface FiguresProps {
  board: figType[][];
  lastMovePos: move | undefined;
}

export const Figures = (props: FiguresProps) => {
  const figureList: React.ReactNode[] = [];
  for (const row in props.board) {
    const rowNumber = parseInt(row) + 1;
    for (const col in props.board[row]) {
      const colNumber = parseInt(col) + 1;
      if (props.board[row][col] !== "")
        figureList.push(<Figure key={props.board[row][col] + colNumber + rowNumber} fig={props.board[row][col]} col={colNumber} row={rowNumber} lastMovePos={props.lastMovePos} />);
    }
  }

  return <div className="chess-figures">{figureList}</div>;
};
