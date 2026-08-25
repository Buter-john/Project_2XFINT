const prisma = require('../config/prisma');


async function approveRequest ( req , res ){
    const {id} = req.params;

    const validatorId = req.user.userId

    const request = await prisma.leaveRequest.findUnique({
        where : { id },
    });

    if (!request || request.status !== 'PENDING' ){
        return res.status(404).json({
            message : 'Demande introuvable ou Déjà traité',
        }); 
    }

    if (request.type === 'CP'){
        await prisma.user.update({
            where : {id : request.userId},
            data : {cpBalance :{decrement : request.workingDays}},
        });   
    } else if ( request.type === 'RTT'){
        await prisma.user.update({
            where : { id : request.userId},
            data : { rttBalance : { decrement :request.workingDays}},
        });
    }
    
    await prisma.leaveRequest.update({
        where : {id},
        data : { status : 'APPROVED'},
    }); 

    await prisma.validationHistory.create({
        data : { requestId : id , validatorId , action : 'APPROVE'},
    });


    await prisma.notification.create({
        data : {
      userId: request.userId,
      title: 'Demande approuvée',
      message: `Ta demande de congé du ${request.startDate.toISOString().slice(0, 10)} au ${request.endDate.toISOString().slice(0, 10)} a été approuvée.`,
        },
    });
      res.json({ message: 'Demande approuvée' });

}

  async function rejectRequest (req , res){
        const {id} = req.params;
        const {comment} = req.body;
        const validatorId = req.user.userId;

        const request = await prisma.leaveRequest.findUnique({
            where :{id},
        });

        if (!request || request.status !== 'PENDING'){
            return res.status(404).json({
                message :'Demande introuvable ou Déjà traitée'
            });
        }

        await prisma.leaveRequest.update({
            where : {id},
            data :{status : 'REJECTED'},
        });

        await prisma.validationHistory.create({
            data : { requestId : id , validatorId , action : 'REJECT' , comment }, 
        });

        await prisma.notification.create({
            data : {
                userId: request.userId, 
                title : 'Demande rejetée' , 
                message : `Ta demande de congé a été rejetée. Motif : ${comment || 'non précisé'}`,

            },
        });

        res.json({ message : ' demande reject '})
      }

module.exports = { approveRequest , rejectRequest } ; 