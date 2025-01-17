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

    // Evaluate the value of the position by checking how many pieces each side has on the board
    // Rook = 5, Bishop/Knight = 3, Queen = 8, Pawn = 1
    // Lower-case = black, upper-case = white
    function evaluate(): number {
        // Extract the position of the piece from the FEN to count each piece
        const pos: string = chess.fen().split(' ', 1)[0];
        let evaluation: number = 0;
        for (let i = 0; i < pos.length; i++) {
            switch (pos[i]) {
                case 'r':
                    evaluation -= 5;
                    break;
                case 'b':
                case 'n':
                    evaluation -= 3;
                    break;
                case 'q':
                    evaluation -= 8;
                    break;
                case 'p':
                    evaluation -= 1;
                    break;
                case 'R':
                    evaluation += 5;
                    break;
                case 'B':
                case 'N':
                    evaluation += 3;
                    break;
                case 'Q':
                    evaluation += 8;
                    break;
                case 'P':
                    evaluation += 1;
                    break;
                default:
                    break;
            }
        }
        return evaluation;
    }

    // alpha starts at -Inf, beta starts at Inf
    function minimax(depth: number, alpha: number, beta: number): number {
        // Return evaluation if depth is reached
        if (depth == 0) {
            return evaluate();
        }
        // If position is in checkmate
        if (chess.isCheckmate()) {
            // Return small evaluation if white is in mate
            if (chess.turn() === 'w') {
                return -Infinity;
            }
            // Big evaluation if black is in mate
            else {
                return Infinity;
            }
        }
        if (chess.isDraw()) {
            return 0;
        }
        
        // Maximize if white
        if (chess.turn() === 'w') {
            let maxEval: number = -Infinity;
            const moves: string[] = chess.moves();
            for (let i = 0; i < moves.length; i++) {
                // Make the move, evaluate position, undo the move
                chess.move(moves[i]);
                let evaluation: number = minimax(depth - 1, alpha, beta);
                chess.undo();
                
                maxEval = Math.max(evaluation, maxEval);
                alpha = Math.max(maxEval, alpha);
                if (beta <= alpha) {
                    break;
                }
            }
            return maxEval;
        }
        // Minimize if black
        else {
            let minEval: number = Infinity;
            const moves: string[] = chess.moves();
            for (let i = 0; i < moves.length; i++) {
                chess.move(moves[i]);
                let evaluation: number = minimax(depth - 1, alpha, beta);
                chess.undo();
                minEval = Math.min(evaluation, minEval);
                beta = Math.min(minEval, beta);
                if (beta <= alpha) {
                    break;
                }
            }
            return minEval;
        }
    }

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
        const moves: string[] = chess.moves();
        if (chess.isGameOver() || moves.length === 0) {
            return;
        }
        let bestEval: number;
        // If computer is white, maximize bestEval
        if (chess.turn() === 'w') {
            bestEval = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                chess.move(moves[i]);
                let evaluation = minimax(3, -Infinity, Infinity);
                chess.undo();
                // If the eval for current move is lower than the best, remove the move from the list
                if (evaluation < bestEval) {
                    moves.splice(i, 1);
                    i -= 1;
                }
                // If its better than the current best, remove all the previous moves checked
                else if (evaluation > bestEval) {
                    bestEval = evaluation;
                    moves.splice(0, i);
                    i = 0;
                }
            }
        }
        // If computer is black, minimize bestEval
        else {
            bestEval = Infinity
            for (let i = 0; i < moves.length; i++) {
                chess.move(moves[i]);
                let evaluation = minimax(3, -Infinity, Infinity);
                chess.undo();
                if (evaluation > bestEval) {
                    moves.splice(i, 1);
                    i -= 1;
                }
                else if (evaluation < bestEval) {
                    bestEval = evaluation;
                    moves.splice(0, i);
                    i = 0;
                }
            }
        }
        makeMove(moves[Math.floor(Math.random() * moves.length)]);
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