export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn"
export type PieceColor = "white" | "black"

export interface Piece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

export interface Position {
  row: number
  col: number
}

export type Board = (Piece | null)[][]

export interface Move {
  from: Position
  to: Position
}

export interface GameState {
  board: Board
  currentTurn: PieceColor
  selectedSquare: Position | null
  validMoves: Position[]
  gameOver: boolean
  winner: PieceColor | "draw" | null
  moveHistory: Move[]
}
