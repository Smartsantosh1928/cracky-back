require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const jwt = require('jsonwebtoken');

//configurations
require('./config/db');
const { sendMail } = require('./config/mailer');
const swaggerUi = require('swagger-ui-express');
const { initializePassport } = require('./config/passport');

//routes
const authRouter = require('./routes/authRouter');
const fileRouter = require('./routes/fileRouter');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
initializePassport(
    passport,
    email => User.find({ email: email }),
    id => User.findById(id)
);
app.use(passport.initialize());

app.use('/auth', authRouter);
app.post('/auth/login', (req, res, next) => { 
    passport.authenticate('local', { session: false, }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json({ success: false, message: info.message });
        }
        else{
            const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
            return res.status(200).json({ success: true, message: info.message, accessToken, refreshToken });
        }
    })(req, res, next);
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'localhost:5173', session: false }),
  (req, res) => {
    const user = req.user;
    console.log(user);
    const token = jwt.sign(user, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.cookie('jwt', token, {
        httpOnly: true,
    });
    res.redirect('http://localhost:5173');
  }
);

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const user = req.user;
    console.log(user);
    const token = jwt.sign(user, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.cookie('jwt', token, {
        httpOnly: true,
    });
    res.redirect('http://localhost:5173');
  }
);

app.use('/upload',fileRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(require('./config/swagger_output.json')));
app.listen(process.env.PORT, () => {
    console.log(`Server on port ${process.env.PORT}`);
}); 
