import {useCallback, useEffect, useState} from "react";
import { Container, TextField } from "@mui/material";
import Game from "./Game";
import socket from './Socket.js';
import CustomDialog from "./components/CustomDialog";
import newUserImg from "./assets/images/new-image.webp";
import instructionImg from "./assets/images/instruction.svg";
import InitGame from "./InitGame";

export default function App() {
    const [username, setUsername] = useState('');
    const [open, setOpen] = useState(true);



    // indicates if a username has been submitted
    const [usernameSubmitted, setUsernameSubmitted] = useState(false);

    const [room, setRoom] = useState("");
    const [orientation, setOrientation] = useState("");
    const [players, setPlayers] = useState([]);
    const [openInstructions, setOpenInstructions] = useState(false);
    const handleContinue = () => {
        setOpenInstructions(!openInstructions)
    };

    // resets the states responsible for initializing a game
    const cleanup = useCallback(() => {
        setRoom("");
        setOrientation("");
        setPlayers("");
    }, []);

    useEffect(() => {
        // const username = prompt("Username");
        // setUsername(username);
        // socket.emit("username", username);
        socket.on("roomCreated", (singlePlayer) => {
            console.log("firstPlayer", singlePlayer)
            setPlayers(singlePlayer.players);
        });
        socket.on("opponentJoined", (roomData) => {
            console.log("roomData", roomData)
            setPlayers(roomData.players);
        });
        return () => {
            socket.off("roomCreated");
            socket.off("opponentJoined");
        };
    }, [socket]);

    return (
        <div style={{backgroundColor:"#F4C2C2"}}>
            <Container
                // sx={{backgroundColor:"black"}}
            >
                {open && <CustomDialog

                    closeButton={false}
                    // onClose={handleClose}
                    showCancelButton={false}
                    modalImg={newUserImg}
                    open={!usernameSubmitted} // leave open if username has not been selected
                    title="Enter a Player Name" // Title of dialog
                    handleContinue={() => { // fired when continue is clicked
                        if (!username) return; // if username hasn't been entered, do nothing
                        socket.emit("username", username); // emit a websocket event called "username" with the username as data
                        setUsernameSubmitted(true);// indicate that username has been submitted
                        setOpenInstructions(true)

                    }}
                >
                    <TextField // Input
                        autoFocus // automatically set focus on input (make it active).
                        margin="dense"
                        id="username"
                        // label="Username"
                        name="username"
                        value={username}
                        required
                        onChange={(e) => setUsername(e.target.value)} // update username state with value
                        type="text"
                        fullWidth
                        variant="standard"
                        sx={{
                            '& .MuiInput-underline:after': {
                                borderBottomColor: '#C2185B', // Change the focus color of the underline
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: 'pink', // Change the focus color of the label
                            },
                        }}

                    />
                </CustomDialog> }




                {room ? (
                    <Game
                        room={room}
                        orientation={orientation}
                        username={username}
                        players={players}
                        // the cleanup function will be used by Game to reset the state when a game is over
                        cleanup={cleanup}
                    />
                ) : (

                    <InitGame
                        setRoom={setRoom}
                        setOrientation={setOrientation}
                        setPlayers={setPlayers}
                    />


                )}
                <CustomDialog open={openInstructions}   customImgClass={'instruction-img'}  modalImg={instructionImg} handleContinue={handleContinue} closeButton={false} showCancelButton={false} continueButtonText={"Got it!"}>
                    <div className={"game-instruction"}>
                       <div>Click <button className={"start-game"}>Start game</button> to begin a new game</div>
                     <div> Click <button className={"join-game"}>Join game</button> and enter RoomID to join an already existing game </div>
                    </div>
                </CustomDialog>

            </Container>
        </div>

    );
}