import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    console.warn('⚠️ Stripe credentials missing in webhook route. Ignoring.');
    return NextResponse.json({ error: 'Webhook secrets not configured' }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-01-27.acronyms' as any,
  });

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    await connectDB();

    console.log(`🔔 Stripe Webhook received event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
          console.log(`💰 Checkout session completed for user ${userId}. Upgrading to Premium...`);
          await User.findByIdAndUpdate(userId, {
            plan: 'premium',
            scansLimit: undefined,
            billingCycle: 'monthly',
            planStartedAt: new Date(),
            planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days default extension
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;
        
        // Retrieve subscription details to find associated user
        const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
        const userId = subscription.metadata?.userId;

        if (userId) {
          console.log(`💰 Subscription payment succeeded for user ${userId}. Renewing plan...`);
          await User.findByIdAndUpdate(userId, {
            plan: 'premium',
            scansLimit: undefined,
            planExpiresAt: new Date(subscription.current_period_end * 1000),
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;

        if (userId) {
          console.log(`❌ Subscription canceled for user ${userId}. Downgrading to Free...`);
          await User.findByIdAndUpdate(userId, {
            plan: 'free',
            scansLimit: 5,
            billingCycle: undefined,
            planStartedAt: undefined,
            planExpiresAt: undefined,
          });
        }
        break;
      }

      default:
        console.log(`⏭️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
