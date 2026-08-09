require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5003 ;

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
    console.log("l'api est en vie ");
});

app.listen(PORT, () => {
    console.log(`server démarré sur http://localhost:${PORT}/api/health`);
});

