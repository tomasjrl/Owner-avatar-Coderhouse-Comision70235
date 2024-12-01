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

export const isAdmin = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

export const isUser = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user || user.role !== 'user') {
            return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de usuario.' });
        }
        req.user = user;
        next();
    })(req, res, next);
};
