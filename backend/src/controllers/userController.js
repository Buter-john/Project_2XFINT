const bcrypt = require ('bcryptjs');
const prisma = require('../config/prisma');



async function getUsers (req , res){

    const users = await prisma.user.findMany({
        select : { 
            id : true , name: true , email : true , role : true , 
            isActive : true , department : { select : { name : true }},
        },
        orderBy : { name : 'asc' }, 
    });
    res.json(users);
}

async function createUser(req , res){

    const { name , email , password , role , departmentId } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data : {
            name ,
            email , 
            role , 
            password : hashedPassword , 
            departmentId, 
        },
    });

    res.status(201).json({ id : user.id ,
        name : user.name , email : user.email ,
        role : user.role }); 
    
}


async function toggleUserActive(req , res){
        const { id } = req.params ; 

        const existing = await prisma.user.findUnique({
            where :{id}
        }); 


        if (!existing){
            return res.status(404).json({
                message : 'utiliser introuvable',
            });
        }


        const updated = await prisma.user.update({
            where :{id},
            data: { isActive : !existing.isActive }, 
        }); 

        res.json({ id : updated.id , isActive : updated.isActive});

}


async function updateUser(req , res){
    const { id } = req.params;
    const { name , role , departmentId , managerId} = req.body;

    const updated = await prisma.user.update({
        where :{ id },
        data :{
            name,
            role,
            departmentId,
            managerId, 
        }
    })

    res.json({ id : updated.id , name: updated.name , email : updated.email , role : updated.role , managerId : updated.managerId})
}

async function resetPassword(req , res){

    const {id}= req.params;
    const tempPassword = Math.random().toString(36).slice(-8);

    const hashed = await bcrypt.hash(tempPassword, 10);

    await prisma.user.update({
        where : {id},
        data :{ password : hashed , mustChangePassword : false },
    });

    res.json({
        message : 'mot de passe réinitialisé' , tempPassword 
    })

}

module.exports = { getUsers , createUser , toggleUserActive , updateUser , resetPassword };