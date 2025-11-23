# Subscription Auto-Renewal System

This directory contains the auto-renewal functionality for monthly subscriptions.

## Overview

The system automatically renews user subscriptions every month based on their chosen plan. When a user subscribes to a paid plan, their subscription is set to expire 1 month from the payment date, and auto-renewal is enabled by default.

## API Endpoints

### POST `/api/subscriptions/auto-renew`

Processes monthly subscription renewals. This endpoint should be called by a cron job or scheduled task daily.

**Authentication:**
- Requires `AUTO_RENEW_SECRET_TOKEN` environment variable
- Header: `Authorization: Bearer <token>`

**Functionality:**
- Finds all subscriptions that have expired or are expiring today
- Creates new pending transactions for renewals
- Note: Currently creates pending transactions that require manual payment processing
- In production, integrate with PayWay's recurring payment API to automatically charge users

**Response:**
```json
{
  "success": true,
  "processed": 5,
  "renewals": [
    {
      "userId": "...",
      "oldTranId": "...",
      "newTranId": "...",
      "plan": "pro",
      "amount": 15,
      "status": "pending_manual_payment"
    }
  ]
}
```

### POST `/api/subscriptions/cancel-auto-renew`

Allows users to cancel their auto-renewal subscription.

**Authentication:** Requires user authentication token

**Request Body:**
```json
{
  "tranId": "transaction_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-renewal cancelled successfully",
  "transaction": { ... }
}
```

## Setting Up Auto-Renewal Cron Job

### Option 1: Using Vercel Cron (Recommended for Vercel deployments)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/subscriptions/auto-renew",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Set environment variable:
```
AUTO_RENEW_SECRET_TOKEN=your-secret-token-here
```

### Option 2: Using External Cron Service

Use a service like:
- **cron-job.org**
- **EasyCron**
- **GitHub Actions** (with scheduled workflows)

Example cron job:
```bash
# Run daily at midnight UTC
0 0 * * * curl -X POST https://your-domain.com/api/subscriptions/auto-renew \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN"
```

### Option 3: Using Node.js Cron Library

If running on a server, use `node-cron`:
```javascript
const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
  await fetch('http://localhost:3000/api/subscriptions/auto-renew', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AUTO_RENEW_SECRET_TOKEN}`
    }
  });
});
```

## Database Schema

The `transactions` table includes:
- `expiresAt`: Subscription expiration date (1 month from payment)
- `autoRenew`: Boolean flag for auto-renewal status
- `nextBillingDate`: Next billing date for auto-renewal

## Future Enhancements

1. **Automatic Payment Processing**: Integrate with PayWay's recurring payment API to automatically charge users
2. **Payment Retry Logic**: Retry failed payments with exponential backoff
3. **Email Notifications**: Notify users before expiration and on renewal
4. **Grace Period**: Allow access for a few days after expiration before downgrading to free plan
5. **Payment Method Management**: Allow users to update their payment method

