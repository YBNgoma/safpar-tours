'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, X, Phone, Mail } from 'lucide-react';
import LoginButton from '../auth/LoginButton';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-lg">
      {/* Top bar with contact info */}
      <div className="bg-blue-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex space-x-6">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>+260 21 3 323589</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@safpar.com</span>
              </div>
            </div>
            <div className="hidden md:block">
              <span>Experience Zambian Adventure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              SAFPAR
              <span className="text-orange-500 text-sm block">Safari Par Excellence</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-orange-500 font-medium">
              Home
            </Link>
            <Link href="/tours" className="text-gray-700 hover:text-orange-500 font-medium">
              Tours & Activities
            </Link>
            <Link href="/river-cruises" className="text-gray-700 hover:text-orange-500 font-medium">
              River Cruises
            </Link>
            <Link href="/adventure" className="text-gray-700 hover:text-orange-500 font-medium">
              Adventure
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-500 font-medium">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-orange-500 font-medium">
              Contact
            </Link>
          </nav>

          {/* Auth and CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <LoginButton />
            <Link
              href="/contact"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-700 hover:text-orange-500 font-medium py-2">
                Home
              </Link>
              <Link href="/tours" className="text-gray-700 hover:text-orange-500 font-medium py-2">
                Tours & Activities
              </Link>
              <Link href="/river-cruises" className="text-gray-700 hover:text-orange-500 font-medium py-2">
                River Cruises
              </Link>
              <Link href="/adventure" className="text-gray-700 hover:text-orange-500 font-medium py-2">
                Adventure
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-orange-500 font-medium py-2">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-orange-500 font-medium py-2">
                Contact
              </Link>
              <Link
                href="/contact"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors text-center mt-4"
              >
                Book Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}