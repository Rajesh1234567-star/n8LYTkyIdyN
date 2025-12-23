import type { Board, Piece, Position, PieceColor, PieceType } from "./chess-types"

export function initializeBoard(): Board {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Set up pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: "pawn", color: "black", hasMoved: false }
    board[6][col] = { type: "pawn", color: "white", hasMoved: false }
  }

  // Set up other pieces
  const backRow: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]

  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRow[col], color: "black", hasMoved: false }
    board[7][col] = { type: backRow[col], color: "white", hasMoved: false }
  }

  return board
}

export function isValidMove(board: Board, from: Position, to: Position, currentTurn: PieceColor): boolean {
  const piece = board[from.row][from.col]
  if (!piece || piece.color !== currentTurn) return false

  const targetPiece = board[to.row][to.col]
  if (targetPiece && targetPiece.color === piece.color) return false

  if (from.row === to.row && from.col === to.col) return false

  // Check if move is valid for the piece type
  if (!isPieceMovementValid(board, from, to, piece)) return false

  // Check if move would leave king in check
  const newBoard = simulateMove(board, from, to)
  if (isKingInCheck(newBoard, piece.color)) return false

  return true
}

function isPieceMovementValid(board: Board, from: Position, to: Position, piece: Piece): boolean {
  const rowDiff = to.row - from.row
  const colDiff = to.col - from.col
  const targetPiece = board[to.row][to.col]

  switch (piece.type) {
    case "pawn":
      return isPawnMoveValid(board, from, to, piece, rowDiff, colDiff)
    case "rook":
      return isRookMoveValid(board, from, to, rowDiff, colDiff)
    case "knight":
      return isKnightMoveValid(rowDiff, colDiff)
    case "bishop":
      return isBishopMoveValid(board, from, to, rowDiff, colDiff)
    case "queen":
      return isRookMoveValid(board, from, to, rowDiff, colDiff) || isBishopMoveValid(board, from, to, rowDiff, colDiff)
    case "king":
      return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1
    default:
      return false
  }
}

function isPawnMoveValid(
  board: Board,
  from: Position,
  to: Position,
  piece: Piece,
  rowDiff: number,
  colDiff: number,
): boolean {
  const direction = piece.color === "white" ? -1 : 1
  const startRow = piece.color === "white" ? 6 : 1
  const targetPiece = board[to.row][to.col]

  // Move forward one square
  if (colDiff === 0 && rowDiff === direction && !targetPiece) {
    return true
  }

  // Move forward two squares from starting position
  if (
    colDiff === 0 &&
    rowDiff === direction * 2 &&
    from.row === startRow &&
    !targetPiece &&
    !board[from.row + direction][from.col]
  ) {
    return true
  }

  // Capture diagonally
  if (Math.abs(colDiff) === 1 && rowDiff === direction && targetPiece && targetPiece.color !== piece.color) {
    return true
  }

  return false
}

function isRookMoveValid(board: Board, from: Position, to: Position, rowDiff: number, colDiff: number): boolean {
  if (rowDiff !== 0 && colDiff !== 0) return false
  return isPathClear(board, from, to)
}

function isBishopMoveValid(board: Board, from: Position, to: Position, rowDiff: number, colDiff: number): boolean {
  if (Math.abs(rowDiff) !== Math.abs(colDiff)) return false
  return isPathClear(board, from, to)
}

function isKnightMoveValid(rowDiff: number, colDiff: number): boolean {
  return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
}

function isPathClear(board: Board, from: Position, to: Position): boolean {
  const rowStep = to.row > from.row ? 1 : to.row < from.row ? -1 : 0
  const colStep = to.col > from.col ? 1 : to.col < from.col ? -1 : 0

  let currentRow = from.row + rowStep
  let currentCol = from.col + colStep

  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol]) return false
    currentRow += rowStep
    currentCol += colStep
  }

  return true
}

export function makeMove(board: Board, from: Position, to: Position): Board {
  const newBoard = board.map((row) => [...row])
  const piece = newBoard[from.row][from.col]

  if (piece) {
    newBoard[to.row][to.col] = { ...piece, hasMoved: true }
    newBoard[from.row][from.col] = null

    // Pawn promotion
    if (piece.type === "pawn" && (to.row === 0 || to.row === 7)) {
      newBoard[to.row][to.col] = { ...piece, type: "queen", hasMoved: true }
    }
  }

  return newBoard
}

function simulateMove(board: Board, from: Position, to: Position): Board {
  return makeMove(board, from, to)
}

export function isKingInCheck(board: Board, color: PieceColor): boolean {
  // Find the king
  let kingPos: Position | null = null
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.type === "king" && piece.color === color) {
        kingPos = { row, col }
        break
      }
    }
    if (kingPos) break
  }

  if (!kingPos) return false

  // Check if any opponent piece can attack the king
  const opponentColor: PieceColor = color === "white" ? "black" : "white"
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === opponentColor) {
        if (isPieceMovementValid(board, { row, col }, kingPos, piece)) {
          return true
        }
      }
    }
  }

  return false
}

export function isCheckmate(board: Board, color: PieceColor): boolean {
  if (!isKingInCheck(board, color)) return false

  // Check if any move can get out of check
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol]
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(board, { row: fromRow, col: fromCol }, { row: toRow, col: toCol }, color)) {
              return false
            }
          }
        }
      }
    }
  }

  return true
}

export function isStalemate(board: Board, color: PieceColor): boolean {
  if (isKingInCheck(board, color)) return false

  // Check if any valid move exists
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol]
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(board, { row: fromRow, col: fromCol }, { row: toRow, col: toCol }, color)) {
              return false
            }
          }
        }
      }
    }
  }

  return true
}
