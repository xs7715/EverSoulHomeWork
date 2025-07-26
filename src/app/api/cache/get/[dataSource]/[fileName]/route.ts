import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { dataSource: string; fileName: string } }
) {
  try {
    const { dataSource, fileName } = params;

    const cacheEntry = await prisma.gameDataCache.findUnique({
      where: {
        dataSource_fileName: {
          dataSource,
          fileName
        }
      }
    });

    if (!cacheEntry || !cacheEntry.isValid) {
      return NextResponse.json(
        { success: false, message: '缓存不存在或已失效' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cacheEntry.data,
      fetchedAt: cacheEntry.fetchedAt,
      isValid: cacheEntry.isValid
    });

  } catch (error) {
    console.error('获取缓存数据失败:', error);
    return NextResponse.json(
      { success: false, message: '获取缓存数据失败' },
      { status: 500 }
    );
  }
} 