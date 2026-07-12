-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "joinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassroomMember" (
    "id" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'STUDENT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classroomId" TEXT NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "ClassroomMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassroomInvite" (
    "id" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'STUDENT',
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "classroomId" TEXT NOT NULL,
    "invitedUserId" UUID NOT NULL,
    "invitedById" UUID NOT NULL,

    CONSTRAINT "ClassroomInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_joinCode_key" ON "Classroom"("joinCode");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomMember_classroomId_userId_key" ON "ClassroomMember"("classroomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomInvite_classroomId_invitedUserId_status_key" ON "ClassroomInvite"("classroomId", "invitedUserId", "status");

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomMember" ADD CONSTRAINT "ClassroomMember_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomMember" ADD CONSTRAINT "ClassroomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomInvite" ADD CONSTRAINT "ClassroomInvite_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomInvite" ADD CONSTRAINT "ClassroomInvite_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomInvite" ADD CONSTRAINT "ClassroomInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
