const express = require('express');
const cors = require('cors');
const { dbConnection } = require('./config/db')

//crear el servidor
const app = express();

// dbConnection()
dbConnection()

//habilitar cors
app.use(cors());

//habilitar express.json
app.use(express.json({ extended: true }));

//puerto
const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('Hola Mundo');
});

//importar rutas
app.use('/aut', require('./routes/aut'));

//arrancar la app
app.listen(PORT, '0.0.0.0', () => {
    // `http server Corriendo desde el puerto ${PORT}`);
});