#!/usr/bin/env node

/**
 * 初始化缓存脚本
 * 用于首次启动时填充数据库缓存
 */

async function initializeCache() {
  console.log('🚀 开始初始化缓存...');
  
  try {
    // 调用缓存更新API
    const response = await fetch('http://localhost:3000/api/cache/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataSource: 'all',
        isManual: false
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 缓存初始化成功！');
      console.log(`📊 更新了 ${result.updatedFiles} 个文件`);
    } else {
      console.error('❌ 缓存初始化失败:', result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 缓存初始化失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeCache();
}

module.exports = { initializeCache }; 