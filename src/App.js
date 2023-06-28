import logo from './logo.svg';
import './App.css';

function App() {
    // Import the necessary libraries
    const express = require("express");
    const socketio = require("socket.io");
    const mongoose = require("mongoose");
    const cors = require("cors");

    // Create the Express application
    const app = express();

    // Configure CORS
    app.use(cors());

    // Connect to the MongoDB database
    const uri = "mongodb://username:password@servername:port/discordlikeapp";;
    mongoose.connect(uri, { useNewUrlParser: true });

    // Create the socket.io server
    const server = app.listen(3000, () => {
        console.log("Server started on port 3000");

        // New route for handling voice chat requests
        app.post("/voicechat", (req, res) => {
            // Check if the user is authenticated
            const jwt = req.headers.authorization.split(" ")[1];
            const user = Users.findOne({ _id: jwt.split(".")[1] });
            if (!user) {
                res.sendStatus(401);
                return;
            }

            // Create a new WebSocket connection
            const socket = socketio.connect(server);

            // create a new AudioContext object
            const audioContext = new AudioContext();

            // create a new MediaStream object
            const mediaStream = new MediaStream();

            // Connect the Audio Context object to the MediaStream Object
            audioContext.destination.connect(mediaStream);

            // Start the WebSocket connection
            socket.on("connect", () => {
                // Start sending and receiving audio data
                socket.on("audio", data => {
                    audioContext.decodeAudioData(data, function (buffer) {
                        //Insert do something with audio data
                    });
                });
                socket.on("stop", () => {
                    //Stop sending and receiving audio data
                });
            });
        });
    });

    // Create the schema for the users collection
    const UserSchema = new mongoose.Schema({
        username: { type: String, required: true },
        password: { type: String, required: true },
    });

    // Create the users collection
    const Users = mongoose.model("Users", UserSchema);

    // Create the schema for the roles collection
    const RoleSchema = new mongoose.Schema({
        name: { type: String, required: true },
        permissions: { type: [String], required: true },
    });

    // Create the roles collection
    const Roles = mongoose.model("Roles", RoleSchema);

    // Create the schema for the channels collection
    const ChannelSchema = new mongoose.Schema({
        name: { type: String, required: true },
        users: { type: [String], required: true },
        roles: { type: [String], required: true },
        voice: { type: Boolean, required: true },
        notifications: { type: Boolean, required: true },
    });

    // Create the channels collection
    const Channels = mongoose.model("Channels", ChannelSchema);

    // Create the schema for the messages collection
    const MessageSchema = new mongoose.Schema({
        text: { type: String, required: true },
        author: { type: String, required: true },
        channel: { type: String, required: true },
    });

    // Create the messages collection
    const Messages = mongoose.model("Messages", MessageSchema);

    // Create the routes
    app.get("/", (req, res) => {
        res.send("Welcome to my project! A simple recreation of Discord");
    });

    app.post("/login", (req, res) => {
        // Check if the username and password are valid
        const user = Users.findOne({ username: req.body.username });
        if (!user || user.password !== req.body.password) {
            res.sendStatus(401);
            return;
        }

        // Create a JWT token for the user
        const jwt = jwt.sign({ id: user._id }, "secret", { expiresIn: "1h" });

        // Send the JWT token to the client
        res.send({ jwt });
    });

    app.post("/channels", (req, res) => {
        // Check if the user is authenticated
        const jwt = req.headers.authorization.split(" ")[1];
        const user = Users.findOne({ _id: jwt.split(".")[1] });
        if (!user) {
            res.sendStatus(401);
            return;
        }

        // Create a new channel
        const channel = new Channels({
            name: req.body.name,
            users: [user.username],
        });
        channel.save((err, channel) => {
            if (err) {
                res.sendStatus(500);
                return;
            }

            // Send the channel information to the client
            res.send(channel);
        });
    });

    app.post("/messages", (req, res) => {
        // Check if the user is authenticated
        const jwt = req.headers.authorization.split(" ")[1];
        const user = Users.findOne({ _id: jwt.split(".")[1] });
        if (!user) {
            res.sendStatus(401);
            return;
        }

        // Create a new message
        const message = new Messages({
            text: req.body.text,
            author: user.username,
            channel: req.body.channel,
        });

        try {
            message.save((err, message) => {
                if (err) {
                    // Handle the error
                    res.sendStatus(500);
                    return;
                }

                // Send the message information to the client
                res.send(message);
            });
        } catch (err) {
            // Handle the error
            res.sendStatus(500);
            return;
        }

        message.save((err, message) => {
            if (err) {
                res.sendStatus(500);
                return;
            }

            // Send the message information to the client
            res.send(message);
        });
    });

    // Start the server
    app.listen(3000, () => {
        console.log("Server started on port 3000");
    });

    const Chat = () => {
        const [messages, setMessages] = useState([]);

        const handleMessageSubmit = (e) => {
            e.preventDefault();
            const message = e.target.elements.message.value;
            setMessages([...messages, message]);
        };

        return (
            <div>
                <h1>Chat</h1>
                <ul>
                    {messages.map((message) => (
                        <li key={message}>{message}</li>
                    ))}
                </ul>
                <form onSubmit={handleMessageSubmit}>
                    <input type="text" name="message" placeholder="Enter message" />
                    <button type="submit">Send</button>
                </form>
            </div>
        );
    };

    export default Chat;

    const VoiceChat = () => {
        const [connected, setConnected] = useState(false);

        const handleConnect = () => {
            setConnected(true);
        };

        const handleDisconnect = () => {
            setConnected(false);
        };

        return (
            <div>
                <h1>Voice Chat</h1>
                {connected ? (
                    <div>
                        <p>You are connected to voice chat.</p>
                        <button onClick={handleDisconnect}>Disconnect</button>
                    </div>
                ) : (
                    <button onClick={handleConnect}>Connect</button>
                )}
            </div>
        );
    };

    export default VoiceChat;

    import React, { useState } from "react";

    const App = () => {
        const [messages, setMessages] = useState([]);
        const [connected, setConnected] = useState(false);

        const handleMessageSubmit = (e) => {
            e.preventDefault();
            const message = e.target.elements.message.value;
            setMessages([...messages, message]);
        };

        const handleConnect = () => {
            setConnected(true);
        };

        const handleDisconnect = () => {
            setConnected(false);
        };

        return (
            <div>
                <h1>Discord Clone</h1>
                <Chat messages={messages} />
                <VoiceChat connected={connected} handleConnect={handleConnect} handleDisconnect={handleDisconnect} />
            </div>
        );
    };

    export default App;
}
