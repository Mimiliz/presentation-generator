const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de CORS para permitir requisições do frontend
app.use(cors({
    origin: [
        'https://presentation-generator-bwyf.vercel.app',
        'http://localhost:8080',
        'http://localhost:3000'
    ],
    credentials: true
} ));

app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/presentation', require('./routes/presentation'));

// Root route
app.get('/', (req, res) => {
    res.send('Gerador Inteligente de Apresentações - Backend');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend listening at http://0.0.0.0:${PORT}` );
});
