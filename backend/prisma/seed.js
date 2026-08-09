const prisma = require ('../src/config/prisma');
const bcrypt = require ('bcryptjs');

async function main (){

    const department = await prisma.department.create({
        data : { name:'informatique'},
    });

    const hashedPassword = await bcrypt.hash('password123',10); 

    await prisma.user.create({
    
        data : {
            name : 'Sylvie',
            email: 'sylvie@gmail.com',
            password: hashedPassword,
            role:'EMPLOYE',
            departmentId:department.id,
        },
    });

    console.log('seed terminé : 1 departement + 1 utilisateur crééer');

}

main().catch((e) => console.error(e)).finally(() => prisma.$disconnect());