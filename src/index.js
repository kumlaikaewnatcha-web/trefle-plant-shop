const express = require("express");
const dotenv = require("dotenv");

const plantRoutes = require("./routes/plantRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.static("public"));

app.use("/api/plants", plantRoutes);

app.use("/api/favorites", favoriteRoutes);

const PORT = process.env.PORT || 3000;

if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;