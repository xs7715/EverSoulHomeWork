# EverSoul 攻略分享站

这是一个基于 Next.js + TypeScript 构建的 EverSoul 游戏攻略分享网站，支持查看关卡详情、分享攻略截图等功能。

## 功能特性

### 已实现功能

- ✅ **关卡详情查看**：显示主线关卡的详细信息

  - 关卡基本信息（类型、经验值）
  - 固定掉落物品
  - 敌方队伍配置（英雄、等级、阵型、战力）
  - 掉落物品概率统计
  - 通关礼包信息

## 快速开始

### 构建

```bash
npm nstall
npm run build
npx prisma generate
npx prisma db push
npm run start
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！
