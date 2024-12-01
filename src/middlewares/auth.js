import passport from 'passport';

export const isAuthenticated = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/login');
        }
        req.user = user;
        next();
    })(req, res, next);
};

export const isNotAuthenticated = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (user) {
            return res.redirect('/');
        }
        next();
    })(req, res, next);
};

export const isAdmin = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        req.user = user;
        next();
    })(req, res, next);
};
