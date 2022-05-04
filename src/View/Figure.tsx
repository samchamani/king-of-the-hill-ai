import * as React from "react";

export type figType =
  | "K"
  | "k"
  | "Q"
  | "q"
  | "B"
  | "b"
  | "N"
  | "n"
  | "R"
  | "r"
  | "P"
  | "p";

export type colType = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

export type rowType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface FigureProps {
  fig: figType;
  col: colType;
  row: rowType;
}

export const Figure = (props: FigureProps) => {
  return (
    <div
      className={`chess-figure ${props.fig.toLowerCase() + isWhite(props.fig)}`}
    />
  );
};

function isWhite(str: string): string {
  str === str.toUpperCase() ? "white" : "black";
  return str === str.toUpperCase() ? "white" : "black";
}
