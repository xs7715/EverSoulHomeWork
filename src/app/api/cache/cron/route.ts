import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/cache/cron
 * 定时缓存更新接口（可以通过cron服务调用）
 */
export async function GET(request: NextRequest) {
  try {
    // 简单的授权检查（你可以添加更复杂的验证）
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    // 检查是否有正在运行的自动更新任务
    const runningTask = await prisma.cacheUpdateTask.findFirst({
      where: {
        taskType: 'auto',
        status: 'running'
      }
    });

    if (runningTask) {
      return NextResponse.json({
        success: false,
        message: '已有自动更新任务正在运行',
        taskId: runningTask.id
      });
    }

    // 调用缓存更新API
    const updateResponse = await fetch(new URL('/api/cache/update', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataSource: 'all',
        isManual: false
      })
    });

    const updateResult = await updateResponse.json();

    return NextResponse.json({
      success: true,
      message: '定时缓存更新触发成功',
      updateResult
    });

  } catch (error) {
    console.error('定时缓存更新失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '定时缓存更新失败' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cache/cron
 * 手动触发定时更新（测试用）
 */
export async function POST(request: NextRequest) {
  // 直接调用GET方法
  return GET(request);
} 