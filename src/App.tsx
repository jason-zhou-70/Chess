import { useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import Game from './components/Game'
import './App.css'

function App() {

  return (
    <div>
      <Game />
    </div>
  )
}

export default App
