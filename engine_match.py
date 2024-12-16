import chess
from typing import List, Tuple
import time

# Import both engine versions
# Assuming we have them in separate files or modules
from engine_v1.ChessEngine import ChessEngine as ChessEngineV1
from engine_v2.ChessEngine import ChessEngine as ChessEngineV2

class EngineMatch:
    def __init__(self, depth: int = 3):
        self.engine1 = ChessEngineV1()
        self.engine2 = ChessEngineV2()
        self.depth = depth
        self.board = chess.Board()
        self.move_history: List[str] = []
        self.time_per_move: List[Tuple[float, float]] = []  # (engine1_time, engine2_time)

    def play_game(self) -> str:
        move_count = 0
        
        while not self.board.is_game_over():
            print(f"\nMove {move_count + 1}")
            print(self.board)
            
            # Engine 1 plays white, Engine 2 plays black
            current_engine = self.engine1 if self.board.turn else self.engine2
            engine_name = "Engine1" if self.board.turn else "Engine2"
            
            # Time the move calculation
            start_time = time.time()
            move = current_engine.get_best_move(self.board, self.depth)
            end_time = time.time()
            
            # Store timing information
            move_time = end_time - start_time
            if self.board.turn:  # White's move
                self.time_per_move.append((move_time, 0))
            else:  # Black's move
                self.time_per_move[-1] = (self.time_per_move[-1][0], move_time)
            
            # Make the move
            self.board.push(move)
            self.move_history.append(str(move))
            
            print(f"{engine_name} plays: {move} (took {move_time:.2f} seconds)")
            move_count += 1
        
        return self.board.result()

    def print_statistics(self):
        print("\nGame Statistics:")
        print(f"Total Moves: {len(self.move_history)}")
        print(f"Final Result: {self.board.result()}")
        
        # Calculate average time per move
        engine1_times = [t[0] for t in self.time_per_move]
        engine2_times = [t[1] for t in self.time_per_move]
        
        print(f"\nEngine1 (White) Statistics:")
        print(f"Average time per move: {sum(engine1_times)/len(engine1_times):.2f} seconds")
        print(f"Total time: {sum(engine1_times):.2f} seconds")
        
        print(f"\nEngine2 (Black) Statistics:")
        print(f"Average time per move: {sum(engine2_times)/len(engine2_times):.2f} seconds")
        print(f"Total time: {sum(engine2_times):.2f} seconds")
        
        # print("\nMove History:")
        # for i, move in enumerate(self.move_history):
        #     if i % 2 == 0:
        #         print(f"{(i//2)+1}. {move}", end=" ")
        #     else:
        #         print(f"{move}")

def main():
    # Play multiple games if needed
    num_games = 1
    results = []
    
    for game in range(num_games):
        print(f"\nStarting Game {game + 1}")
        match = EngineMatch(depth=4)
        result = match.play_game()
        results.append(result)
        match.print_statistics()
    
    if num_games > 1:
        print("\nOverall Results:")
        print(f"Games played: {num_games}")
        print(f"Engine1 wins: {results.count('1-0')}")
        print(f"Engine2 wins: {results.count('0-1')}")
        print(f"Draws: {results.count('1/2-1/2')}")

if __name__ == "__main__":
    main()