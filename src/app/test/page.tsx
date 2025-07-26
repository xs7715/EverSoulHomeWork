'use client';

import { useState, useEffect } from 'react';
import { getCacheStats, clearCache, getStageList, getStageDetails } from '@/utils/dataUtils';

export default function TestPage() {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCacheStats = () => {
    const stats = getCacheStats();
    setCacheStats(stats);
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCachePerformance = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addTestResult('🚀 开始缓存性能测试...');
      
      // 首次加载 Live 数据
      addTestResult('📥 首次加载 Live 数据源...');
      const start1 = performance.now();
      await getStageList('live');
      const end1 = performance.now();
      addTestResult(`⏱️ Live 数据源首次加载耗时: ${(end1 - start1).toFixed(2)}ms`);
      
      // 再次加载 Live 数据（应该命中缓存）
      addTestResult('🔄 再次加载 Live 数据源 (应该使用缓存)...');
      const start2 = performance.now();
      await getStageList('live');
      const end2 = performance.now();
      addTestResult(`⚡ Live 数据源缓存加载耗时: ${(end2 - start2).toFixed(2)}ms`);
      
      // 加载关卡详情
      addTestResult('📄 测试关卡详情加载...');
      const start3 = performance.now();
      await getStageDetails('live', 1, 1);
      const end3 = performance.now();
      addTestResult(`⏱️ 关卡详情加载耗时: ${(end3 - start3).toFixed(2)}ms`);
      
      // 再次加载同一关卡详情
      addTestResult('🔄 再次加载关卡详情 (应该使用缓存)...');
      const start4 = performance.now();
      await getStageDetails('live', 1, 1);
      const end4 = performance.now();
      addTestResult(`⚡ 关卡详情缓存加载耗时: ${(end4 - start4).toFixed(2)}ms`);
      
      addTestResult('✅ 缓存性能测试完成!');
      
      // 计算性能提升
      const speedup1 = ((end1 - start1) / (end2 - start2)).toFixed(1);
      const speedup2 = ((end3 - start3) / (end4 - start4)).toFixed(1);
      addTestResult(`📊 列表数据缓存性能提升: ${speedup1}x`);
      addTestResult(`📊 详情数据缓存性能提升: ${speedup2}x`);
      
    } catch (error) {
      addTestResult(`❌ 测试失败: ${error}`);
    } finally {
      setLoading(false);
      refreshCacheStats();
    }
  };

  const handleClearCache = () => {
    clearCache();
    addTestResult('🗑️ 缓存已清空');
    refreshCacheStats();
  };

  useEffect(() => {
    refreshCacheStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">数据缓存监控</h1>
        
        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">控制面板</h2>
          <div className="flex space-x-4">
            <button
              onClick={refreshCacheStats}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              刷新缓存状态
            </button>
            <button
              onClick={testCachePerformance}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '测试中...' : '缓存性能测试'}
            </button>
            <button
              onClick={handleClearCache}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              清空缓存
            </button>
          </div>
        </div>

        {/* 缓存统计 */}
        {cacheStats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">缓存统计</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">{cacheStats.totalEntries}</div>
                <div className="text-sm text-gray-600">缓存条目</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-2xl font-bold text-green-600">{cacheStats.cacheHits}</div>
                <div className="text-sm text-gray-600">缓存命中</div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-2xl font-bold text-red-600">{cacheStats.cacheMisses}</div>
                <div className="text-sm text-gray-600">缓存未命中</div>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <div className="text-2xl font-bold text-purple-600">{cacheStats.totalMemoryUsage}</div>
                <div className="text-sm text-gray-600">内存使用</div>
              </div>
            </div>
            
            {/* 缓存条目详情 */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">缓存键</th>
                    <th className="px-4 py-2 text-left">数据源</th>
                    <th className="px-4 py-2 text-left">文件名</th>
                    <th className="px-4 py-2 text-left">数据量</th>
                    <th className="px-4 py-2 text-left">内存占用</th>
                  </tr>
                </thead>
                <tbody>
                  {cacheStats.entries.map((entry: any, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 font-mono text-sm">{entry.key}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.dataSource === 'live' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {entry.dataSource}
                        </span>
                      </td>
                      <td className="px-4 py-2">{entry.fileName}</td>
                      <td className="px-4 py-2">{entry.itemCount.toLocaleString()}</td>
                      <td className="px-4 py-2">{entry.memorySize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 