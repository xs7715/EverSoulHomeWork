import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface MigrationStatus {
  needsMigration: boolean;
  pendingMigrations: string[];
  error?: string;
}

/**
 * 检查是否需要数据库迁移
 */
export async function checkMigrationStatus(): Promise<MigrationStatus> {
  try {
    console.log('🔍 检查数据库迁移状态...');
    
    // 检查是否有待应用的迁移
    const { stdout, stderr } = await execAsync('npx prisma migrate status', {
      cwd: process.cwd()
    });
    
    if (stderr && stderr.includes('drift detected')) {
      console.log('⚠️ 检测到数据库结构偏移');
      return {
        needsMigration: true,
        pendingMigrations: ['drift-fix'],
        error: '数据库结构与schema不一致'
      };
    }
    
    if (stdout.includes('Following migration have not yet been applied:') || 
        stdout.includes('Database schema is not up to date')) {
      console.log('📋 发现待应用的迁移');
      
      // 提取待应用的迁移名称
      const migrationLines = stdout.split('\n').filter(line => 
        line.trim().startsWith('• ')
      );
      
      const pendingMigrations = migrationLines.map(line => 
        line.trim().replace('• ', '')
      );
      
      return {
        needsMigration: true,
        pendingMigrations
      };
    }
    
    if (stdout.includes('Database is up to date') || 
        stdout.includes('No pending migrations found')) {
      console.log('✅ 数据库已是最新版本');
      return {
        needsMigration: false,
        pendingMigrations: []
      };
    }
    
    return {
      needsMigration: false,
      pendingMigrations: []
    };
    
  } catch (error) {
    console.error('❌ 检查迁移状态失败:', error);
    return {
      needsMigration: true,
      pendingMigrations: [],
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

/**
 * 自动应用数据库迁移
 */
export async function applyMigrations(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🚀 开始应用数据库迁移...');
    
    // 首先尝试应用待处理的迁移
    const { stdout: migrateOutput, stderr: migrateError } = await execAsync(
      'npx prisma migrate deploy', 
      { cwd: process.cwd() }
    );
    
    if (migrateError && !migrateError.includes('All migrations have been successfully applied')) {
      console.error('迁移应用过程中的警告:', migrateError);
    }
    
    console.log('迁移输出:', migrateOutput);
    
    // 重新生成Prisma客户端
    console.log('🔄 重新生成Prisma客户端...');
    await execAsync('npx prisma generate', { cwd: process.cwd() });
    
    // 再次检查状态
    const finalStatus = await checkMigrationStatus();
    
    if (finalStatus.needsMigration) {
      // 如果仍然需要迁移，可能是drift问题，尝试修复
      console.log('🔧 尝试修复数据库结构偏移...');
      
      try {
        await execAsync('npx prisma db push --accept-data-loss=false', { cwd: process.cwd() });
        await execAsync('npx prisma generate', { cwd: process.cwd() });
        
        return {
          success: true,
          message: '数据库迁移完成（通过db push修复）'
        };
      } catch (pushError) {
        console.error('db push失败:', pushError);
        return {
          success: false,
          message: `自动迁移失败: ${pushError}`
        };
      }
    }
    
    return {
      success: true,
      message: '数据库迁移完成'
    };
    
  } catch (error) {
    console.error('❌ 应用迁移失败:', error);
    return {
      success: false,
      message: `迁移失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

/**
 * 测试数据库连接
 */
export async function testDatabaseConnection(): Promise<boolean> {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    await prisma.$disconnect();
    console.log('✅ 数据库连接正常');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    await prisma.$disconnect();
    return false;
  }
}

/**
 * 完整的数据库健康检查和自动修复
 */
export async function performDatabaseHealthCheck(): Promise<{
  success: boolean;
  message: string;
  actions: string[];
}> {
  const actions: string[] = [];
  
  try {
    // 1. 检查数据库连接
    const canConnect = await testDatabaseConnection();
    if (!canConnect) {
      return {
        success: false,
        message: '数据库连接失败',
        actions
      };
    }
    actions.push('数据库连接正常');
    
    // 2. 检查迁移状态
    const migrationStatus = await checkMigrationStatus();
    
    if (!migrationStatus.needsMigration) {
      return {
        success: true,
        message: '数据库状态正常，无需迁移',
        actions: [...actions, '数据库已是最新版本']
      };
    }
    
    // 3. 如果需要迁移，自动应用
    actions.push(`发现 ${migrationStatus.pendingMigrations.length} 个待应用迁移`);
    
    const migrationResult = await applyMigrations();
    actions.push(migrationResult.message);
    
    if (!migrationResult.success) {
      return {
        success: false,
        message: '自动迁移失败',
        actions
      };
    }
    
    // 4. 最终验证
    const finalStatus = await checkMigrationStatus();
    if (finalStatus.needsMigration) {
      actions.push('警告: 迁移后仍有待处理项目');
      return {
        success: false,
        message: '迁移不完整',
        actions
      };
    }
    
    actions.push('数据库迁移完成，状态正常');
    return {
      success: true,
      message: '数据库健康检查和迁移完成',
      actions
    };
    
  } catch (error) {
    console.error('数据库健康检查失败:', error);
    return {
      success: false,
      message: `健康检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
      actions
    };
  }
} 