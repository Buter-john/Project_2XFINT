export function statusStyle(status: string) {
    switch (status) {
        case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
        case 'REJECTED': return 'bg-red-100 text-red-700';
        case 'CANCELLED': return 'bg-gray-100 text-gray-500';
        default: return 'bg-amber-100 text-amber-700';
    }
}
