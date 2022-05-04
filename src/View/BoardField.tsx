import React from 'react';

export interface BoardFieldProps {
  isWhite: boolean
}

export const BoardField = (props: BoardFieldProps) => {
  return (<div className={`chess-field ${props.isWhite ? 'white':'black'}`}/>)
};
