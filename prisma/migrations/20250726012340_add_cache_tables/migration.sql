-- CreateTable
CREATE TABLE "user_homework" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stageId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "description" TEXT,
    "teamCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "homework_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "homeworkId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "homework_images_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "user_homework" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "game_data_cache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataSource" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "cache_update_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskType" TEXT NOT NULL,
    "dataSource" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "errorMessage" TEXT,
    "updatedFiles" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "game_data_cache_dataSource_fileName_key" ON "game_data_cache"("dataSource", "fileName");
