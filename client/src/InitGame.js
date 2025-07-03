import {Box, Button, Stack, TextField} from "@mui/material";
import { useState } from "react";
import CustomDialog from "./components/CustomDialog";
import socket from './Socket.js';
import joinImg from "./assets/images/pink-door.jpgpink-door.jpg"

export default function InitGame({ setRoom, setOrientation, setPlayers }) {
    const [roomDialogOpen, setRoomDialogOpen] = useState(false);
    const [roomInput, setRoomInput] = useState(''); // input state
    const [roomError, setRoomError] = useState('');
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setRoomDialogOpen(!roomDialogOpen)
    };

    return (
        <Stack
            justifyContent="center"
            alignItems="center"
            sx={{ py: 1, height: "100vh"}}
        >
            <CustomDialog
                onClose={handleClose}
                modalImg={joinImg}
                open={roomDialogOpen}
                handleClose={() => setRoomDialogOpen(!roomDialogOpen)}
                title="Select Room to Join"
                contentText="Enter a valid room ID to join the room"
                handleContinue={() => {
                    // join a room
                    if (!roomInput) return; // if given room input is valid, do nothing.
                    socket.emit("joinRoom", { roomId: roomInput }, (r) => {
                        // r is the response from the server
                        if (r.error) return setRoomError(r.message); // if an error is returned in the response set roomError to the error message and exit
                        console.log("response:", r);
                        setRoom(r?.roomId); // set room to the room ID
                        setPlayers(r?.players); // set players array to the array of players in the room
                        setOrientation("black"); // set orientation as black
                        setRoomDialogOpen(!roomDialogOpen); // close dialog
                    });
                }}
            >
                <TextField
                    autoFocus
                    margin="dense"
                    id="room"
                    placeholder={"Room ID"}
                    name="room"
                    value={roomInput}
                    required
                    onChange={(e) => setRoomInput(e.target.value)}
                    type="text"
                    fullWidth
                    variant="standard"
                    error={Boolean(roomError)}
                    helperText={!roomError ? 'Enter a room ID' : `Invalid room ID: ${roomError}` }
                />
            </CustomDialog>


            <Box sx={{display:"flex", justifyContent:"center", flexDirection:"column", gap:"10px"}}>
                <button
                    className={"start-button"}
                    // variant="contained"
                    onClick={() => {
                        socket.emit("createRoom", (r) => {
                            console.log(r);
                            setRoom(r);
                            setOrientation("white");
                        });
                    }}
                >
                    Start a game
                </button>
                {/* Button for joining a game */}
                <button
                    style={{backgroundColor:"white", color:"#C2185B"}}
                    className={"start-button"}
                    onClick={() => {
                        // setOpen(!open)
                        setRoomDialogOpen(true)
                    }}
                >
                    Join a game
                </button>
            </Box>

        </Stack>
    );
}