import React, { useEffect, useState } from "react";
import { Chess, Square, PieceSymbol, Color } from "chess.js";

type GameMode = "human" | "engine";

const ChessBoard = () => {
  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState(game.board());
  const [from, setFrom] = useState<Square | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("human");
  const [currentEngine, setCurrentEngine] = useState(1);
  const [moveDelay] = useState(100); // 1 second delay between moves in engine vs engine
  const [gameResult, setGameResult] = useState<string>("");

  const getEngineMove = async (engineVersion: number) => {
    setIsThinking(true);
    try {
      const response = await fetch('http://localhost:8000/get-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen: game.fen(),
          depth: 4, // TODO: make this dynamic
          engine_version: engineVersion
        }),
      });

      const data = await response.json();
      game.move(data.move);
      setBoard(game.board());

      if (game.isGameOver()) {
        let result = "";
        if (game.isCheckmate()) {
          result = game.turn() === 'w' ? "Black wins!" : "White wins!";
        } else if (game.isDraw()) {
          result = "Game drawn!";
          if (game.isStalemate()) {
            result += " (Stalemate)";
          } else if (game.isThreefoldRepetition()) {
            result += " (Threefold Repetition)";
          } else if (game.isInsufficientMaterial()) {
            result += " (Insufficient Material)";
          }
        }
        setGameResult(result);
      } else if (gameMode === "engine") {
        setTimeout(() => {
          setCurrentEngine(engineVersion === 1 ? 2 : 1);
          getEngineMove(engineVersion === 1 ? 2 : 1);
        }, moveDelay);
      }
    } catch (error) {
      console.error('Error getting engine move:', error);
    }
    setIsThinking(false);
  };

  const makeMove = (from: Square, to: Square) => {
    try {
      game.move({ from, to, promotion: 'q' });
      setBoard(game.board());

      if (!game.isGameOver() && gameMode === "human") {
        getEngineMove(0); // Use engine 0 against human
      }
    } catch (error) {
      console.log("Invalid Move!");
    }
  };

  const startNewGame = (mode: GameMode) => {
    setGame(new Chess());
    setBoard(game.board());
    setGameMode(mode);
    setIsThinking(false);
    setFrom(null);
    setGameResult("");

    if (mode === "engine") {
      setCurrentEngine(1);
      getEngineMove(currentEngine);
    }
  };

  const onSquareClick = (square: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null, i: number, j: number) => {
    if (isThinking) return;

    if (from) {
      const letter = String.fromCharCode(97 + j);
      const num = String(8 - i);
      const toNotation: Square = (letter + num) as Square;

      if (from === toNotation) {
        setFrom(null);
        return;
      }

      // If destination has a piece of same color, select that piece instead
      if (square && square.color === 'w') {
        setFrom(toNotation);
        return;
      }

      makeMove(from, toNotation);
      setFrom(null);
    } else {
      if (square && square.color === 'w') { // Only allow white moves
        setFrom(square.square);
      }
    }
  };

  const handleDragStart = (square: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null, i: number, j: number) => {
    //checking if it works with the same state variable 'from' as the click function
    if (square) {
      setFrom(square.square);
    }
  };

  const handleDrop = (e: React.DragEvent, square: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null, i: number, j: number) => {
    if (isThinking) return;

    e.preventDefault();
    if (from) {
      const letter = String.fromCharCode(97 + j);
      const num = String(8 - i);
      const toNotation: Square = (letter + num) as Square;
      makeMove(from, toNotation);
      setFrom(null);
    }
  };

  const squareRounding = (i, j) => {
    let roundingClass = "rounded-none";
    if (i === 0 && j === 0) {
      roundingClass = "rounded-tl-lg";
    } else if (i === 0 && j === 7) {
      roundingClass = "rounded-tr-lg";
    } else if (i === 7 && j === 0) {
      roundingClass = "rounded-bl-lg";
    } else if (i === 7 && j === 7) {
      roundingClass = "rounded-br-lg";
    }
    return roundingClass;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => startNewGame("human")}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Start Human vs Engine
        </button>
        <button
          onClick={() => startNewGame("engine")}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          Start Engine vs Engine
        </button>
      </div>

      <div className="text-white mb-4">
        {isThinking && gameMode === "human" && "Engine is thinking..."}
        {isThinking && gameMode === "engine" && `Engine ${currentEngine} is thinking...`}
        {!isThinking && gameMode === "human" && "Human's turn"}
        {!isThinking && gameMode === "engine" && `Engine ${3 - currentEngine}'s turn` /*  Reverse the engine number, i.e. 1 -> 2, 2 -> 1 */}
        {gameResult && <div className="font-bold text-xl">{gameResult}</div>}
      </div>

      <div id="board-container" className="flex h-[600px] w-[600px] flex-col rounded-md">
        {board.map((row, i) => {
          return (
            <div id="boardRow" key={i} className="flex flex-1">
              {row.map((square, j) => {
                return (
                  <div
                    id="boardSquare"
                    key={j}
                    onDrop={(e) => handleDrop(e, square, i, j)}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => {
                      onSquareClick(square, i, j);
                    }}
                    className={`flex-1 ${(i + j) % 2 === 0 ? ((square && from === square.square) ? "bg-yellow-200" : "bg-[#ebecd0]") : (square && from === square.square) ? "bg-green-500" : "bg-[#739552]"} ${(square && from === square.square) ? "" : ""} flex items-center justify-center ${squareRounding(i, j)}`}
                  >
                    {square ? (
                      <img id="boardPiece" onDragStart={() => handleDragStart(square, i, j)} src={`/${square.color + square.type}.png`}></img>
                    ) : (
                      ""
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChessBoard;
