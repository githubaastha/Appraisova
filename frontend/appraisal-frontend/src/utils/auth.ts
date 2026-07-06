export function getLoggedInUser() {
    const stored = localStorage.getItem('loggedInUser')
    if (stored) return JSON.parse(stored)
    return { userId: 1, name: 'Priya Sharma', initials: 'PS', role: 'MANAGER', managerId: null }

}