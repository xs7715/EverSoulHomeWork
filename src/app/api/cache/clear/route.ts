import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // 获取删除前的记录数
    const beforeCount = await prisma.gameDataCache.count();
    
    // 实际删除所有缓存记录
    const result = await prisma.gameDataCache.deleteMany({});
    
    // 执行VACUUM操作以收缩数据库文件
    await prisma.$executeRaw`VACUUM`;

    return NextResponse.json({
      success: true,
      message: `缓存已清除，删除了 ${result.count} 条记录，数据库已优化`,
      deletedCount: result.count,
      beforeCount
    });

  } catch (error) {
    console.error('清除缓存失败:', error);
    return NextResponse.json(
      { success: false, message: '清除缓存失败' },
      { status: 500 }
    );
  }
} 