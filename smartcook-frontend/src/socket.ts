import { io } from "socket.io-client";

const URL = "http://localhost:3000";
const token = localStorage.getItem("accessToken");

export const socket = io(URL, {
  auth: {
    token: token 
  },
  autoConnect: false 
});