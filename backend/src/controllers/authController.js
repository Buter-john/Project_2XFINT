const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');



async function login ( req , res ) {

    const { email , password } = req.body ; 

    const user = await prisma.user.findUnique ({ where : { email } });

    if (!user){
        return res.status(401).json ({
            message : 'email ou mot de passe incorrect '
        });
    }

    const passwordMatches = await bcrypt.compare(password,user.password);

    if (!passwordMatches){
        return res.status(401).json({
            message : 'mot de passe incorrect'
        });
    }

    const token = jwt.sign ( 
        { userId: user.id , role : user.role },
        process.env.JWT_SECRET,{ expiresIn : '8h'}
    );

    res.json({
        token,
        user:{
            id : user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });

}

async function getMe(req, res) {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

    if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    });
}

module.exports = { login, getMe } ;