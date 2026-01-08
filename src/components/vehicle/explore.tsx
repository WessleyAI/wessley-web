'use client'

import { ProjectCard } from './ProjectCard'

// Mock data for restoration projects - varied heights for masonry effect
const projects = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1080&q=80', // Toyota Land Cruiser FJ40
    title: '1978 Toyota Land Cruiser',
    userName: 'Jacob R.',
    location: 'Portland, OR',
    progress: 75,
    followers: 1243,
    likes: 892,
    comments: 156,
    tags: ['Full Rebuild', 'Engine', 'Bodywork'],
    height: 420,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5f5ca1d49?w=1080&q=80', // 1967 Ford Mustang
    title: '1967 Ford Mustang GT',
    userName: 'Marcus T.',
    location: 'Detroit, MI',
    progress: 45,
    followers: 2105,
    likes: 1456,
    comments: 203,
    tags: ['Engine', 'Mechanical'],
    height: 520,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1080&q=80', // 1955 Chevy Bel Air
    title: '1955 Chevrolet Bel Air',
    userName: 'Sarah K.',
    location: 'Austin, TX',
    progress: 62,
    followers: 3204,
    likes: 2103,
    comments: 412,
    tags: ['Full Rebuild', 'Interior'],
    height: 380,
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1080&q=80', // Porsche 911
    title: '1973 Porsche 911 Carrera',
    userName: 'Alex R.',
    location: 'Los Angeles, CA',
    progress: 88,
    followers: 5612,
    likes: 4023,
    comments: 687,
    tags: ['Engine', 'Performance'],
    height: 480,
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1080&q=80', // Classic Ford truck
    title: '1972 Ford F-100 Custom',
    userName: 'Chris W.',
    location: 'Nashville, TN',
    progress: 31,
    followers: 892,
    likes: 543,
    comments: 89,
    tags: ['Bodywork', 'Paint'],
    height: 440,
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1564732111854-8e36e2f1d0c0?w=1080&q=80', // Mini Cooper vintage
    title: '1965 Mini Cooper S',
    userName: 'Emma V.',
    location: 'Seattle, WA',
    progress: 54,
    followers: 1567,
    likes: 1102,
    comments: 234,
    tags: ['Engine', 'Suspension'],
    height: 500,
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1080&q=80', // Land Rover Defender
    title: '1983 Land Rover Defender',
    userName: 'David L.',
    location: 'Denver, CO',
    progress: 71,
    followers: 2341,
    likes: 1876,
    comments: 345,
    tags: ['Full Rebuild', 'Off-Road'],
    height: 400,
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1080&q=80', // Ferrari Daytona
    title: '1969 Ferrari 365 GTB/4',
    userName: 'Ryan H.',
    location: 'Miami, FL',
    progress: 92,
    followers: 8934,
    likes: 6721,
    comments: 1203,
    tags: ['Full Rebuild', 'Performance'],
    height: 540,
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1080&q=80', // Dodge Challenger
    title: '1970 Dodge Challenger R/T',
    userName: 'Tom B.',
    location: 'Phoenix, AZ',
    progress: 39,
    followers: 1678,
    likes: 1234,
    comments: 267,
    tags: ['Engine', 'Paint'],
    height: 460,
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1080&q=80', // VW Beetle
    title: '1969 VW Beetle Convertible',
    userName: 'Lisa M.',
    location: 'San Diego, CA',
    progress: 58,
    followers: 2890,
    likes: 2341,
    comments: 456,
    tags: ['Interior', 'Electrical'],
    height: 420,
  },
  {
    id: 11,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1080&q=80', // BMW E30 M3
    title: '1986 BMW M3 E30',
    userName: 'Stefan B.',
    location: 'Munich, Germany',
    progress: 67,
    followers: 4521,
    likes: 3234,
    comments: 589,
    tags: ['Engine', 'Suspension', 'Performance'],
    height: 490,
  },
  {
    id: 12,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1080&q=80', // Camaro SS
    title: '1969 Chevrolet Camaro SS',
    userName: 'Mike D.',
    location: 'Houston, TX',
    progress: 52,
    followers: 3104,
    likes: 2567,
    comments: 401,
    tags: ['Full Rebuild', 'Paint'],
    height: 410,
  },
  {
    id: 13,
    image: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=1080&q=80', // Corvette C1
    title: '1957 Chevrolet Corvette',
    userName: 'Jennifer L.',
    location: 'Charlotte, NC',
    progress: 81,
    followers: 6789,
    likes: 5432,
    comments: 891,
    tags: ['Engine', 'Interior', 'Chrome'],
    height: 530,
  },
  {
    id: 14,
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1080&q=80', // Mazda MX-5 Miata
    title: '1991 Mazda MX-5 Miata',
    userName: 'Kenji T.',
    location: 'Tokyo, Japan',
    progress: 44,
    followers: 2134,
    likes: 1789,
    comments: 312,
    tags: ['Suspension', 'Turbo'],
    height: 450,
  },
  {
    id: 15,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1080&q=80', // Aston Martin DB5
    title: '1963 Aston Martin DB5',
    userName: 'James M.',
    location: 'London, UK',
    progress: 93,
    followers: 12456,
    likes: 9876,
    comments: 1543,
    tags: ['Full Rebuild', 'Luxury'],
    height: 510,
  },
  {
    id: 16,
    image: 'https://images.unsplash.com/photo-1622676885379-ec2e03e5e5d2?w=1080&q=80', // International Scout
    title: '1979 International Scout II',
    userName: 'Wade P.',
    location: 'Colorado Springs, CO',
    progress: 38,
    followers: 1456,
    likes: 987,
    comments: 189,
    tags: ['Off-Road', 'Lift Kit'],
    height: 390,
  },
  {
    id: 17,
    image: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=1080&q=80', // Datsun 240Z
    title: '1974 Datsun 240Z',
    userName: 'Carlos R.',
    location: 'Barcelona, Spain',
    progress: 61,
    followers: 3567,
    likes: 2890,
    comments: 478,
    tags: ['Engine', 'Bodywork'],
    height: 470,
  },
  {
    id: 18,
    image: 'https://images.unsplash.com/photo-1610768764270-790fbec18178?w=1080&q=80', // Alfa Romeo Spider
    title: '1968 Alfa Romeo Spider',
    userName: 'Giovanni F.',
    location: 'Rome, Italy',
    progress: 73,
    followers: 4234,
    likes: 3456,
    comments: 623,
    tags: ['Interior', 'Paint', 'Chrome'],
    height: 540,
  },
  {
    id: 19,
    image: 'https://images.unsplash.com/photo-1551830820-330a71b99f5f?w=1080&q=80', // DeLorean DMC-12
    title: '1982 DeLorean DMC-12',
    userName: 'Doc B.',
    location: 'Hill Valley, CA',
    progress: 88,
    followers: 7654,
    likes: 6234,
    comments: 987,
    tags: ['Electrical', 'Stainless'],
    height: 430,
  },
  {
    id: 20,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1080&q=80', // Shelby GT350
    title: '1965 Shelby GT350',
    userName: 'Carroll S.',
    location: 'Dallas, TX',
    progress: 95,
    followers: 15678,
    likes: 12345,
    comments: 2134,
    tags: ['Full Rebuild', 'Racing'],
    height: 500,
  },
  {
    id: 21,
    image: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=1080&q=80', // Mercedes 300SL
    title: '1956 Mercedes-Benz 300SL',
    userName: 'Hans M.',
    location: 'Stuttgart, Germany',
    progress: 87,
    followers: 9876,
    likes: 8234,
    comments: 1432,
    tags: ['Engine', 'Gullwing', 'Luxury'],
    height: 520,
  },
  {
    id: 22,
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1080&q=80', // Plymouth Cuda
    title: '1970 Plymouth Cuda',
    userName: 'Randy H.',
    location: 'Memphis, TN',
    progress: 56,
    followers: 2987,
    likes: 2134,
    comments: 423,
    tags: ['Engine', 'Paint', 'Hemi'],
    height: 445,
  },
  {
    id: 23,
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1080&q=80', // Toyota Supra MK4
    title: '1994 Toyota Supra MK4',
    userName: 'Brian O.',
    location: 'Los Angeles, CA',
    progress: 79,
    followers: 8765,
    likes: 7123,
    comments: 1234,
    tags: ['Turbo', 'Performance', '2JZ'],
    height: 485,
  },
  {
    id: 24,
    image: 'https://images.unsplash.com/photo-1599912027806-293fd9556726?w=1080&q=80', // Buick Grand National
    title: '1987 Buick Grand National',
    userName: 'Tyrone B.',
    location: 'Atlanta, GA',
    progress: 48,
    followers: 2345,
    likes: 1876,
    comments: 312,
    tags: ['Turbo', 'Black', 'GNX'],
    height: 400,
  },
  {
    id: 25,
    image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=1080&q=80', // Cadillac Eldorado
    title: '1959 Cadillac Eldorado',
    userName: 'Patricia W.',
    location: 'New Orleans, LA',
    progress: 84,
    followers: 5432,
    likes: 4321,
    comments: 789,
    tags: ['Full Rebuild', 'Chrome', 'Fins'],
    height: 550,
  },
]

export function Explore() {
  return (
    <div className="min-h-screen app-bg-primary overflow-y-auto">
      {/* Masonry Grid - Pinterest style */}
      <div className="p-6">
        <div
          className="masonry-grid"
          style={{
            columnCount: 4,
            columnGap: '24px',
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className="masonry-item mb-6"
              style={{
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
              }}
            >
              <div style={{ height: `${project.height}px` }}>
                <ProjectCard {...project} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .masonry-grid {
          @media (max-width: 1280px) {
            column-count: 3;
          }
          @media (max-width: 768px) {
            column-count: 2;
          }
          @media (max-width: 640px) {
            column-count: 1;
          }
        }
      `}</style>
    </div>
  )
}
