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

    const hashedRhPassword = await bcrypt.hash('Suph3rm4n!', 10);

    await prisma.user.create({
        data : {
            name : 'RH',
            email: 'rh@supherman.com',
            password: hashedRhPassword,
            role: 'RH',
            departmentId: department.id,
        },
    });

    console.log('seed terminé : 1 departement + 2 utilisateurs crééer');

}

main().catch((e) => console.error(e)).finally(() => prisma.$disconnect());