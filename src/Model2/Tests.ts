import { parseFEN, toFEN } from "./Parser";
import { State } from "./State";

type result = {
  name: string;
  state: State;
  searchDepth: number;
  bestMoves: string[];
  averageValue: number;
  averageTime: number;
  generatedStates: number;
};

//Test data set
const startGameFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const midGameFEN = "r1br2k1/pppp1pp1/7p/2b1p3/2Pn4/4QN2/PP2PPBP/RN3RK1 w - - 0 1";
const endGameFEN = "8/p3k3/5N2/4P3/8/B7/8/K7 b - - 0 1";
const [startGameSplit, midGameSplit, endGameSplit] = [startGameFEN, midGameFEN, endGameFEN].map((o) => o.split(/\s+/));
const [startGame, midGame, endGame] = [startGameSplit, midGameSplit, endGameSplit].map(
  (o) =>
    new State({
      board: parseFEN(o[0]),
      isWhiteTurn: o[1] === "w",
      castleRight: o[2],
      enPassant: o[3],
      halfmoveClock: parseInt(o[4]),
      fullmoveCount: parseInt(o[5]),
    })
);
const testStates = [
  { label: "start game", state: startGame },
  { label: "mid game", state: midGame },
  { label: "end game", state: endGame },
];

export function runTests() {
  checkEvaluator();
  checkAlgorithms(3, 10);
}

function checkEvaluator() {
  logHeader("Evaluation");
  testStates.forEach(({ label, state }) => {
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += state.evaluateBoard(state.currState.isWhiteTurn);
    }
    const avg = sum / 1000;
    console.log(
      `
state: ${toFEN(state.currState)} (${label})
Average value: ${avg}

`
    );
  });
}

function checkAlgorithms(maxDepth: number, iterations: number) {
  const resultsMinMax = checkMinimax(maxDepth, iterations);
  const resultsAlphaBeta = checkAlphaBeta(maxDepth, iterations);
  logHeader("Comparison");
  for (const i in resultsAlphaBeta) {
    const mm = resultsMinMax[i];
    const ab = resultsAlphaBeta[i];
    const timeDiff = ab.averageTime - mm.averageTime;
    const stateDiff = ab.generatedStates - mm.generatedStates;
    const mmSpeed = Math.round(mm.generatedStates / (mm.averageTime / 1000));
    const abSpeed = Math.round(ab.generatedStates / (ab.averageTime / 1000));
    const speedDiff = abSpeed - mmSpeed;
    console.log(
      `
State: ${toFEN(ab.state.currState)} (${ab.name})
Search depth: ${ab.searchDepth}

AlphaBeta vs. Minimax
-        Average value: ${ab.averageValue} vs. ${mm.averageValue}
-   Average time in ms: ${ab.averageTime} vs. ${mm.averageTime} => ${timeDiff > 0 ? "+" + timeDiff : timeDiff}
-     Generated states: ${ab.generatedStates} vs. ${mm.generatedStates} => ${stateDiff > 0 ? "+" + stateDiff : stateDiff}
-      Average state/s: ${abSpeed} vs. ${mmSpeed} => ${speedDiff > 0 ? "+" + speedDiff : speedDiff}
`
    );
  }
}

function checkMinimax(maxDepth: number, iterations: number) {
  logHeader("Minimax");
  const results: result[] = [];
  testStates.forEach(({ label, state }) => {
    for (let depth = 1; depth <= maxDepth; depth++) {
      let sumOfValues = 0;
      let sumOfTime = 0;
      for (let i = 0; i < iterations; i++) {
        const startAt = Date.now();
        sumOfValues += state.minimax(depth, true, state.currState.isWhiteTurn, []);
        const endAt = Date.now();
        sumOfTime += endAt - startAt;
      }
      const data: result = {
        name: label,
        state: state,
        searchDepth: depth,
        bestMoves: state.getBestNext().map((o) => state.getMoveOfNext(o)),
        averageValue: sumOfValues / iterations,
        averageTime: sumOfTime / iterations,
        generatedStates: state.countGeneratedStates(),
      };
      logData(data);
      results.push(data);
      state.wipeData();
    }
  });
  return results;
}

function checkAlphaBeta(maxDepth: number, iterations: number) {
  logHeader("AlphaBeta");
  const results: result[] = [];
  testStates.forEach(({ label, state }) => {
    for (let depth = 1; depth <= maxDepth; depth++) {
      let sumOfValues = 0;
      let sumOfTime = 0;
      for (let i = 0; i < iterations; i++) {
        const startAt = Date.now();
        sumOfValues += state.alphaBeta(depth, -10000, 10000, true, [], state.currState.isWhiteTurn);
        const endAt = Date.now();
        sumOfTime += endAt - startAt;
      }
      const data: result = {
        name: label,
        state: state,
        searchDepth: depth,
        bestMoves: state.getBestNext().map((o) => state.getMoveOfNext(o)),
        averageValue: sumOfValues / iterations,
        averageTime: sumOfTime / iterations,
        generatedStates: state.countGeneratedStates(),
      };
      logData(data);
      results.push(data);
      state.wipeData();
    }
  });
  return results;
}

function logHeader(str: string) {
  const headerStyle = "font-size: 20px; font-weight: bold; background: black; color: white";
  console.log("\n" + `%c${str}` + "\n", headerStyle);
}

function logData(data: result) {
  console.log(
    `
State: ${toFEN(data.state.currState)}  (${data.name})
Search depth: ${data.searchDepth}

  -       Best moves: ${data.bestMoves.reduce((acc, curr) => acc + " " + curr)}
  -    Average value: ${data.averageValue}
  -     Average time: ${data.averageTime} ms
  - Generated states: ${data.generatedStates}
  -    Average speed: ${Math.round(data.generatedStates / (data.averageTime / 1000))} state/s
  
`
  );
}
