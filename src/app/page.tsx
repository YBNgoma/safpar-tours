import { Header } from '@/components/common/Header';
import { TourCard } from '@/components/tours/TourCard';
import { MapPin, Star, Users } from 'lucide-react';

// Featured tours with S3 images
const featuredTours = [
  {
    id: 1,
    name: 'Zambezi Sunset Cruise',
    slug: 'zambezi-sunset-cruise',
    short_description: 'Peaceful evening cruise with drinks and wildlife spotting',
    category: 'river-cruise',
    duration_hours: 3,
    max_participants: 20,
    difficulty_level: 'easy' as const,
    featured_image: 'images/river-cruises/zambezi-sunset-cruise.jpg',
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
    difficulty_level: 'challenging' as const,
    featured_image: 'images/adventure-activities/white-water-rafting.jpg',
    adult_price: 165
  },
  {
    id: 3,
    name: 'Mosi-oa-Tunya Wildlife Safari',
    slug: 'mosi-oa-tunya-safari',
    short_description: 'Explore Zambias premier wildlife park with rhino encounters',
    category: 'wildlife',
    duration_hours: 4,
    max_participants: 8,
    difficulty_level: 'moderate' as const,
    featured_image: 'images/wildlife-safaris/mosi-oa-tunya-safari.jpg',
    adult_price: 95
  },
  {
    id: 4,
    name: 'Cultural Village Experience',
    slug: 'cultural-village-tour',
    short_description: 'Immerse in local Zambian culture with authentic village visits',
    category: 'cultural',
    duration_hours: 5,
    max_participants: 15,
    difficulty_level: 'easy' as const,
    featured_image: 'images/cultural-tours/village-experience.jpg',
    adult_price: 75
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Safari Par Excellence
            </h1>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed">
              Experience the ultimate Zambian adventure with river cruises, white-water rafting, 
              and wildlife safaris at Victoria Falls.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Explore Tours
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Safpar Tours?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Local expertise, authentic experiences, and unmatched adventure in the heart of Zambia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Expertise</h3>
              <p className="text-gray-600">Born and raised in Zambia, we know the best spots and hidden gems</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Experience</h3>
              <p className="text-gray-600">Small groups, personal attention, and authentic cultural experiences</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safety First</h3>
              <p className="text-gray-600">Professional guides, top equipment, and comprehensive safety protocols</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Adventures
            </h2>
            <p className="text-xl text-gray-600">
              Discover our most popular tours and activities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTours.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              View All Tours
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for Your Zambian Adventure?
          </h2>
          <p className="text-xl mb-8">
            Contact us today to plan your unforgettable Victoria Falls experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Book Now
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition-colors">
              Get Quote
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">SAFPAR</h3>
              <p className="text-gray-400">
                Safari Par Excellence - Your gateway to authentic Zambian adventure
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Tours</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Activities</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">River Cruises</a></li>
                <li><a href="#" className="hover:text-white">White-water Rafting</a></li>
                <li><a href="#" className="hover:text-white">Wildlife Safaris</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="text-gray-400 space-y-2">
                <p>+260 21 3 323589</p>
                <p>info@safpar.com</p>
                <p>Victoria Falls, Zambia</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Safpar Tours. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
