const prisma = require('../config/prisma');

async function getDepartments(req, res) {

    const departements = await prisma.department.findMany({
        orderBy: { name: 'asc' },
    });
    res.json(departements)
}

async function createDepartment(req, res) {
    const { name } = req.body;

    const department = await prisma.department.create({
        data: { name },
    });
    res.status(201).json(department);
}

module.exports = { getDepartments, createDepartment };