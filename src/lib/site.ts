// Everything site-wide in one place: names, navigation, location, credit.
// The header, the phone menu and the footer all read `nav`, so they never drift apart.
export type NavLink = { href: string; label: string };
export type NavGroup = { label: string; links: NavLink[] };

export const site = {
  name: 'Nawab Faizunnesa Chowdhurani Hall',
  nameBn: 'নওয়াব ফয়জুন্নেসা চৌধুরানী হল',
  short: 'HallMate',
  university: 'Jagannath University, Dhaka',
  description:
    'The residential hall for women students of Jagannath University, Dhaka: notices, people, facilities and resident services.',
  // The university's postal address; the map searches for the hall itself
  address: ['Jagannath University', '9–10 Chittaranjan Avenue', 'Dhaka 1100, Bangladesh'],
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Nawab+Faizunnesa+Chowdhurani+Hall+Jagannath+University+Dhaka',
  credit: { name: 'Rifah Sajida Deya', url: 'https://github.com/rifah07' },
  nav: [
    {
      label: 'About',
      links: [
        { href: '/about', label: 'About the hall' },
        { href: '/achievements', label: 'Achievements' },
        { href: '/events', label: 'Events' },
      ],
    },
    {
      label: 'People',
      links: [
        { href: '/provost', label: 'Provost' },
        { href: '/provosts', label: 'All provosts' },
        { href: '/house-tutors', label: 'House tutors' },
        { href: '/staff', label: 'Hall office' },
      ],
    },
    {
      label: 'Campus',
      links: [
        { href: '/facilities', label: 'Facilities' },
        { href: '/dining', label: 'Dining' },
        { href: '/gallery', label: 'Gallery' },
      ],
    },
    {
      label: 'Admission',
      links: [
        { href: '/admission', label: 'Admission' },
        { href: '/apply', label: 'Apply online' },
        { href: '/track', label: 'Track an application' },
      ],
    },
    {
      label: 'Help',
      links: [
        { href: '/notices', label: 'Notices' },
        { href: '/faq', label: 'FAQ' },
        { href: '/contact', label: 'Contact' },
      ],
    },
  ] satisfies NavGroup[],
};
