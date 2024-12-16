from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
from engine.ChessEngine import ChessEngine

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

class MoveResponse(BaseModel):
    move: str

engine = ChessEngine()

@app.post("/get-move")
async def get_move(request: MoveRequest) -> MoveResponse:
    board = chess.Board(request.fen)
    best_move = engine.get_best_move(board, request.depth)
    return MoveResponse(move=str(best_move)) 