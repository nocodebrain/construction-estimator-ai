import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, location, clientName } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // TODO: Get userId from session (for now, use a placeholder)
    const userId = 'demo-user'; // Replace with auth later

    // Ensure demo user exists (for development)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'demo@example.com',
        name: 'Demo User',
      },
    });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        location,
        clientName,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// List all projects
export async function GET(request: NextRequest) {
  try {
    // TODO: Filter by userId from session
    const userId = 'demo-user';

    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        files: {
          select: {
            id: true,
            name: true,
            type: true,
            size: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            files: true,
            quantities: true,
            lineItems: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('List projects error:', error);
    return NextResponse.json(
      { error: 'Failed to list projects' },
      { status: 500 }
    );
  }
}
