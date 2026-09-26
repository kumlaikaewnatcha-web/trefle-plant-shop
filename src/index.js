const express = require("express");
const dotenv = require("dotenv");

const plantRoutes = require("./routes/plantRoutes");

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/plants", plantRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});