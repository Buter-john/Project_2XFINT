function requireRole (...allowedRole){
    return function ( req , res , next){
        if (!allowedRole.includes(req.user.role)){
            res.status(403).json({
                message : 'accès refusé ',
            });
        }
        next();
    }
}

module.exports = requireRole;