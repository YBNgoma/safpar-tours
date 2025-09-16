import { NextApiRequest, NextApiResponse } from 'next';
import { getActiveToursWithPricing, getToursByCategory, searchTours, checkDatabaseHealth } from '@/lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { category, search, featured, health } = req.query;

      // Health check endpoint
      if (health === 'true') {
        const healthCheck = await checkDatabaseHealth();
        return res.status(healthCheck.healthy ? 200 : 503).json(healthCheck);
      }

      let tours;

      if (search && typeof search === 'string') {
        // Search tours by keyword
        tours = await searchTours(search);
      } else if (category && typeof category === 'string') {
        // Get tours by category
        tours = await getToursByCategory(category);
      } else {
        // Get all active tours
        tours = await getActiveToursWithPricing();
      }

      // Filter featured tours if requested
      if (featured === 'true') {
        tours = tours.filter(tour => tour.featured);
      }

      // Transform data for frontend compatibility
      const transformedTours = tours.map(tour => ({
        ...tour,
        // Ensure image URLs are properly formatted
        featured_image: tour.featured_image || 'images/placeholder.jpg',
        category: tour.category_slug || 'general',
        // Add computed fields
        has_group_discount: tour.group_discount_percent > 0,
        effective_adult_price: tour.adult_price,
        effective_child_price: tour.child_price || tour.adult_price * 0.6
      }));

      res.status(200).json({
        tours: transformedTours,
        count: transformedTours.length,
        filters: {
          category: category || null,
          search: search || null,
          featured: featured === 'true'
        }
      });
    } catch (error) {
      console.error('Tours API error:', error);
      
      // Fallback to mock data if database is not available
      const fallbackTours = [
        {
          id: 1,
          name: 'Zambezi Sunset Cruise',
          slug: 'zambezi-sunset-cruise',
          short_description: 'Peaceful evening cruise with drinks and wildlife spotting',
          category: 'river-cruise',
          duration_hours: 3,
          max_participants: 20,
          difficulty_level: 'easy',
          featured_image: 'images/river-cruises/zambezi-sunset-cruise.jpg',
          adult_price: 65,
          featured: true
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
          featured_image: 'images/adventure-activities/white-water-rafting.jpg',
          adult_price: 165,
          featured: true
        }
      ];

      res.status(200).json({
        tours: fallbackTours,
        count: fallbackTours.length,
        fallback: true,
        error: 'Database unavailable, using fallback data'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
