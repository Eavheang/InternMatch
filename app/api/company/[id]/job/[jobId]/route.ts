import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { jobPostings, companies, applications, students } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';

// PUT - Update job posting
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; jobId: string }> }
  ) {
    try {
      const userId = (await params).id; // This is the userId from URL
      const jobId = (await params).jobId;
      const body = await request.json();
  
      const {
        jobTitle,
        jobDescription,
        status,
        requirements,
        benefits,
        salaryRange,
        location,
        jobType,
        experienceLevel,
        aiGenerated
      } = body;
  
      // First, verify company exists by userId
      const company = await db
        .select()
        .from(companies)
        .where(eq(companies.userId, userId))
        .limit(1);
  
      if (company.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Company not found' 
          },
          { status: 404 }
        );
      }
  
      // Verify job exists and belongs to company
      const existingJob = await db
        .select()
        .from(jobPostings)
        .where(
          and(
            eq(jobPostings.id, jobId),
            eq(jobPostings.companyId, company[0].id) // Use company.id
          )
        )
        .limit(1);
  
      if (existingJob.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Job not found or does not belong to this company' 
          },
          { status: 404 }
        );
      }
  
      // Update job posting
      const updatedJob = await db
        .update(jobPostings)
        .set({
          ...(jobTitle && { jobTitle }),
          ...(jobDescription && { jobDescription }),
          ...(status && { status }),
          ...(requirements !== undefined && { requirements }),
          ...(benefits !== undefined && { benefits }),
          ...(salaryRange !== undefined && { salaryRange }),
          ...(location !== undefined && { location }),
          ...(jobType && { jobType }),
          ...(experienceLevel && { experienceLevel }),
          ...(aiGenerated !== undefined && { aiGenerated }),
          updatedAt: new Date()
        })
        .where(eq(jobPostings.id, jobId))
        .returning();
  
      return NextResponse.json({
        success: true,
        data: updatedJob[0],
        message: 'Job posting updated successfully'
      });
  
    } catch (error) {
      console.error('Error updating job posting:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update job posting',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
  
  // DELETE - Delete job posting
  export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; jobId: string }> }
  ) {
    try {
      const userId = (await params).id; // This is the userId from URL
      const jobId = (await params).jobId;
  
      // First, verify company exists by userId
      const company = await db
        .select()
        .from(companies)
        .where(eq(companies.userId, userId))
        .limit(1);
  
      if (company.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Company not found' 
          },
          { status: 404 }
        );
      }
  
      // Verify job exists and belongs to company
      const existingJob = await db
        .select()
        .from(jobPostings)
        .where(
          and(
            eq(jobPostings.id, jobId),
            eq(jobPostings.companyId, company[0].id) // Use company.id
          )
        )
        .limit(1);
  
      if (existingJob.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Job not found or does not belong to this company' 
          },
          { status: 404 }
        );
      }
  
      // Delete job posting (cascade will handle applications)
      await db
        .delete(jobPostings)
        .where(eq(jobPostings.id, jobId));
  
      return NextResponse.json({
        success: true,
        message: 'Job posting deleted successfully'
      });
  
    } catch (error) {
      console.error('Error deleting job posting:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete job posting',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }