const prisma = require('../config/prisma');
const { calculateWorkingDays } = require('../utils/dataUtils');

async function createRequest(req, res) {
  const { type, startDate, endDate, comment } = req.body;
  const userId = req.user.userId;

  const workingDays = calculateWorkingDays(startDate, endDate);

  const request = await prisma.leaveRequest.create({
    data: {
      userId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      workingDays,
      comment,
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


async function getPendingRequest (req , res ){

    const request = await prisma.leaveRequest.findMany({
        where : { status : 'PENDING'} , 
        include :{ user :{ select : { name : true , email : true }
        }} , 

        orderBy : { createdAt : 'asc'},
    });

    res.json (request);
}


async function updateRequest ( req , res ){

    const { id } = req.params;
    const userId = req.user.userId;
    const { type, startDate, endDate, comment } = req.body;

    const existing = await prisma.leaveRequest.findUnique ({
        where : { id }
    });

    if ( !existing || existing.userId !== userId ){
        return res.status(404).json({
            message : 'Demande introuvable ' ,
        });
    }

    if ( existing.status !== 'PENDING'){
        return res.status(400).json({
            message : 'Impossible de modifier une demande déja traitée '
        });
    }

    const workingDays = calculateWorkingDays(startDate, endDate);

    const updated = await prisma.leaveRequest.update({
        where : { id },
        data :{
            type,
            startDate : new Date(startDate),
            endDate: new Date(endDate),
            workingDays,
            comment, 
        },
    });

    res.json(updated);
}

async function cancelRequest ( req , res ){

    const { id } = req.params;
    const userId = req.user.userId;
    
    const existing = await prisma.leaveRequest.findUnique({
        where : { id }
    });

    if ( !existing || existing.userId !== userId ){
        return res.status(404).json({
             message : 'Demande introuvable ' ,
        });
    }

    if ( existing.status !== 'PENDING'){
        return res.status(400).json({
            message: 'Impossible d\'annuler une demande déjà traitée'  ,
        });
    }

    await prisma.leaveRequest.delete({
        where: { id },
    });

    res.status(204).send();

}

async function getCalendarRequests (req , res) {

    const requests = await prisma.leaveRequest.findMany({
        where : { status : 'APPROVED'},
        include :{
            user: {
                select :{
                    name : true,
                    department : { select : {name : true} },
                },
            },
        },
        orderBy :{ startDate:'asc'}, 
    });

    res.json(requests);
}

module.exports = { createRequest, getMyRequests , updateRequest , cancelRequest , getPendingRequest , getCalendarRequests};