import * as React from "react";
import { move } from "../App";

export type figType = "K" | "k" | "Q" | "q" | "B" | "b" | "N" | "n" | "R" | "r" | "P" | "p" | "";

export interface FigureProps {
  fig: figType;

  /**
   * Zahl von 1-8: steht für a bis h
   */
  col: number;

  /**
   * Zahl von 1-8
   */
  row: number;

  lastMovePos: move | undefined;
}

export const Figure = (props: FigureProps) => {
  const posStyles = {
    top: (props.row - 1) * 50,
    left: (props.col - 1) * 50,
  };

  const oldCol = props.lastMovePos ? ((props.lastMovePos.from as number) % 8) + 1 : props.col;
  const oldRow = props.lastMovePos ? ((props.lastMovePos.from as number) - (oldCol - 1)) / 8 + 1 : props.row;
  const [pos, setPos] = React.useState({ top: (oldRow - 1) * 50, left: (oldCol - 1) * 50 });

  React.useEffect(() => {
    setTimeout(() => setPos(posStyles), 100);
  }, []);

  return <div className={`chess-figure ${props.fig.toLowerCase() + isWhite(props.fig)}`} style={pos} />;
};

function isWhite(str: string): string {
  if (str === "") return "";
  str === str.toUpperCase() ? "white" : "black";
  return str === str.toUpperCase() ? "white" : "black";
}
