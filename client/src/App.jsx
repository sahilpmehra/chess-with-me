import ChessBoard from "./components/ChessBoard";

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4">
      <h1 className="mb-8 text-3xl font-bold text-white">
        Chess Engine Battle
      </h1>
      <ChessBoard />
    </div>
  );
}

export default App;
