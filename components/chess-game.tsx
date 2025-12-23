"use client"

import { useState } from "react"
import ChessBoard from "./chess-board"
import type { GameState, Position, PieceColor } from "@/lib/chess-types"
import { initializeBoard, isValidMove, makeMove, isKingInCheck, isCheckmate, isStalemate } from "@/lib/chess-logic"

export default function ChessGame() {
  const [gameState, setGameState] = useState<GameState>({
    board: initializeBoard(),
    currentTurn: "white",
    selectedSquare: null,
    validMoves: [],
    gameOver: false,
    winner: null,
    moveHistory: [],
  })

  const handleSquareClick = (position: Position) => {
    const piece = gameState.board[position.row][position.col]

    // If no square is selected
    if (!gameState.selectedSquare) {
      // Select a piece if it belongs to the current player
      if (piece && piece.color === gameState.currentTurn) {
        const validMoves = getValidMovesForPiece(position)
        setGameState({
          ...gameState,
          selectedSquare: position,
          validMoves,
        })
      }
      return
    }

    // If clicking the same square, deselect
    if (gameState.selectedSquare.row === position.row && gameState.selectedSquare.col === position.col) {
      setGameState({
        ...gameState,
        selectedSquare: null,
        validMoves: [],
      })
      return
    }

    // Check if the move is valid
    const isValid = gameState.validMoves.some((move) => move.row === position.row && move.col === position.col)

    if (isValid) {
      // Make the move
      const newBoard = makeMove(gameState.board, gameState.selectedSquare, position)
      const nextTurn: PieceColor = gameState.currentTurn === "white" ? "black" : "white"

      // Check for checkmate or stalemate
      const inCheckmate = isCheckmate(newBoard, nextTurn)
      const inStalemate = isStalemate(newBoard, nextTurn)

      setGameState({
        ...gameState,
        board: newBoard,
        currentTurn: nextTurn,
        selectedSquare: null,
        validMoves: [],
        gameOver: inCheckmate || inStalemate,
        winner: inCheckmate ? gameState.currentTurn : inStalemate ? "draw" : null,
        moveHistory: [...gameState.moveHistory, { from: gameState.selectedSquare, to: position }],
      })
    } else if (piece && piece.color === gameState.currentTurn) {
      // Select a different piece
      const validMoves = getValidMovesForPiece(position)
      setGameState({
        ...gameState,
        selectedSquare: position,
        validMoves,
      })
    } else {
      // Invalid move, deselect
      setGameState({
        ...gameState,
        selectedSquare: null,
        validMoves: [],
      })
    }
  }

  const getValidMovesForPiece = (position: Position): Position[] => {
    const moves: Position[] = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(gameState.board, position, { row, col }, gameState.currentTurn)) {
          moves.push({ row, col })
        }
      }
    }
    return moves
  }

  const resetGame = () => {
    setGameState({
      board: initializeBoard(),
      currentTurn: "white",
      selectedSquare: null,
      validMoves: [],
      gameOver: false,
      winner: null,
      moveHistory: [],
    })
  }

  const inCheck = isKingInCheck(gameState.board, gameState.currentTurn)

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Chess Game</h1>
        <div className="text-xl text-slate-300">
          {gameState.gameOver ? (
            <span className="font-semibold text-yellow-400">
              {gameState.winner === "draw" ? "Stalemate - Draw!" : `Checkmate! ${gameState.winner} wins!`}
            </span>
          ) : (
            <>
              <span className="capitalize font-semibold">{gameState.currentTurn}</span> to move
              {inCheck && <span className="ml-2 text-red-400 font-bold">• Check!</span>}
            </>
          )}
        </div>
      </div>

      <ChessBoard
        board={gameState.board}
        selectedSquare={gameState.selectedSquare}
        validMoves={gameState.validMoves}
        onSquareClick={handleSquareClick}
      />

      <button
        onClick={resetGame}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        New Game
      </button>
    </div>
  )
}
