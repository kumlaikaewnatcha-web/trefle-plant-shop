require('dotenv').config();

const express = require('express');

const { 
    getPlants 
} = require('./src/api');


const app = express();


app.use(express.json());

app.use(express.static('public'));


// เพิ่มตัวนี้
app.get('/', (req, res) => {
    res.send('Plant API Server Running');
});


// API Route
app.get('/api/plants', async (req, res) => {

    try {

        const plants = await getPlants();

        res.json(plants);

    } catch (error) {

        res.status(500).json({
            message: 'ไม่สามารถดึงข้อมูลต้นไม้ได้'
        });

    }

});


const PORT = 3000;


app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});