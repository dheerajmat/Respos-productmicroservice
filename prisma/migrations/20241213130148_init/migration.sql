/*
  Warnings:

  - You are about to drop the `UserLogin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserLogin" DROP CONSTRAINT "UserLogin_uid_fkey";

-- DropTable
DROP TABLE "UserLogin";

-- CreateTable
CREATE TABLE "userlogin" (
    "ulid" BIGSERIAL NOT NULL,
    "uid" BIGINT,
    "uoid" BIGINT,
    "username" VARCHAR(250),
    "password" VARCHAR(100),
    "logintime" TIMESTAMP(3),
    "logouttime" TIMESTAMP(3),
    "lastloginorg" BOOLEAN NOT NULL DEFAULT false,
    "isdeleted" BOOLEAN,
    "createdby" BIGINT,
    "createddate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedby" BIGINT,
    "modifieddate" TIMESTAMP(3),
    "deletedby" BIGINT,
    "deleteddate" TIMESTAMP(3),
    "roleid" BIGINT,
    "rightid" BIGINT,
    "roleid_orgid" BIGINT,
    "fullname" TEXT,
    "employee_id" TEXT,
    "profilestatus" BIGINT,
    "accountstatus" BIGINT,

    CONSTRAINT "userlogin_pkey" PRIMARY KEY ("ulid")
);

-- AddForeignKey
ALTER TABLE "userlogin" ADD CONSTRAINT "userlogin_uid_fkey" FOREIGN KEY ("uid") REFERENCES "Users"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
