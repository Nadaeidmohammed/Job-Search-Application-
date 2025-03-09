import { Server } from "socket.io";

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    io.on("connection", (socket) => {
        console.log("New user connected:", socket.id);

        socket.on("joinCompanyRoom", (companyId) => {
            socket.join(companyId);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
};
