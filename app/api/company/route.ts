import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, companies } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET - Fetch list of companies (for students or browsing)
export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const industry = searchParams.get('industry');
      const companySize = searchParams.get('companySize');
      const location = searchParams.get('location');
      const keyword = searchParams.get('keyword');
  
      const offset = (page - 1) * limit;
  
      const conditions = [eq(users.isVerified, true)];
      if (industry) conditions.push(eq(companies.industry, industry));
      if (companySize) conditions.push(eq(companies.companySize, companySize));
      if (location) conditions.push(eq(companies.location, location));
  
      const companiesList = await db
        .select({
          id: companies.id,
          userId: companies.userId,
          companyName: companies.companyName,
          industry: companies.industry,
          companySize: companies.companySize,
          website: companies.website,
          companyLogo: companies.companyLogo,
          location: companies.location,
          description: companies.description,
          contactName: companies.contactName,
          contactEmail: companies.contactEmail,
          isVerified: users.isVerified,
          createdAt: companies.createdAt
        })
        .from(companies)
        .innerJoin(users, eq(users.id, companies.userId))
        .where(
            conditions.length === 1
                ? conditions[0]
                : (await import('drizzle-orm')).and(...conditions)
        )
        .orderBy(desc(companies.createdAt))
        .limit(limit)
        .offset(offset);
      return NextResponse.json({
        success: true,
        data: companiesList,
        pagination: { page, limit, total: companiesList.length }
      }, { status: 200 });
    } catch (error) {
      console.error('Companies list fetch error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }