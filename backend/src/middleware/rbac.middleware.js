function authorizeRoles(...allowedRoles) {
    if (allowedRoles.length === 0) {
        throw new Error('authorizeRoles requires at least one role');
    }
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required.',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden.',
            });
        }

        next();
    };
}

export default authorizeRoles;
