import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { query } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth';

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await query('SELECT * FROM success_cases ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching success cases:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { patient_name, comment, metrics, image_url, rating } = await request.json();
    
    if (!patient_name || !comment) {
      return NextResponse.json({ error: 'Name and comment are required' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO success_cases (patient_name, comment, metrics, image_url, rating) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [patient_name, comment, metrics || '', image_url || '', rating !== undefined ? rating : 5]
    );

    revalidatePath('/');
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating success case:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, patient_name, comment, metrics, image_url, rating } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await query(
      'UPDATE success_cases SET patient_name = $1, comment = $2, metrics = $3, image_url = $4, rating = $5 WHERE id = $6 RETURNING *',
      [patient_name, comment, metrics || '', image_url || '', rating !== undefined ? rating : 5, id]
    );

    revalidatePath('/');
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating success case:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await query('DELETE FROM success_cases WHERE id = $1', [id]);

    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting success case:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
