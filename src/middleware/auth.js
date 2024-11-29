export const isAuthenticated = (req, res, next) => {
    if (req.session.login) {
        return next();
    }
    res.redirect('/login');
};

export const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
};

export const isUser = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'user') {
        return next();
    }
    res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de usuario.' });
};
