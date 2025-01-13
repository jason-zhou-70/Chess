import { useState } from 'react'
import ReactModal from 'react-modal'
import Game from './components/Game'
import './App.css'

function App() {
  const [playerColour, setPlayerColour] = useState("white")
  const [gameStarted, setGameStarted] = useState(false)

  return (
    <div>
      <ReactModal isOpen={!gameStarted}>
        <h1>Choose your colour</h1>

        <button onClick={() => {
          setPlayerColour("white")
          setGameStarted(true)
        }}>White</button>

        <button onClick={() => {
          setPlayerColour("black")
          setGameStarted(true)
        }}>Black</button>
      </ReactModal>
      {gameStarted && <Game playerColour={playerColour} />}
    </div>
  )
}

export default App
