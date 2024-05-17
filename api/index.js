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
	const { token } = req.cookies?.token;
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

	// Kullanıcı adı ve şifre kontrolü
	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password are required" });
	}

	try {
		// Kullanıcı adı benzersiz mi kontrol et
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(409).json({ message: "Username already exists" });
		}

		const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
		// Kullanıcı oluştur
		const createdUser = await User.create({
			username,
			password: hashedPassword,
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

// Test rotası
app.get("/test", (req, res) => {
	res.json({ message: "Test route OK" });
});

// Sunucuyu dinle
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
