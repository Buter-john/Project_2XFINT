const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');



async function login ( req , res ) {

    const { email , password } = req.body ; 

    const user = await prisma.user.findUnique ({ where : { email }, include : { department : { select : { name : true } } } });

    if (!user){
        return res.status(401).json ({
            message : 'email ou mot de passe incorrect '
        });
    }

    if (!user.isActive) {
  return res.status(403).json({ message: 'Ce compte a été désactivé' });
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
            department: user.department,
            cpBalance: user.cpBalance,
            rttBalance: user.rttBalance,
            mustChangePassword: user.mustChangePassword
        },
    });

}

async function getMe(req, res) {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { department: { select: { name: true } } } });

    if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        cpBalance: user.cpBalance,
        rttBalance: user.rttBalance,
        mustChangePassword: user.mustChangePassword
    });
}

async function changePassword(req , res) {

    const userId = req.user.userId ;

    const { currentPassword , newPassword } = req.body;

    const user = await prisma.user.findUnique({
        where : {id :userId}
    });

    const matches = await bcrypt.compare(currentPassword, user.password);
    
    if (!matches){
        return res.status(404).json({
            message : 'Mot de passe actuel incorrect'
        });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where : {id : userId},
        data : { password : hashed , mustChangePassword : false },
    });

    res.json({message : 'Mot de passe modifié'});
    
}

module.exports = { login, getMe , changePassword } ;