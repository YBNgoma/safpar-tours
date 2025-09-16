import { NextApiRequest, NextApiResponse } from 'next';

// This API endpoint will be implemented when we connect to RDS
// For now, this is a placeholder

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Mock data for Safpar tours
    const tours = [
      {
        id: 1,
        name: 'Zambezi Sunset Cruise',
        slug: 'zambezi-sunset-cruise',
        short_description: 'Peaceful evening cruise with drinks and wildlife spotting',
        category: 'river-cruise',
        duration_hours: 3,
        max_participants: 20,
        difficulty_level: 'easy',
        featured_image: '/images/sunset-cruise.jpg',
        adult_price: 65
      },
      {
        id: 2,
        name: 'Victoria Falls White-Water Rafting',
        slug: 'victoria-falls-rafting',
        short_description: 'Grade 5 rapids adventure below Victoria Falls',
        category: 'adventure',
        duration_hours: 6,
        max_participants: 12,
        difficulty_level: 'challenging',
        featured_image: '/images/rafting.jpg',
        adult_price: 165
      }
    ];

    res.status(200).json(tours);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}