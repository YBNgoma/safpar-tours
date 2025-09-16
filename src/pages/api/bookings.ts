import { NextApiRequest, NextApiResponse } from 'next';
import { createBookingInquiry, getBookingInquiries, updateBookingInquiryStatus } from '@/lib/database';
import { getSession } from 'next-auth/react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
      // Create new booking inquiry
      const {
        tourId,
        customerName,
        customerEmail,
        customerPhone,
        preferredDate,
        participantsAdult,
        participantsChild,
        participantsInfant,
        specialRequirements,
        message
      } = req.body;

      // Validate required fields
      if (!tourId || !customerName || !customerEmail || !participantsAdult) {
        return res.status(400).json({
          error: 'Missing required fields: tourId, customerName, customerEmail, participantsAdult'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        return res.status(400).json({
          error: 'Invalid email format'
        });
      }

      // Create the booking inquiry
      const inquiryId = await createBookingInquiry({
        tourId: parseInt(tourId),
        customerName,
        customerEmail,
        customerPhone,
        preferredDate,
        participantsAdult: parseInt(participantsAdult) || 1,
        participantsChild: parseInt(participantsChild) || 0,
        participantsInfant: parseInt(participantsInfant) || 0,
        specialRequirements,
        message
      });

      res.status(201).json({
        success: true,
        inquiryId,
        message: 'Booking inquiry created successfully'
      });

    } else if (req.method === 'GET') {
      // Get booking inquiries (admin only)
      const session = await getSession({ req });
      
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { status, limit = 50, offset = 0 } = req.query;

      const inquiries = await getBookingInquiries(
        status as string,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.status(200).json({
        inquiries,
        count: inquiries.length,
        filters: {
          status: status || null,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        }
      });

    } else if (req.method === 'PATCH') {
      // Update booking inquiry status (admin only)
      const session = await getSession({ req });
      
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { inquiryId, status, adminNotes } = req.body;

      if (!inquiryId || !status) {
        return res.status(400).json({
          error: 'Missing required fields: inquiryId, status'
        });
      }

      const validStatuses = ['pending', 'contacted', 'confirmed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }

      const success = await updateBookingInquiryStatus(
        parseInt(inquiryId),
        status,
        adminNotes
      );

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Booking inquiry updated successfully'
        });
      } else {
        res.status(404).json({
          error: 'Booking inquiry not found'
        });
      }

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Bookings API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}