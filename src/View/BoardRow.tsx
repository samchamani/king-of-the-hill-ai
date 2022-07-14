import React from "react";
import { BoardField } from "./BoardField";

export interface BoardRowProps {
  isWhiteLeft: boolean;
  rowNumber: number;
}

export const BoardRow = (props: BoardRowProps) => {
  const fields: React.ReactNode[] = [];
  for (let i = 1; i <= 8; i++) {
    fields.push(<BoardField key={`cell-${i}`} isWhite={props.isWhiteLeft ? i % 2 === 1 : i % 2 === 0} />);
  }
  return (
    <div className="chess-board-row">
      <div className="chess-board-row-number">{props.rowNumber}</div>
      {fields}
    </div>
  );
};
