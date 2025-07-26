import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { dataSource: string; fileName: string } }
) {
  try {
    const { dataSource, fileName } = params;
    const body = await request.json();
    const { data, fetchedAt, isValid } = body;

    await prisma.gameDataCache.upsert({
      where: {
        dataSource_fileName: {
          dataSource,
          fileName
        }
      },
      update: {
        data,
        fetchedAt: new Date(fetchedAt),
        isValid
      },
      create: {
        dataSource,
        fileName,
        data,
        fetchedAt: new Date(fetchedAt),
        isValid
      }
    });

    return NextResponse.json({
      success: true,
      message: '缓存保存成功'
    });

  } catch (error) {
    console.error('保存缓存数据失败:', error);
    return NextResponse.json(
      { success: false, message: '保存缓存数据失败' },
      { status: 500 }
    );
  }
} 