const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User.js");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4040;

// MongoDB'ye bağlan
mongoose.connect(process.env.MONGO_URL);

// Middleware'ler
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
			res.json({ userData });
		});
	} else {
		res.status(401).json("no code");
	}
});

// "/register" rotası
app.post("/register", async (req, res) => {
	const { username, password } = req.body;

	try {
		const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
		// Kullanıcı oluştur
		const createdUser = await User.create({
			username,
			password: bcrypt.hashedPassword,
		});

		// JWT oluştur
		jwt.sign(
			{ userId: createdUser._id, username },
			jwtSecret,
			{},
			(err, token) => {
				if (err) throw err;
				// Çerez oluştur ve yanıtı gönder
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

app.get("/login", async (req, res) => {
	const { username, password } = req.body;
	const foundUser = await User.find({ username });
});

// Test rotası
app.get("/test", (req, res) => {
	res.json({ message: "Test route OK" });
});

// Sunucuyu dinle
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
