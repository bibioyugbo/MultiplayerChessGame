import { io } from "socket.io-client"; // import connection function

const socket = io('https://multiplayerchessgame.onrender.com'); // initialize websocket connection
// const socket = io('https://localhost:3001')
export default socket;