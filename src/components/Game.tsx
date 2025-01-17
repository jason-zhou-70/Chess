import { useState, useMemo, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import ReactModal from 'react-modal';
import { BoardOrientation } from 'react-chessboard/dist/chessboard/types';

function Game({playerColour}: {playerColour: string}) {
    const chess: Chess = useMemo(() => new Chess(), []);
    const [fen, setFen] = useState(chess.fen());
    const [orientation, setOrientation] = useState(playerColour);
    const [gameOver, setGameOver] = useState("");

    const makeMove = useCallback(
        // move param has source square, target square, and promotion if applicable
        (move: string | {
            from: string;
            to: string;
            promotion?: string;
        }) => {
            try {
                const result = chess.move(move);
                setFen(chess.fen());

                if (chess.isGameOver()) {
                    setGameOver(chess.isCheckmate() ? "Checkmate!" : "Stalemate!");
                }

                return result;
            }
            catch (e) {
                return null;
            }
    }, [chess])

    const makeComputerMove = useCallback(() => {
        const moves = chess.moves();
        if (chess.isGameOver() || moves.length === 0) {
            return;
        }
        const move = moves[Math.floor(Math.random() * moves.length)];
        makeMove(move);
    }, [chess]);
    
    function onDrop(sourceSquare: string, targetSquare: string): boolean {
        const moveData = {
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
        };
        
        const move = makeMove(moveData) 

        if (move === null) {
            return false;
        }
        makeComputerMove();
        return true;
    };

    return (
        <>
            <div>
                <Chessboard 
                    position={fen} 
                    onPieceDrop={onDrop} 
                    boardWidth={400} 
                    boardOrientation={orientation as BoardOrientation}
                    
                />

                <ReactModal isOpen={gameOver !== ""}>
                    <h1>{gameOver}</h1>
                    <button onClick={() => {
                        chess.reset();
                        if (orientation === "white") {
                            setOrientation("black");
                            makeComputerMove();
                        }
                        else {
                            setOrientation("white");
                        }
                        setFen(chess.fen());
                        setGameOver("");
                    }}>Reset</button>
                </ReactModal>
            </div>
        </>
    );
};

export default Game;