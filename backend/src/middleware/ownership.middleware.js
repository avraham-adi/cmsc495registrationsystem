export function requireSelf(req, res, next) {
    const resourceID = Number(req.params.id);

    if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required.' });
    }

    if (req.user.id !== resourceID) {
        return res.status(403).json({ error: 'Forbidden.' });
    }

    next();
}

export function requireSelfOrAdmin(req, res, next) {
    const resourceID = Number(req.params.id);

    if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required.' });
    }

    if (req.user.role === 'ADMIN' || req.user.id === resourceID) {
        return next();
    }

    return res.status(403).json({ error: 'Forbidden.' });
}
