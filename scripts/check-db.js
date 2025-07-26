const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('\n🔍 检查数据库缓存状态...\n');
    
    // 获取总记录数
    const totalCount = await prisma.gameDataCache.count();
    console.log(`📊 总缓存记录数: ${totalCount}`);
    
    // 获取有效记录数
    const validCount = await prisma.gameDataCache.count({
      where: { isValid: true }
    });
    console.log(`✅ 有效记录数: ${validCount}`);
    
    // 获取无效记录数
    const invalidCount = await prisma.gameDataCache.count({
      where: { isValid: false }
    });
    console.log(`❌ 无效记录数: ${invalidCount}`);
    
    // 按数据源分组统计
    const statsBySource = await prisma.gameDataCache.groupBy({
      by: ['dataSource'],
      _count: { id: true },
      where: { isValid: true }
    });
    
    console.log('\n📈 按数据源统计（仅有效记录）:');
    statsBySource.forEach(stat => {
      console.log(`  ${stat.dataSource}: ${stat._count.id} 个文件`);
    });
    
    // 检查数据库文件大小
    try {
      const dbPath = './prisma/dev.db';
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`\n💾 数据库文件大小: ${sizeInMB} MB`);
      } else {
        console.log('\n💾 数据库文件不存在');
      }
    } catch (error) {
      console.log('\n💾 无法获取数据库文件大小');
    }
    
  } catch (error) {
    console.error('❌ 检查数据库失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 