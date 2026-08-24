require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const validattionRoutes = require ('./routes/validationRoutes');
const userRoutes = require('./routes/userRoutes')
const cors = require('cors'); 

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
    console.log("l'api est en vie ");
});

app.use('/api/auth',authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/validation', validattionRoutes);
app.use('/api/users',userRoutes);


module.exports = app;