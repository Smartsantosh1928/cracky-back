require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
// const morgan = require('morgan');

//configurations
require('./config/db');
const { sendMail } = require('./config/mailer');

//routes
const authRouter = require('./routes/authRouter');
const fileRouter = require('./routes/fileRouter');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(morgan('dev'));

app.use('/auth', authRouter);
app.use('/upload',fileRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(require('./config/swagger_output.json')));
app.listen(process.env.PORT, () => {
    console.log(`Server on port ${process.env.PORT}`);
}); 