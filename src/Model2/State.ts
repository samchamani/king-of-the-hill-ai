import { figType } from "../View/Figure";
import { Moves, moveType } from "./Moves";
import { isGameDone, isColorKingOfTheHill, isWhite } from "./Utils";
import { toStateHistoryFEN } from "./Parser";

export type gameState = {
  board: figType[][];
  isWhiteTurn: boolean;
  /**
   * KQkq
   * Die Buchstaben, die nicht mehr möglichen Rochaden entsprechen,
   * werden ausgelassen, und der Strich „-“ wird dann und nur dann
   * geschrieben, wenn keine der vier Rochaden mehr möglich ist.
   */
  castleRight: string;
  /**
   * Sofern im letzten Zug ein Bauer zwei Felder vorgerückt ist,
   * wird das übersprungene Feld angegeben, unabhängig davon,
   * ob ein en-passant-Schlag auf dieses Feld tatsächlich möglich ist oder nicht.
   * Nach Bauer f2–>f4 wird in der FEN in der 4. Gruppe „f3“ angegeben.
   */
  enPassant: string;
  /**
   * Beginnt mit 0 und wird bei jedem Halbzug, bei dem kein Bauer bewegt
   * oder eine Figur geschlagen wurde, um 1 erhöht.
   * -> 50-Züge-Regel: Remi-Antrag, wenn diese Zahl 100 ist. Remi bei 150.
   */
  halfmoveClock: number;
  /**
   * Beginnt mit 1 und wird nach jedem Zug von schwarz um 1 erhöht
   */
  fullmoveCount: number;
};
export let globalID = 0;

export class State {
  currState: gameState;
  nextStates?: State[];
  nextMoves?: moveType[];
  value?: number;
  id: number;

  constructor(currState: gameState) {
    this.currState = currState;
    this.id = ++globalID;
  }

  generateNextStates() {
    if (!this.nextStates) {
      this.nextMoves = new Moves(this.currState).moves;
      this.nextStates = this.nextMoves.map((o) => new State(o.newState));
    }
  }

  alphaBeta(depth: number, alpha: number, beta: number, isMax: boolean, stateHistory: string[], rootIsWhite: boolean) {
    this.generateNextStates();
    if (depth === 0 || isGameDone(this, this.nextMoves ? this.nextMoves : [], stateHistory)) {
      return (this.value = this.evaluateBoard(rootIsWhite));
    }
    if (isMax) {
      let value = alpha;
      for (const state of this.nextStates ? this.nextStates : []) {
        const newHist = [...stateHistory];
        newHist.push(toStateHistoryFEN(state.currState));
        const child = state.alphaBeta(depth - 1, value, beta, !isMax, newHist, rootIsWhite);
        value = value > child ? value : child;
        if (value >= beta) break;
      }
      return (this.value = value);
    } else {
      let value = beta;
      for (const state of this.nextStates ? this.nextStates : []) {
        const newHist = [...stateHistory];
        newHist.push(toStateHistoryFEN(state.currState));
        const child = state.alphaBeta(depth - 1, alpha, value, !isMax, newHist, rootIsWhite);
        value = value < child ? value : child;
        if (value <= alpha) break;
      }
      return (this.value = value);
    }
  }

  minimax(depth: number, isMax: boolean, rootIsWhite: boolean, stateHistory: string[]) {
    this.generateNextStates();
    if (depth === 0 || isGameDone(this, this.nextMoves ? this.nextMoves : [], stateHistory)) {
      return (this.value = this.evaluateBoard(rootIsWhite));
    }
    if (isMax) {
      let value = -1000000;
      for (const child of this.nextStates ? this.nextStates : []) {
        const newHist = [...stateHistory];
        newHist.push(toStateHistoryFEN(child.currState));
        value = Math.max(value, child.minimax(depth - 1, false, rootIsWhite, newHist));
      }
      return (this.value = value);
    } else {
      let value = 1000000;
      for (const child of this.nextStates ? this.nextStates : []) {
        const newHist = [...stateHistory];
        newHist.push(toStateHistoryFEN(child.currState));
        value = Math.min(value, child.minimax(depth - 1, true, rootIsWhite, newHist));
      }
      return (this.value = value);
    }
  }

  pickNext() {
    const bestStates = this.getBestNext();
    const pickedState = bestStates.length > 1 ? bestStates[Math.floor(Math.random() * bestStates.length)] : bestStates[0];
    const move = this.getMoveOfNext(pickedState);
    console.log(`Picked move: ${move} Value: ${pickedState.value} Checked States: ${globalID}`);
    return pickedState;
  }

  getBestNext() {
    if (!this.nextStates) throw Error("nextStates has no states");
    const highestValue = this.nextStates
      .map((o) => o.value)
      .reduce((prev, curr) => {
        if (curr === undefined) return prev;
        if (prev === undefined) return curr;
        return prev > curr ? prev : curr;
      });
    return this.nextStates.filter((o) => o.value === highestValue);
  }

  getMoveOfNext(nextState: State) {
    if (this.nextStates && this.nextMoves) {
      const pickIndex = this.nextStates.findIndex((o) => o.id === nextState.id);
      return this.nextMoves[pickIndex].move;
    }
    return "";
  }

  evaluateBoard(playsWhite: boolean): number {
    this.value = 0;
    for (const row of this.currState.board) {
      for (const cell of row) {
        if (cell === "") continue;
        const colorFactor = playsWhite === isWhite(cell) ? 1 : -1;
        switch (cell) {
          case "P":
            this.value += colorFactor * 1;
            break;
          case "N":
            this.value += colorFactor * 3;
            break;
          case "B":
            this.value += colorFactor * 3;
            break;
          case "R":
            this.value += colorFactor * 5;
            break;
          case "Q":
            this.value += colorFactor * 9;
            break;
          case "K":
            this.value += colorFactor * 1000;
            break;
          case "p":
            this.value += colorFactor * 1;
            break;
          case "n":
            this.value += colorFactor * 3;
            break;
          case "b":
            this.value += colorFactor * 3;
            break;
          case "r":
            this.value += colorFactor * 5;
            break;
          case "q":
            this.value += colorFactor * 9;
            break;
          case "k":
            this.value += colorFactor * 1000;
            break;
        }
      }
    }

    if (isColorKingOfTheHill(this.currState, true) && playsWhite) this.value = 10000;
    if (isColorKingOfTheHill(this.currState, false) && !playsWhite) this.value = 10000;
    if (this.nextStates && this.nextStates.length === 0) this.value = 10000;
    return this.value;
  }

  wipeData() {
    delete this.nextStates;
  }

  countGeneratedStates() {
    let sum = 0;
    if (this.nextStates && this.nextStates.length > 0) {
      this.nextStates.forEach((state) => {
        sum += state.countGeneratedStates();
      });
    }
    return 1 + sum;
  }
}
