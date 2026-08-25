const prisma = require('../config/prisma')

async function getMyNotifications(req , res){

    const userId = req.user.userId;

    const notifications = await prisma.notification.findMany({
        where :{ userId },
        orderBy : { createdAt : 'desc'},
    });

    res.json(notifications);
}


async function markAsRead(req , res){

    const {id} = req.params;
    const userId = req.user.userId;

    const notification = await prisma.notification.findUnique({
        where : { id : Number(id) },
    });

    if (!notification || notification.userId !== userId){
        return res.states(404).json({ message : 'Notification introuvable'});
    }

    await prisma.notification.update({
        where : { id : Number(id)},
        data : { isRead : true },
    });
    
    res.json({message : 'Notification marquée comme lue '});

}

module.exports = { getMyNotifications , markAsRead };