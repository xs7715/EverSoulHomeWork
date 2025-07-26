#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function postDeploy() {
  console.log('\n🚀 开始部署后数据库迁移...\n');
  
  try {
    // 1. 检查迁移状态
    console.log('📋 检查迁移状态...');
    const { stdout: statusOutput } = await execAsync('npx prisma migrate status');
    console.log(statusOutput);
    
    // 2. 应用待处理的迁移
    console.log('🔄 应用数据库迁移...');
    const { stdout: migrateOutput } = await execAsync('npx prisma migrate deploy');
    console.log(migrateOutput);
    
    // 3. 重新生成Prisma客户端
    console.log('🔧 重新生成Prisma客户端...');
    const { stdout: generateOutput } = await execAsync('npx prisma generate');
    console.log(generateOutput);
    
    console.log('\n✅ 部署后迁移完成！');
    
    // 4. 最终状态检查
    console.log('\n📊 最终状态检查...');
    const { stdout: finalStatus } = await execAsync('npx prisma migrate status');
    console.log(finalStatus);
    
  } catch (error) {
    console.error('\n❌ 部署后迁移失败:', error);
    
    // 尝试修复
    console.log('\n🔧 尝试使用 db push 修复...');
    try {
      await execAsync('npx prisma db push --accept-data-loss=false');
      await execAsync('npx prisma generate');
      console.log('✅ 通过 db push 修复成功');
    } catch (pushError) {
      console.error('❌ 修复失败:', pushError);
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  postDeploy().catch(error => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { postDeploy }; 