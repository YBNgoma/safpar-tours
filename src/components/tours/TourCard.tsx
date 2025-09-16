import React from 'react';
import Image from 'next/image';
import { Clock, Users, MapPin } from 'lucide-react';

interface TourCardProps {
  tour: {
    id: number;
    name: string;
    slug: string;
    short_description: string;
    category: string;
    duration_hours: number;
    max_participants: number;
    difficulty_level: 'easy' | 'moderate' | 'challenging';
    featured_image: string;
    adult_price: number;
  };
}

export function TourCard({ tour }: TourCardProps) {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800', 
    challenging: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48">
        <Image
          src={tour.featured_image}
          alt={tour.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[tour.difficulty_level]}`}>
            {tour.difficulty_level}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{tour.name}</h3>
        <p className="text-gray-600 mb-4">{tour.short_description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {tour.duration_hours}h
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            Up to {tour.max_participants}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-orange-600">
              ${tour.adult_price}
            </span>
            <span className="text-gray-500"> /person</span>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}