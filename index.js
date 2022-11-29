const express = require('express');
const cors = require('cors');
const { dbConnection } = require('./config/db')
const cronJob = require('./cron-jobs/cron');

//crear el servidor
const app = express();

// dbConnection()
dbConnection()

//habilitar cors
app.use(cors());

//habilitar express.json
app.use(express.json());

//puerto
const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Hola Robert');
});

//importar rutas
app.use('/aut', require('./routes/aut'));
// app.use('/charges', require('./routes/charges'));

//arrancar la app
app.listen(PORT, () => {
    // cronJob()
    // `http server Corriendo desde el puerto ${PORT}`);
});