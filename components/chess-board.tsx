"use client"

import type { Board, Position } from "@/lib/chess-types"
import ChessSquare from "./chess-square"

interface ChessBoardProps {
  board: Board
  selectedSquare: Position | null
  validMoves: Position[]
  onSquareClick: (position: Position) => void
}

export default function ChessBoard({ board, selectedSquare, validMoves, onSquareClick }: ChessBoardProps) {
  return (
    <div className="inline-block p-4 bg-slate-800 rounded-xl shadow-2xl">
      <div className="grid grid-cols-8 gap-0 border-4 border-slate-700">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const position: Position = { row: rowIndex, col: colIndex }
            const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex
            const isValidMove = validMoves.some((move) => move.row === rowIndex && move.col === colIndex)
            const isLight = (rowIndex + colIndex) % 2 === 0

            return (
              <ChessSquare
                key={`${rowIndex}-${colIndex}`}
                piece={piece}
                isLight={isLight}
                isSelected={isSelected}
                isValidMove={isValidMove}
                onClick={() => onSquareClick(position)}
              />
            )
          }),
        )}
      </div>
    </div>
  )
}
