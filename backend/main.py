from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
from engine_v1.ChessEngine import ChessEngine as ChessEngineV1
from engine_v2.ChessEngine import ChessEngine as ChessEngineV2

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MoveRequest(BaseModel):
    fen: str
    depth: int = 3
    engine_version: int = 1  # 1 for v1, 2 for v2

class MoveResponse(BaseModel):
    move: str

engine1 = ChessEngineV1()
engine2 = ChessEngineV2()
engines = [engine1, engine2]

@app.post("/get-move")
async def get_move(request: MoveRequest) -> MoveResponse:
    board = chess.Board(request.fen)
    engine = engines[request.engine_version - 1]
    best_move = engine.get_best_move(board, request.depth)
    return MoveResponse(move=str(best_move)) 
