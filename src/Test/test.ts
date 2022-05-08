import { Chess } from "chess.js";
import { Moves } from "../Model/Moves";
import { parseFEN } from "../Model/Parser";

const data = [
  {
    position: "Stellung 1 Startstellung",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  },
  {
    position: "Stellung Giuoco Piano (Gruppe AI)",
    fen: "rnbqkbnr/1pppppp1/p6p/8/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 3",
  },
  {
    position: "Stellung Dutch Defense (Gruppe AI)",
    fen: "rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
  },
  {
    position: "Stellung nicht erlaubter En passant (Gruppe B)",
    fen: "rnbqkbnr/pp1p1ppp/4p3/1Pp5/8/2N5/P1PPPPPP/R1BQKBNR w KQkq - 0 1",
  },
  {
    position: "Stellung Rochade (Gruppe H)",
    fen: "1rbqk2r/3nBppp/p2p4/3Qp3/Pp2P3/6PB/1PP1NP1P/R3K2R w KQkq - 0 1",
  },
  {
    position: "Weißer König steht im Schach (Gruppe E)",
    fen: "rnb1kbnr/pp1ppppp/2p5/q7/8/3P1P2/PPP1P1PP/RNBQKBNR w KQkq - 0 1",
  },
  {
    position: "schwarz am Zug, Zwei schwarze Damen und Bauern (Gruppe E)",
    fen: "7k/7q/5pqp/6p1/NP3P1P/1KP3P1/2B5/8 b - - 0 1",
  },
  {
    position: "Stelllung Rochade und Pin (Gruppe F)",
    fen: "r2kq3/3r4/8/8/7b/p7/P3BN2/R3K2R w KQq - 0 1",
  },
  {
    position: "Stellung Kolision (Gruppe F)",
    fen: "r7/P1P5/p7/P4k2/n7/P1P2K2/1BP2PBN/1QR2R1n w - - 0 1",
  },
  {
    position: "Stellung schwarz Rochade (Gruppe G)",
    fen: "B3k2r/p1pqbppp/n2p3n/4p3/6b1/1PPPP1P1/P4P1P/RNBQK1NR b KQk - 0 16",
  },
  {
    position:
      "Stellung weiß en passant pseudo-legal, aber nicht legal (Gruppe G)",
    fen: "rnb1kbnr/ppp2ppp/8/K2pP2q/5p2/3P4/PPP1B1PP/RNBQ2NR w - d6 0 14",
  },
  {
    position: "Stellung En Passant (Gruppe H)",
    fen: "r1bq1r2/pp2n3/4N2k/3pPppP/1b1n2Q1/2N5/PP3PP1/R1B1K2R w KQkq - 0 1",
  },
  {
    position: "Stellung Endgame 1 (Gruppe R)",
    fen: "6k1/B5q1/KR6/8/8/8/6p1/8 w - - 0 1",
  },
  {
    position: "Stellung Endgame Reverse - mit Bauernumwandlung (Gruppe R)",
    fen: "6k1/B5q1/KR6/8/8/8/6p1/8 b - - 0 1",
  },
  {
    position: "Stellung Rochade (Gruppe AF)",
    fen: "r3k2r/ppp1npbp/b3p1p1/8/8/4P3/PPP2PPP/R3K2R w KQkq - 0 1",
  },
  {
    position: "Stellungen I (Gruppe O)",
    fen: "r1b3k1/ppb2ppp/8/2B1p1P1/1P2N2P/P3P3/2P2P2/3rK2R w - - 0 19",
  },
  {
    position: "Stellungen II (Gruppe O)",
    fen: "8/8/6k1/5n2/5P2/7p/2KN4/8 w - - 0 57",
  },
  {
    position: "Stellung Mittelspiel Gruppe V",
    fen: "r3k1nr/pp3ppp/3p4/3P4/8/3P4/PP3PPP/RN2K2R w KQkq - 0 1",
  },
  {
    position: "Stellung Endspiel Gruppe V",
    fen: "8/8/1k6/8/8/8/6K1/8 b - - 0 1",
  },
  {
    position: "Stellung King of the Hill (Gruppe L)",
    fen: "1r6/8/2pbk1p1/p4p2/2KPnP2/4P3/PB4PP/5R2 w - - 0 1",
  },
  {
    position: "Stellung (Gruppe L)",
    fen: "2R5/2r2bkp/2n4p/1p6/4p2N/2K1n3/7B/8 w - - 0 1",
  },
  {
    position: "Stellung I (Gruppe J)",
    fen: "3k4/8/8/8/8/8/7r/3K4 w - - 0 1",
  },
  {
    position: "Stellung I (Gruppe M)",
    fen: "rnq1kb1r/p1ppppp1/1p6/7p/2PPb1nP/5N2/PP3P2/RNBQKBR1 w Qkq - 0 8",
  },
  {
    position: "Stellung II (Gruppe M)",
    fen: "1rbqk3/p1p3p1/np1p1n1r/B1b1pp1p/2P4P/3PP1P1/PP1QBP2/RN3KNR b - - 1 11",
  },
  {
    position: "Stellung II (Gruppe J)",
    fen: "r1bqkbnr/pppppppp/2n5/8/8/2N5/PPPPPPPP/R1BQKBNR w KQkq - 0 1",
  },
  {
    position: "Stellung I (Gruppe A)",
    fen: "2bqk2r/ppp4p/3npp2/n7/2pPPbBR/1Pr2N2/PBP4P/RN1QK3 w Qk - 0 1",
  },
  {
    position: "Stellung II (Gruppe A)",
    fen: "7k/1P4pp/4B3/3b1n2/6P1/5P2/3P2N1/3KQ3 w - - 0 1",
  },
  {
    position: "Queen's gambit (Gruppe C)",
    fen: "rnbkqbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBKQBNR b KQkq - 0 2",
  },
  {
    position: "Stellung 1 (Gruppe Q)",
    fen: "5k1r/8/4B3/8/8/8/P7/KQ1N4 w - - 3 40",
  },
  {
    position: "Stellung 2 (Gruppe Q)",
    fen: "5k1r/8/4B3/p7/PP6/8/P7/KQ1N4 b - - 0 30",
  },
  {
    position: "Stellung 1: Start (Gruppe S)",
    fen: ": rnbqkb1r/ppp1pppp/5n2/3p4/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 1",
  },
  {
    position: "Stellung 2: Endspiel mit Turm (Gruppe S)",
    fen: "8/8/8/8/2R5/6pk/1r6/6K1 w - – 0 51",
  },
];

export const runTest = () => {
  console.log("============================================");
  data.forEach((obj) => {
    console.log(obj.position);
    const splittedFEN = obj.fen.split(/\s+/);
    const state = {
      board: parseFEN(splittedFEN[0]),
      isWhiteTurn: splittedFEN[1] === "w",
      castleRight: splittedFEN[2],
      enPassant: splittedFEN[3],
      halfmoveClock: parseInt(splittedFEN[4]),
      fullmoveCount: parseInt(splittedFEN[5]),
    };
    const libMoves = new Chess(obj.fen).moves();
    const ownMoves = new Moves(state).getMoves().map((val) => {
      return val.move;
    });
    console.log(libMoves);
    console.log(ownMoves);
  });
  console.log("============================================");
};
