# Usage Limits Implementation

This document describes the usage limit system implemented for subscription plans.

## Overview

The system tracks feature usage per user per month based on their subscription plan. Limits are enforced at the API level before processing requests.

## Database Schema

### `usage_tracking` Table
- `id`: UUID primary key
- `userId`: Foreign key to users table
- `feature`: Feature name (e.g., "role_suggestion", "interview_prep")
- `month`: Month in "YYYY-MM" format
- `count`: Current usage count for the month
- `limit`: Monthly limit based on plan
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## Feature Limits by Plan

### Student Plans

#### Free Plan
- **Role Suggestion**: 1 month duration
- **Interview Preps**: 5 times/month
- **ATS Analyze**: 1 month duration
- **Resume Generation**: 1/month

#### Basic Plan ($5/month)
- **Role Suggestion**: 3 months duration
- **Interview Preps**: 15 times/month
- **ATS Analyze**: 5 months duration
- **Resume Generation**: 5/month

#### Pro Plan ($15/month)
- **Role Suggestion**: 5 months duration
- **Interview Preps**: 45 times/month
- **ATS Analyze**: 15 months duration
- **Resume Generation**: 15/month

### Company Plans

#### Free Plan
- **Job Prediction**: 5 times/month
- **Alternative Role**: 5 times/month
- **Interview Questions**: 5 times/month

#### Growth Plan ($15/month)
- **Job Prediction**: 10 times/month
- **Alternative Role**: 10 times/month
- **Interview Questions**: 10 times/month

#### Enterprise Plan ($25/month)
- **Job Prediction**: 20 times/month
- **Alternative Role**: 20 times/month
- **Interview Questions**: 20 times/month

## Implementation Details

### Duration-Based Features
- `role_suggestion`: Access duration based on subscription months
- `ats_analyze`: Access duration based on subscription months

These features check subscription expiration rather than monthly counts.

### Count-Based Features
- `interview_prep`: Monthly count limit
- `resume_generate`: Monthly count limit
- `job_prediction`: Monthly count limit
- `alternative_role`: Monthly count limit
- `interview_questions`: Monthly count limit

These features track usage per month and reset automatically.

## API Endpoints with Limits

### Student Endpoints
1. **POST `/api/ai/role-suggestions`** - Role suggestion (duration-based)
2. **POST `/api/ai/student-interview-prep`** - Interview prep (count-based)
3. **POST `/api/ai/ats`** - ATS analyze (duration-based, students only)
4. **POST `/api/students/resume/analyze`** - Resume ATS analyze (duration-based)
5. **POST `/api/ai/resume`** - Resume generation (count-based)

### Company Endpoints
1. **POST `/api/ai/review`** - Job prediction & alternative role (count-based)
2. **POST `/api/ai/interview`** - Interview questions (count-based)

## Usage Tracking Flow

1. **Check Limit**: Before processing request, check if user has exceeded limit
2. **Process Request**: If allowed, process the request
3. **Increment Usage**: After successful generation, increment usage count

## Error Responses

When limit is exceeded, API returns:
```json
{
  "error": "You have reached your monthly limit of X for this feature. Your limit will reset next month, or upgrade your plan for higher limits."
}
```

Status code: `403 Forbidden`

## Monthly Reset

Usage counts automatically reset at the start of each month (based on `YYYY-MM` format). Duration-based features check subscription expiration dates.

## Migration Required

Run this SQL to create the `usage_tracking` table:

```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  month TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  limit INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_tracking_user_feature_month ON usage_tracking(user_id, feature, month);
```

## Testing

To test usage limits:
1. Make requests to limited endpoints
2. Check `usage_tracking` table for usage counts
3. Verify error responses when limits are exceeded
4. Test monthly reset by changing month value

