import { io } from "socket.io-client"
import { API_URL } from "../src/config/apiUrl.js"

export const socket = io(API_URL, {
  autoConnect: true,
  withCredentials: true, 
  transports: ['websocket', 'polling'] 
})