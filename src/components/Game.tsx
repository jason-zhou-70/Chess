import { useState, useMemo, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

function Game() {
    const chess: Chess = useMemo(() => new Chess(), []);
    const [fen, setFen] = useState(chess.fen());

    const makeMove = useCallback((move: any) => {
        try {
            const result = chess.move(move);
            setFen(chess.fen());

            return result;
        }
        catch (e) {
            return null;
        }
    }, [chess])

    function onDrop(sourceSquare: string, targetSquare: string): boolean {
        const moveData = {
            from: sourceSquare,
            to: targetSquare,
            color: chess.turn()
        };

        const move = makeMove(moveData)

        if (move === null) {
            return false;
        }

        return true;
    };

    return (

        <div>
            <Chessboard position={fen} onPieceDrop={onDrop} />
        </div>

    );
};

export default Game;