"use client"

import type { Piece } from "@/lib/chess-types"

interface ChessSquareProps {
  piece: Piece | null
  isLight: boolean
  isSelected: boolean
  isValidMove: boolean
  onClick: () => void
}

const pieceSymbols: Record<string, string> = {
  "white-king": "♔",
  "white-queen": "♕",
  "white-rook": "♖",
  "white-bishop": "♗",
  "white-knight": "♘",
  "white-pawn": "♙",
  "black-king": "♚",
  "black-queen": "♛",
  "black-rook": "♜",
  "black-bishop": "♝",
  "black-knight": "♞",
  "black-pawn": "♟",
}

export default function ChessSquare({ piece, isLight, isSelected, isValidMove, onClick }: ChessSquareProps) {
  const bgColor = isLight ? "bg-amber-100" : "bg-amber-800"
  const selectedStyle = isSelected ? "ring-4 ring-blue-500" : ""

  return (
    <button
      onClick={onClick}
      className={`
        w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-5xl md:text-6xl
        ${bgColor} ${selectedStyle} hover:brightness-110 transition-all relative
      `}
    >
      {piece && pieceSymbols[`${piece.color}-${piece.type}`]}
      {isValidMove && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-4 h-4 rounded-full ${piece ? "ring-4 ring-green-500" : "bg-green-500"} opacity-60`} />
        </div>
      )}
    </button>
  )
}
