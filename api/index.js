const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User.js");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const ws = require("ws");
const Message = require("./models/Message.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4040;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		credentials: true,
		origin: process.env.CLIENT_URL,
		methods: ["GET", "POST"],
	})
);

const jwtSecret = process.env.JWT_SECRET;

const bcryptSalt = bcrypt.genSaltSync(10);

app.get("/profile", (req, res) => {
	const token = req.cookies?.token;
	if (token) {
		jwt.verify(token, jwtSecret, {}, (err, userData) => {
			if (err) throw err;
			res.json(userData);
		});
	} else {
		res.status(401).json("no token");
	}
});

const getUserDataFromRequest = async (req) => {
	return new Promise((resolve, reject) => {
		const token = req.cookies?.token;
		if (token) {
			jwt.verify(token, jwtSecret, {}, (err, userData) => {
				if (err) throw err;
				resolve(userData);
			});
		} else {
			reject("No token!");
		}
	});
};

app.get("/users", async (req, res) => {
	const users = await User.find({}, { _id: 1, username: 1 });
	res.json(users);
});

app.get("/messages/:userId", async (req, res) => {
	const { userId } = req.params;
	const userData = await getUserDataFromRequest(req);
	const ourUserId = userData.userId;
	const messages = await Message.find({
		sender: { $in: [userId, ourUserId] },
		recipient: { $in: [userId, ourUserId] },
	}).sort({ createdAt: 1 });
	res.json(messages);
});

// "/register" route
app.post("/register", async (req, res) => {
	const { username, password } = req.body;

	// Control username and password
	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password are required" });
	}

	try {
		// Check username that unique is
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(409).json({ message: "Username already exists" });
		}

		const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
		// Create User
		const createdUser = await User.create({
			username,
			password: hashedPassword,
		});

		// Create JWT
		jwt.sign(
			{ userId: createdUser._id, username },
			jwtSecret,
			{},
			(err, token) => {
				if (err) throw err;
				// Set cookie and send response
				res
					.cookie("token", token, { sameSite: "none", secure: true })
					.status(201)
					.json({
						id: createdUser._id,
					});
			}
		);
	} catch (error) {
		console.error("Error registering user:", error);
		res
			.status(500)
			.json({ message: "An error occurred while registering user" });
	}
});

app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const foundUser = await User.findOne({ username });
	if (foundUser) {
		const passOk = bcrypt.compareSync(password, foundUser.password);
		if (passOk) {
			jwt.sign(
				{ userId: foundUser._id, username },
				jwtSecret,
				{},
				(err, token) => {
					res.cookie("token", token, { sameSite: "none", secure: true }).json({
						id: foundUser._id,
					});
				}
			);
		}
	}
});

app.post("/logout", (req, res) => {
	res.cookie("token", "", { sameSite: "none", secure: true }).json("Ok");
});

// Test route
app.get("/test", (req, res) => {
	res.json({ message: "Test route OK" });
});

// Listen server
const server = app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
	const notifyAboutOnlineUsers = () => {
		[...wss.clients].forEach((client) => {
			client.send(
				JSON.stringify({
					online: [...wss.clients].map((c) => ({
						userId: c.userId,
						username: c.username,
					})),
				})
			);
		});
	};

	connection.isAlive = true;

	connection.timer = setInterval(() => {
		connection.ping();
		connection.deathTimer = setTimeout(() => {
			connection.isAlive = false;
			clearInterval(connection.timer);
			connection.terminate();
			notifyAboutOnlineUsers();
			console.log("dead");
		}, 1000);
	}, 5000);

	connection.on("pong", () => {
		clearTimeout(connection.deathTimer);
	});

	//Read username and id from the cookie for this connection
	const cookies = req.headers.cookie;
	if (cookies) {
		const tokenCookieString = cookies
			.split(";")
			.find((str) => str.startsWith("token="));
		const token = tokenCookieString.split("=")[1];
		if (token) {
			jwt.verify(token, jwtSecret, {}, (err, userData) => {
				if (err) throw err;
				const { userId, username } = userData;
				connection.userId = userId;
				connection.username = username;
			});
		}
	}
	connection.on("message", async (message) => {
		const messageData = JSON.parse(message.toString());
		const { recipient, text } = messageData;
		if (recipient && text) {
			const messageDoc = await Message.create({
				sender: connection.userId,
				recipient,
				text,
			});

			[...wss.clients]
				.filter((c) => c.userId === recipient)
				.forEach((c) =>
					c.send(
						JSON.stringify({
							text,
							sender: connection.userId,
							recipient,
							_id: messageDoc._id,
						})
					)
				);
		}
	});

	//Notify everyone about online users (when someone connects)
	notifyAboutOnlineUsers();
});
