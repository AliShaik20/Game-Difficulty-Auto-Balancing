require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("./database");

const authRoutes = require("./routes/auth");
const gameplayRoutes = require("./routes/gameplay");
const adminRoutes =
    require("./routes/admin");

const app = express();

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;


/* ================================
   CORS
================================ */

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ],
        credentials: true
    })
);


/* ================================
   BODY PARSER
================================ */

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* ================================
   SOCKET.IO
================================ */

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ],
        methods: ["GET", "POST"]
    }
});


/* ================================
   HOME ROUTE
================================ */

app.get("/", (req, res) => {

    res.json({
        success: true,
        message:
            "Game Difficulty Auto-Balancing Backend is running",
        version: "1.0.0",
        service: "Game Backend"
    });

});


/* ================================
   HEALTH CHECK
================================ */

app.get("/health", (req, res) => {

    res.json({
        success: true,
        service: "game-backend",
        status: "healthy",
        timestamp: new Date().toISOString()
    });

});


/* ================================
   TEST API
================================ */

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "Backend API is working correctly"
    });

});

app.use("/api/auth", authRoutes);
app.use("/api/gameplay", gameplayRoutes);
app.use(
    "/api/admin",
    adminRoutes
);

/* ================================
   SOCKET CONNECTION
================================ */

io.on("connection", (socket) => {

    console.log(
        `Socket connected: ${socket.id}`
    );


    socket.on("join-session", (data) => {

        if (!data || !data.sessionId) {
            return;
        }

        const roomName =
            `session-${data.sessionId}`;

        socket.join(roomName);

        console.log(
            `Socket ${socket.id} joined ${roomName}`
        );

    });


    socket.on("difficulty-updated", (data) => {

        if (!data || !data.sessionId) {
            return;
        }

        const roomName =
            `session-${data.sessionId}`;

        io
            .to(roomName)
            .emit(
                "difficulty-updated",
                data
            );

    });


    socket.on("performance-event", (data) => {

        if (!data || !data.sessionId) {
            return;
        }

        const roomName =
            `session-${data.sessionId}`;

        io
            .to(roomName)
            .emit(
                "performance-event",
                data
            );

    });


    socket.on("disconnect", () => {

        console.log(
            `Socket disconnected: ${socket.id}`
        );

    });

});


/* ================================
   404 HANDLER
================================ */

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message:
            "API endpoint not found"

    });

});


/* ================================
   ERROR HANDLER
================================ */

app.use(
    (error, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }
);


/* ================================
   START SERVER
================================ */

server.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "=============================================="
        );

        console.log(
            " GAME DIFFICULTY AUTO-BALANCING BACKEND"
        );

        console.log(
            "=============================================="
        );

        console.log(
            `Server: http://localhost:${PORT}`
        );

        console.log(
            `Health: http://localhost:${PORT}/health`
        );

        console.log(
            `Test API: http://localhost:${PORT}/api/test`
        );

        console.log(
            "Database: SQLite"
        );

        console.log(
            "Socket.IO: Enabled"
        );

        console.log(
            "=============================================="
        );

        console.log("");

    }
);