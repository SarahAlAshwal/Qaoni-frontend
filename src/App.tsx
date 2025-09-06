import './App.css'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Tailwind is working 🎉
        </h1>
        <p className="text-gray-600">
          Vite + React + TypeScript + Tailwind v4
        </p>
        <button className="mt-6 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
          Test Button
        </button>
      </div>
    </div>
  )
}


export default App
