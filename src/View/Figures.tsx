import * as React from "react";
import "./Figures.css";
import { figType, Figure } from "./Figure";

export interface FiguresProps {
  board: figType[][];
}

export const Figures = (props: FiguresProps) => {
  const figureList: React.ReactNode[] = [];
  for (const row in props.board) {
    const rowNumber = parseInt(row) + 1;
    for (const col in props.board[row]) {
      const colNumber = parseInt(col) + 1;
      figureList.push(<Figure key={props.board[row][col] + colNumber + rowNumber} fig={props.board[row][col]} col={colNumber} row={rowNumber} />);
    }
  }

  return <div className="chess-figures">{figureList}</div>;
};
