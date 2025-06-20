import { useState, useMemo, useCallback, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import CustomDialog from "./components/CustomDialog";
import socket from "./Socket";
import customWhiteKing from '../src/assets/images/girl-search.jpeg';
import girlSearch from "../src/assets/images/girl-search.jpeg"
import {
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    Stack,
    Typography,
    Box,
} from "@mui/material";


function Game({ players, room, orientation, cleanup }) {
    const chess = useMemo(() => new Chess(), []); // <- 1
    const [fen, setFen] = useState(chess.fen()); // <- 2
    const [over, setOver] = useState("");
    const customPieces = {
        wK: customWhiteKing, // Use the imported image
        // Add other pieces similarly
    };
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false); // This is the function passed to `CustomDialog` to close it
    };

    const makeAMove = useCallback(
        (move) => {
            try {
                const result = chess.move(move); // update Chess instance
                setFen(chess.fen()); // update fen state to trigger a re-render

                console.log("over, checkmate", chess.isGameOver(), chess.isCheckmate());

                if (chess.isGameOver()) { // check if move led to "game over"
                    if (chess.isCheckmate()) { // if reason for game over is a checkmate
                        // Set message to checkmate.
                        setOver(
                            `Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`
                        );
                        // The winner is determined by checking which side made the last move
                    } else if (chess.isDraw()) { // if it is a draw
                        setOver("Draw"); // set message to "Draw"
                    } else {
                        setOver("Game over");
                    }
                }

                return result;
            } catch (e) {
                return null;
            } // null if the move was illegal, the move object if the move was legal
        },
        [chess]
    );
// ...


    // onDrop function
    function onDrop(sourceSquare, targetSquare) {
        // orientation is either 'white' or 'black'. game.turn() returns 'w' or 'b'
        if (chess.turn() !== orientation[0]) return false; // <- 1 prohibit player from moving piece of other player

        if (players.length < 2) return false; // <- 2 disallow a move if the opponent has not joined

        const moveData = {
            from: sourceSquare,
            to: targetSquare,
            color: chess.turn(),
            promotion: "q", // promote to queen where possible
        };

        const move = makeAMove(moveData);

        // illegal move
        if (move === null) return false;

        socket.emit("move", { // <- 3 emit a move event.
            move,
            room,
        }); // this event will be transmitted to the opponent via the server

        return true;
    }

    useEffect(() => {
        socket.on('playerDisconnected', (player) => {
            setOver(`${player.username} has disconnected`); // set game over
        });
    }, []);

    useEffect(() => {
        socket.on('closeRoom', ({ roomId }) => {
            if (roomId === room) {
                cleanup();
            }
        });
    }, [room, cleanup]);
    useEffect(() => {
        console.log(players.length)
    }, [players]);
    useEffect(() => {
        socket.on("move", (move) => {
            makeAMove(move); //
        });
    }, [makeAMove]);


    // Game component returned jsx
    return (
        <Stack>
            <div className={"room-id-container"}>
                <CardContent>
                    <Typography variant="h5">Room ID: {room}</Typography>
                </CardContent>
            </div>
            <div className={"chessboard-area"}>
                <div className="board" style={{
                    maxWidth: 650,
                    maxHeight: 650,
                    flexGrow: 1,
                }}>
                    <Chessboard
                        position={fen}
                        onPieceDrop={onDrop}
                        boardOrientation={orientation}
                    />
                </div>
                {players.length > 0 && (
                    <Box>
                        <List>
                            <div className={"players-container"}>PLAYERS</div>
                            {players.map((p) => (
                                <ListItem key={p.id}>
                                    <ListItemText primary={p.username} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </div>
            <CustomDialog // Game Over CustomDialog
                open={Boolean(over)}
                title={over}
                modalImg={girlSearch}
                contentText={over}
                handleContinue={() => {
                    socket.emit("closeRoom", { roomId: room });
                    cleanup();
                }}
            />
        </Stack>
    );
}

export default Game;