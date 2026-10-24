// Everything site-wide in one place: names, navigation, contact.
export const site = {
  name: 'Nawab Faizunnesa Chowdhurani Hall',
  nameBn: 'নওয়াব ফয়জুন্নেসা চৌধুরানী হল',
  short: 'HallMate',
  university: 'Jagannath University, Dhaka',
  email: 'hall@jnu.ac.bd',
  description:
    'The residential hall for women students of Jagannath University, Dhaka: notices, people, facilities and resident services.',
  nav: [
    { href: '/about', label: 'About' },
    { href: '/people', label: 'People' },
    { href: '/facilities', label: 'Facilities' },
    { href: '/notices', label: 'Notices' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
  ],
} as const;
