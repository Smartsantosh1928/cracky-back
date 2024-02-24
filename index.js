require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const User = require('./models/user');

//routes
const { authRouter, fileRouter, userRouter } = require('./routes/user');
const { sellerAuthRouter, sellerRouter } = require('./routes/seller');

//configurations
require('./config/db');
const { sendMail } = require('./config/mailer');
const swaggerUi = require('swagger-ui-express');
const { initializePassport } = require('./config/passport');

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
    passport.authenticate('local', { session: false, }, async (err, user, info) => {
        if (err) {
            return res.status(400).json({ success: false, message: "You are trying to authenticate via another method. Please login via "+err.provider.charAt(0).toUpperCase() + err.provider.slice(1) });  
        }
        if (!user) {
            return res.status(400).json({ success: false, message: info.message });
        }
        else{
            const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
            user.refreshToken = refreshToken;
            await user.save();
            return res.status(200).json({ success: true, message: "Login successful", accessToken, refreshToken});
        }
    })(req, res, next);
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'localhost:5173', session: false }),
  async (req, res) => {
    const { sub, name, picture, email } = req.user._json;
    
    const existingUser = await User.findOne({ email: email })
    console.log(existingUser);
    let newUser;
    if (existingUser && existingUser.providers.includes("google")) {
      newUser = existingUser;
    }else if(existingUser){
      existingUser.name = existingUser.name || name;
      existingUser.isVerified = true;
      existingUser.profilePictureUrl = existingUser.profilePictureUrl || picture;
      existingUser.providers.push("google");
      newUser = existingUser;
    }else{
      newUser = new User({
        name,
        email,
        profilePictureUrl: picture,
        isVerified: true,
        emailOffers: true,
        role: 'user',
        providers: ['google']
      });
    }
    
    newUser.save().then((user) => {
      const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: "30d" })
      user.refreshToken = refreshToken;
      user.save().then(async user => {  
        console.log(user);
        res.cookie('accessToken', accessToken);
        res.cookie('refreshToken', refreshToken);
        res.redirect('http://localhost:5173');
      })
    })
  }
);

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    const { id, name, email, picture } = req.user._json;
    let newUser;
    const existingUser = await User.findOne({ email: email })
    
    console.log(existingUser);
    if (existingUser && existingUser.providers.includes("facebook")) {
      newUser = existingUser;
    }else if(existingUser){
      existingUser.name = existingUser.name || name;
      existingUser.isVerified = true;
      existingUser.profilePictureUrl = existingUser.profilePictureUrl || picture.data.url;
      existingUser.providers.push("facebook");
      newUser = existingUser;
    }
    else{
      newUser = new User({
        name,
        email,
        profilePictureUrl: picture.data.url,
        isVerified: true,
        emailOffers: true,
        role: 'user',
        providers: ['facebook']
      });
    }
    
    newUser.save().then((user) => {
      const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
      user.refreshToken = refreshToken;
      user.save().then(async () => {  
        res.cookie('accessToken', accessToken);
        res.cookie('refreshToken', refreshToken);
        res.redirect('http://localhost:5173');
      })
    })
});

app.use('/user', userRouter);
app.use('/upload',fileRouter);

app.use('/seller', sellerAuthRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(require('./config/swagger_output.json')));
app.listen(process.env.PORT, () => {
    console.log(`Server on port ${process.env.PORT}`);
}); 
