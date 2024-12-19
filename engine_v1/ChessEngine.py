# engine_v1.py/ChessEngine.py
'''
This is the first version of the chess engine.
It uses a simple material counting algorithm to evaluate the board along with a minimax algorithm and alpha-beta pruning to find the best move.
'''
import chess
import chess.polyglot
from typing import Optional, Tuple

class ChessEngine:
    def __init__(self):
        
        self.piece_values = {
            chess.PAWN: 100,
            chess.KNIGHT: 320,
            chess.BISHOP: 330,
            chess.ROOK: 500,
            chess.QUEEN: 900,
            chess.KING: 20000
        }

    def evaluate_board(self, board: chess.Board) -> float:
        """
        Evaluates the current board position
        Returns positive score if white is better, negative if black is better
        """
        if board.is_checkmate():
            return -20000 if board.turn else 20000
        
        if board.is_stalemate() or board.is_insufficient_material():
            return 0
        
        score = 0
        
        # Material counting
        for square in chess.SQUARES:
            piece = board.piece_at(square)
            if piece is not None:
                value = self.piece_values[piece.piece_type]
                if piece.color == chess.WHITE:
                    score += value
                    
                    
                else:
                    score -= value
                    
                    
        
        return score

    def minimax(self, board: chess.Board, depth: int, alpha: float, beta: float, 
                maximizing_player: bool) -> Tuple[float, Optional[chess.Move]]:
        """
        Minimax algorithm with alpha-beta pruning
        Returns the evaluation score and the best move
        """
        if depth == 0 or board.is_game_over():
            return self.evaluate_board(board), None
        
        best_move = None
        
        if maximizing_player:
            max_eval = float('-inf')
            for move in board.legal_moves:
                board.push(move)
                eval, _ = self.minimax(board, depth - 1, alpha, beta, False)
                board.pop()
                
                if eval > max_eval:
                    max_eval = eval
                    best_move = move
                
                alpha = max(alpha, eval)
                if beta <= alpha:
                    break
            
            return max_eval, best_move
        
        else:
            min_eval = float('inf')
            for move in board.legal_moves:
                board.push(move)
                eval, _ = self.minimax(board, depth - 1, alpha, beta, True)
                board.pop()
                
                if eval < min_eval:
                    min_eval = eval
                    best_move = move
                
                beta = min(beta, eval)
                if beta <= alpha:
                    break
            
            return min_eval, best_move

    def get_best_move(self, board: chess.Board, depth: int = 3) -> chess.Move:
        """
        Returns the best move for the current position
        """
        _, best_move = self.minimax(board, depth, float('-inf'), float('inf'), 
                                  board.turn == chess.WHITE)
        return best_move

# Example usage
def play_game():
    board = chess.Board()
    engine = ChessEngine()
    
    while not board.is_game_over():
        print(board)
        
        if board.turn == chess.WHITE:
            # Human plays white
            move = input("Enter your move (e.g., 'e2e4'): ")
            board.push_san(move)
        else:
            # Engine plays black
            move = engine.get_best_move(board)
            board.push(move)
            print(f"Engine plays: {move}")
    
    print("Game Over")
    print(f"Result: {board.result()}")

if __name__ == "__main__":
    play_game()
