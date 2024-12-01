import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import User from '../models/user.model.js';
import { createHash, isValidPassword } from '../utils/bcrypt.js';

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const PRIVATE_KEY = 'CoderSecretJWT';

const cookieExtractor = req => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['coderCookieToken'];
    }
    return token;
};

const initializePassport = () => {
    // JWT Strategy
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: cookieExtractor,
        secretOrKey: PRIVATE_KEY
    }, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.user._id);
            if (!user) {
                return done(null, false, { message: 'Usuario no encontrado' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            try {
                const { email, first_name, last_name } = req.body;
                const user = await User.findOne({ email: username });

                if (user) {
                    return done(null, false);
                }

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    password: createHash(password),
                    role: email.includes('@admin.com') ? 'admin' : 'user'
                };

                const result = await User.create(newUser);
                return done(null, result);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use('login', new LocalStrategy(
        { usernameField: 'email' },
        async (username, password, done) => {
            try {
                const user = await User.findOne({ email: username });
                
                if (!user) {
                    return done(null, false);
                }

                if (!isValidPassword(user, password)) {
                    return done(null, false);
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        done(null, user);
    });
};

export default initializePassport;
