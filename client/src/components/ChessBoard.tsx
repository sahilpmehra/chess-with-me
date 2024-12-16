import React, { useEffect, useState } from "react";
import { Chess, Square, PieceSymbol, Color } from "chess.js";

const ChessBoard = () => {
  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState(game.board());
  const [from, setFrom] = useState<Square | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const getEngineMove = async () => {
    setIsThinking(true);
    try {
      const response = await fetch('http://localhost:8000/get-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen: game.fen(),
          depth: 5
        }),
      });

      const data = await response.json();
      game.move(data.move);
      setBoard(game.board());
    } catch (error) {
      console.error('Error getting engine move:', error);
    }
    setIsThinking(false);
  };

  const makeMove = (from: Square, to: Square) => {
    try {
      game.move({ from, to, promotion: 'q' });
      setBoard(game.board());

      // After player moves, get engine's move
      if (!game.isGameOver()) {
        getEngineMove();
      }
    } catch (error) {
      console.log("Invalid Move!");
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
    <div id="board-container" className="flex aspect-square max-h-[90vh] max-w-[90vw] flex-col rounded-md">
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
  );
};

export default ChessBoard;
