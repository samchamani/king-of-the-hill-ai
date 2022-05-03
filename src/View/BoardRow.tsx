import React, { Component } from 'react';
import { BoardField } from './BoardField'
import './BoardRow.css'

export interface BoardRowProps {
  isWhiteLeft: boolean
  rowNumber: number
}

export const BoardRow = (props: BoardRowProps) => {
  const fields = []
  for (let i = 1; i<=8; i++) {
    fields.push(<BoardField key={i} isWhite={props.isWhiteLeft ? i % 2 === 1 : i % 2 === 0}/>)
  }
  return <div className="chess-board-row">
    <div className="chess-board-row-number">{props.rowNumber}</div>
    {fields}
    </div>;
};

// export default BoardRow