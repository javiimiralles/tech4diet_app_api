const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cors = require('cors');
const { dbConnection } = require('./database/configdb');
const cloudinary = require('cloudinary').v2;

require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
dbConnection();

app.use(cors());
app.use(express.json());
app.use(fileUpload ({
    limits: { fileSize: process.env.MAXSIZEUPLOAD * 1024 * 1024 },
    createParentPath: true
}));
app.use(bodyParser.json());

// Rutas
app.use('/api/login', require('./routes/auth.router'));
app.use('/api/usuarios', require('./routes/usuarios.router'));
app.use('/api/alimentos', require('./routes/alimentos.router'));
app.use('/api/registros-peso', require('./routes/registros-peso.router'));
app.use('/api/diarios', require('./routes/diarios.router'));
app.use('/api/medidas-corporales', require('./routes/medidas-corporales.router'));
app.use('/api/actividades-fisicas', require('./routes/actividades-fisicas.router'));
app.use('/api/actividades-realizadas', require('./routes/actividades-realizadas.router'));
app.use('/api/modelos3D', require('./routes/modelos3D.router'));
app.use('/api/fotos-progreso', require('./routes/fotos-progreso.router'));
app.use('/api/uploads', require('./routes/uploads.router'));

app.use('/api/open-food-facts', require('./external-services/open-food-facts.service'));

app.listen(process.env.PORT, ()=>{
  console.log('Servidor en puerto: ' + process.env.PORT);
});