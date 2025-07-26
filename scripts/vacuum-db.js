const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function vacuumDatabase() {
  console.log('\n🧹 开始数据库清理和优化...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // 检查清理前的状态
    console.log('📊 清理前状态:');
    
    const beforeCount = await prisma.gameDataCache.count();
    console.log(`  记录数: ${beforeCount}`);
    
    const dbPath = './prisma/dev.db';
    let beforeSize = 0;
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      beforeSize = stats.size / 1024 / 1024;
      console.log(`  文件大小: ${beforeSize.toFixed(2)} MB`);
    }
    
    // 执行VACUUM操作
    console.log('\n🔧 执行 VACUUM 操作...');
    await prisma.$executeRaw`VACUUM`;
    console.log('✅ VACUUM 完成');
    
    // 检查清理后的状态
    console.log('\n📊 清理后状态:');
    
    const afterCount = await prisma.gameDataCache.count();
    console.log(`  记录数: ${afterCount}`);
    
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      const afterSize = stats.size / 1024 / 1024;
      console.log(`  文件大小: ${afterSize.toFixed(2)} MB`);
      
      const savedSize = beforeSize - afterSize;
      const savedPercent = beforeSize > 0 ? (savedSize / beforeSize * 100) : 0;
      
      if (savedSize > 0) {
        console.log(`\n💾 节省空间: ${savedSize.toFixed(2)} MB (${savedPercent.toFixed(1)}%)`);
      } else {
        console.log('\n💾 文件大小无变化');
      }
    }
    
  } catch (error) {
    console.error('❌ 数据库清理失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

vacuumDatabase(); 