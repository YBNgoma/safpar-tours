import { NextApiRequest, NextApiResponse } from 'next';
import { getTourBySlug } from '@/lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({
      error: 'Tour slug is required'
    });
  }

  try {
    const tour = await getTourBySlug(slug);

    if (!tour) {
      return res.status(404).json({
        error: 'Tour not found',
        slug
      });
    }

    // Transform tour data for frontend
    const transformedTour = {
      ...tour,
      // Ensure image URLs are properly formatted
      featured_image: tour.featured_image || 'images/placeholder.jpg',
      image_urls: tour.image_urls || [tour.featured_image || 'images/placeholder.jpg'],
      category: tour.category_slug || 'general',
      // Add computed fields
      has_group_discount: tour.group_discount_percent > 0,
      effective_adult_price: tour.adult_price,
      effective_child_price: tour.child_price || tour.adult_price * 0.6,
      // Add pricing details
      pricing: {
        adult_price: tour.adult_price,
        child_price: tour.child_price,
        infant_price: tour.infant_price || 0,
        currency: tour.currency || 'USD',
        season: tour.season,
        group_discount_percent: tour.group_discount_percent,
        min_group_size: tour.min_group_size,
        valid_from: tour.valid_from,
        valid_to: tour.valid_to
      }
    };

    res.status(200).json({
      tour: transformedTour,
      success: true
    });

  } catch (error) {
    console.error('Tour detail API error:', error);

    // Fallback for specific tours if database is not available
    const fallbackTours: Record<string, unknown> = {
      'zambezi-sunset-cruise': {
        id: 1,
        name: 'Zambezi Sunset Cruise',
        slug: 'zambezi-sunset-cruise',
        description: 'Experience the magic of an African sunset while cruising the mighty Zambezi River. This peaceful evening cruise includes drinks, snacks, and the chance to spot hippos and crocodiles in their natural habitat.',
        short_description: 'Peaceful evening cruise with drinks and wildlife spotting',
        category: 'river-cruise',
        duration_hours: 3,
        max_participants: 20,
        min_participants: 2,
        difficulty_level: 'easy',
        featured_image: 'images/river-cruises/zambezi-sunset-cruise.jpg',
        inclusions: 'Welcome drinks, snacks, life jackets, professional guide, hotel transfers',
        exclusions: 'Meals, gratuities, personal expenses',
        requirements: 'No swimming ability required, suitable for all ages',
        meeting_point: 'Victoria Falls Waterfront',
        adult_price: 65,
        child_price: 35,
        currency: 'USD',
        featured: true
      },
      'victoria-falls-rafting': {
        id: 2,
        name: 'Victoria Falls White-Water Rafting',
        slug: 'victoria-falls-rafting',
        description: 'Navigate the world-famous Grade 5 rapids below Victoria Falls on the Zambezi River. This full-day adventure includes comprehensive safety briefing, professional guides, and a celebratory lunch.',
        short_description: 'Grade 5 rapids adventure below Victoria Falls',
        category: 'adventure',
        duration_hours: 6,
        max_participants: 12,
        min_participants: 4,
        difficulty_level: 'challenging',
        featured_image: 'images/adventure-activities/white-water-rafting.jpg',
        inclusions: 'Safety equipment, professional guides, lunch, transport, safety briefing',
        exclusions: 'Personal items, photos, gratuities',
        requirements: 'Must be able to swim, minimum age 15, good physical condition required',
        meeting_point: 'High Water Mark - Batoka Gorge',
        adult_price: 165,
        child_price: 115,
        currency: 'USD',
        featured: true
      }
    };

    const fallbackTour = fallbackTours[slug];
    
    if (fallbackTour) {
      res.status(200).json({
        tour: fallbackTour,
        success: true,
        fallback: true,
        error: 'Database unavailable, using fallback data'
      });
    } else {
      res.status(404).json({
        error: 'Tour not found',
        slug,
        message: 'Database unavailable and no fallback data for this tour'
      });
    }
  }
}