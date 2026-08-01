import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey) {
      // 1. REAL STRIPE CHECKOUT
      console.log(`💳 Initializing Stripe Checkout session for user ${userId}...`);
      
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-01-27.acronyms' as any, // Standard latest API version
      });

      const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: 'InvestorIQ Premium Plan',
                description: 'Unlimited scans (PDF, Image, Excel), Gemini 2.0 Flash Vision OCR, and advanced AI duplicate detection.',
              },
              unit_amount: 99900, // ₹999.00 INR
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${nextAuthUrl}/settings?upgrade=success`,
        cancel_url: `${nextAuthUrl}/pricing?upgrade=cancel`,
        customer_email: userEmail || undefined,
        metadata: {
          userId,
        },
      });

      return NextResponse.json({ url: checkoutSession.url });
    } else {
      // 2. DEVELOPER MOCK CHECKOUT
      console.log(`⚠️ Stripe Key missing in .env. Simulating mock checkout for user ${userId}...`);
      await connectDB();

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Upgrade user to premium instantly
      user.plan = 'premium';
      user.planStartedAt = new Date();
      user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days expiry
      user.billingCycle = 'monthly';
      user.scansLimit = undefined; // Unlimited scans
      
      await user.save();

      return NextResponse.json({
        mock: true,
        message: 'Developer Mode: Upgraded to Premium successfully (mock checkout)!',
      });
    }
  } catch (error: any) {
    console.error('Checkout creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize subscription checkout' }, { status: 500 });
  }
}
