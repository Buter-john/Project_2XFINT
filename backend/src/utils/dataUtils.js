function calculateWorkingDays (startDate , endDate ) {

    let count = 0 ;
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end ){
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6){
            count++;
        }
        current.setDate(current.getDate() +1 );
    }

    return count; 
}

module.exports = { calculateWorkingDays };