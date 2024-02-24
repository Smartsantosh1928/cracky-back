const localStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const initializePassport = (passport, findById, findByEmail) => {
    const authenticateUser = async (email, password, done) => {
        const user = await User.findOne({ email: email });
        if (user == null) {
            return done(null, false, { message: 'No user with that email' });
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user, { message: 'Logged in successfully' });
            }
            else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (error) {
            error.provider = user.providers[0];
            return done(error);
        }
    }
    passport.use(new localStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => findByEmail(user.email));
    passport.deserializeUser((id, done) => findById(id));

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
        // This callback is triggered after a successful authentication
        // You can perform actions like saving the user to a database here
        return done(null, profile);
    }
    ));
    
    passport.use(new FacebookStrategy({
        clientID: process.env.FB_CLIENT_ID,
        clientSecret: process.env.FB_CLIENT_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'emails', 'picture.type(large)'],
        enableProof: true,
      },
      (accessToken, refreshToken, profile, done) => {
        // This callback is triggered after a successful authentication
        // You can perform actions like saving the user to a database here
        return done(null, profile);
      }
    ));    

}


module.exports = { initializePassport };