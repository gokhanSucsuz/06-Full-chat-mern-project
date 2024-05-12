const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User.js");
const jwt = require("jsonwebtoken");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4040;

// MongoDB'ye bağlan
mongoose.connect(process.env.MONGO_URL);

// Middleware'ler
app.use(express.json());
app.use(
	cors({
		credentials: true,
		origin: process.env.CLIENT_URL,
	})
);

const jwtSecret = process.env.JWT_SECRET;

// "/register" rotası
app.post("/register", async (req, res) => {
	const { username, password } = req.body;

	try {
		// Kullanıcı oluştur
		const createdUser = await User.create({ username, password });

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
						_id: createdUser._id,
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

// Test rotası
app.get("/test", (req, res) => {
	res.json({ message: "Test route OK" });
});

// Sunucuyu dinle
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
