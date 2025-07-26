import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stats = await prisma.gameDataCache.groupBy({
      by: ['dataSource'],
      _count: { id: true },
      _max: { updatedAt: true }
    });

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('获取缓存统计失败:', error);
    return NextResponse.json(
      { success: false, message: '获取缓存统计失败' },
      { status: 500 }
    );
  }
} 