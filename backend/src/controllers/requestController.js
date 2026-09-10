const prisma = require('../config/prisma');
const { calculateWorkingDays } = require('../utils/dataUtils');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

async function createRequest(req, res) {
    const { type, startDate, endDate, comment } = req.body;
    const userId = req.user.userId;

    if ((new Date(endDate)) < new Date(startDate)) {
        return res.status(400).json({ message: 'La date de fin doit être après la date de début' })
    }

    const overlapping = await prisma.leaveRequest.findFirst({
        where: {
            userId,
            status: { in: ['PENDING', 'APPROVED'] },
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
        },
    });

    if (overlapping) {
        return res.status(400).json({ message: 'cette periode chevauche une demande existante' });
    }

    const workingDays = calculateWorkingDays(startDate, endDate);

    if (type === 'CP' || type === 'RTT') {
        const employee = await prisma.user.findUnique({ where: { id: userId } });
        const balanceField = type === 'CP' ? 'cpBalance' : 'rttBalance';
        const balance = employee[balanceField];

        if (Number(workingDays) > Number(balance)) {
            return res.status(400).json({
                message: `Solde ${type} dépassé, vous avez droit à ${balance} jour(s), pas ${workingDays}`,
            });
        }
    }

    const request = await prisma.leaveRequest.create({
        data: {
            userId,
            type,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            workingDays,
            comment,
            documentUrl: req.file ? `/uploads/${req.file.filename}` : null,

        },
    });

    res.status(201).json(request);
}

async function getMyRequests(req, res) {
    const userId = req.user.userId;

    const requests = await prisma.leaveRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    res.json(requests);

}


async function getPendingRequest(req, res) {
  const { role, userId } = req.user;
  const {
    status, type, employeeId, from, to, search,
    page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc',
  } = req.query;

  const where = {};

  if (role === 'MANAGER') where.user = { managerId: userId };
  if (status) where.status = status;
  if (type) where.type = type;
  if (employeeId) where.userId = employeeId;
  if (from || to) {
    where.startDate = {};
    if (from) where.startDate.gte = new Date(from);
    if (to) where.startDate.lte = new Date(to);
  }
  if (search) {
    where.user = { ...where.user, name: { contains: search } };
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [requests, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { [sortBy]: sortOrder },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.leaveRequest.count({ where }),
  ]);

  res.json({ requests, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
}


async function updateRequest(req, res) {

    const { id } = req.params;
    const userId = req.user.userId;
    const { type, startDate, endDate, comment } = req.body;

    const existing = await prisma.leaveRequest.findUnique({
        where: { id }
    });

    if (!existing || existing.userId !== userId) {
        return res.status(404).json({
            message: 'Demande introuvable ',
        });
    }

    if (existing.status !== 'PENDING') {
        return res.status(400).json({
            message: 'Impossible de modifier une demande déja traitée '
        });
    }

    const workingDays = calculateWorkingDays(startDate, endDate);

    const updated = await prisma.leaveRequest.update({
        where: { id },
        data: {
            type,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            workingDays,
            comment,
        },
    });

    res.json(updated);
}

async function cancelRequest(req, res) {

    const { id } = req.params;
    const userId = req.user.userId;

    const existing = await prisma.leaveRequest.findUnique({
        where: { id }
    });

    if (!existing || existing.userId !== userId) {
        return res.status(404).json({
            message: 'Demande introuvable ',
        });
    }

    if (existing.status !== 'PENDING') {
        return res.status(400).json({
            message: 'Impossible d\'annuler une demande déjà traitée',
        });
    }

    await prisma.leaveRequest.update({
        where: { id },
        data: { status: 'CANCELLED' }
    });

    res.json({ message: 'Demande annulée' })

}

async function getCalendarRequests(req, res) {
    const { departmentId } = req.query;

    const where = { status: 'APPROVED' };
    if (departmentId) {
        where.user = { departmentId: Number(departmentId) };
    }

    const requests = await prisma.leaveRequest.findMany({
        where,
        include: {
            user: {
                select: { name: true, department: { select: { name: true } } },
            },
        },
        orderBy: { startDate: 'asc' },
    });

    res.json(requests);
}


async function getRequestById(req, res) {
    const { id } = req.params;
    const userId = req.user.userId;

    const request = await prisma.leaveRequest.findUnique({
        where: { id },
        include: {
            validations: {
                include: { validator: { select: { name: true } } }
            },
        },
    });

    if (!request || request.userId !== userId) {
        return res.status(404).json({ message: 'Demande introuvables' });
    }

    res.json(request);
}

module.exports = { createRequest, getMyRequests, updateRequest, cancelRequest, getPendingRequest, getCalendarRequests, getRequestById, upload };