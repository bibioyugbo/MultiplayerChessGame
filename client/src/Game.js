import { useState, useMemo, useCallback, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Snackbar } from "@mui/material";
import { Chess } from "chess.js";
import CustomDialog from "./components/CustomDialog";
import socket from "./Socket";
import girlSearch from "../src/assets/images/girl-search.jpeg"
import {

    CardContent,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography,
    Box, Tooltip,
} from "@mui/material";


function Game({ players, room, orientation, cleanup }) {
    const chess = useMemo(() => new Chess(), []); // <- 1
    const [fen, setFen] = useState(chess.fen()); // <- 2
    const [over, setOver] = useState("");
    const [copied, setCopied] = useState(false);

    // const customPieces = {
    //     wK: customWhiteKing, // Use the imported image
    //     // Add other pieces similarly
    // };
    // const [open, setOpen] = useState(false);
    const handleClose = () => {
        setCopied(false);
    };
    const handleCopy = (text)=>{
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log("Copied to clipboard:", text);
                // Optional: show success toast or message here
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
            });
    }

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
        <Stack sx={{ justifyContent:"center",
                    display:"flex", alignItems:"center", flexDirection: "column", overflow: "auto",
                    backgroundColor:"black", height:"100vh", padding:"15px"
                  }}>
            {players.length > 0 && (
                // <Box sx={{display:"flex", justifyContent:"center", gap:"8px", alignItems:"center"}}>
                <div style={{display:'flex', flexDirection:"column", justifyContent:"center",alignItems:"center" }}>
                    <div className={"players-container"}>PLAYERS:</div>
                    <div style={{display:"flex", flexDirection:"column"}}>
                        {players.map((p) => (
                            <ListItem style={{color:"white", textTransform:"capitalize", padding:"0px"}} key={p.id}>
                                <span style={{fontSize: '16px', marginRight:"3px", color: "#C2185B"}}>•</span>
                                <ListItemText primary={p.username} />
                            </ListItem>
                        ))}
                    </div>
                </div>
                // </Box>
            )}
            <CardContent sx={{backgroundColor:"#ffd6e0", borderRadius:"10px", padding:{xs: "3px", sm:"10px"}, color:"#C2185B",display:"flex",gap:"3px", alignItems:"center", margin:"5px auto"}}>
                <Typography sx={{ fontSize:{xs:"12px", sm:"20px"}, textWrap:"nowrap"}} >Room ID: {room}</Typography>
                <Tooltip title="Copy Room ID">
                <button  onClick={()=>handleCopy(room)} style={{cursor:"pointer", background: "none",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    outline: "none"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#C2185B" d="M3.25 9A5.75 5.75 0 0 1 9 3.25h7.013a.75.75 0 0 1 0 1.5H9A4.25 4.25 0 0 0 4.75 9v7.107a.75.75 0 0 1-1.5 0z"/><path fill="#C2185B" d="M18.403 6.793a44.4 44.4 0 0 0-9.806 0a2.01 2.01 0 0 0-1.774 1.76a42.6 42.6 0 0 0 0 9.894a2.01 2.01 0 0 0 1.774 1.76c3.241.362 6.565.362 9.806 0a2.01 2.01 0 0 0 1.774-1.76a42.6 42.6 0 0 0 0-9.894a2.01 2.01 0 0 0-1.774-1.76"/></svg>
                </button>
                    <Snackbar
                        open={copied}
                        autoHideDuration={2000}
                        onClose={handleClose}
                        message="Room ID copied!"
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    />
                </Tooltip>
                </CardContent>


            <Box className={"chessboard-area"}>
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: { xs: "90vw", sm: "500px", md: "600px" }, // responsive width
                        aspectRatio: "1",
                        backgroundColor: "white",
                        minWidth: "300px", // Optional safeguard
                        mx: "auto"
                    }}
                >
                    <Chessboard
                        position={fen}
                        onPieceDrop={onDrop}
                        boardOrientation={orientation}
                    />
                </Box>

            </Box>
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