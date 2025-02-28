/*
  Warnings:

  - You are about to drop the `Roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserOrganization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRoleMapping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserOrganization" DROP CONSTRAINT "UserOrganization_uid_fkey";

-- DropForeignKey
ALTER TABLE "UserRoleMapping" DROP CONSTRAINT "UserRoleMapping_uid_fkey";

-- DropForeignKey
ALTER TABLE "userlogin" DROP CONSTRAINT "userlogin_uid_fkey";

-- DropTable
DROP TABLE "Roles";

-- DropTable
DROP TABLE "UserOrganization";

-- DropTable
DROP TABLE "UserRoleMapping";

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "users" (
    "uid" BIGSERIAL NOT NULL,
    "fullname" VARCHAR(250),
    "emailid" VARCHAR(250),
    "mobno" VARCHAR(100),
    "canlogin" BOOLEAN,
    "password" VARCHAR(100),
    "usercode" VARCHAR(150),
    "image" TEXT,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdby" BIGINT,
    "createddate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedby" BIGINT,
    "modifieddate" TIMESTAMP(3),
    "deletedby" BIGINT,
    "deleteddate" TIMESTAMP(3),
    "accountstatus" BIGINT,
    "isapproved" BOOLEAN,
    "approvedby" BIGINT,
    "approveddate" TIMESTAMP(3),
    "marketsegement" BIGINT,
    "languageid" BIGINT,
    "currencyid" BIGINT,
    "isadmin" BOOLEAN,
    "firstname" VARCHAR(45),
    "lastname" VARCHAR(45),
    "employee_id" VARCHAR(255),
    "profilestatus" BIGINT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "userrolemapping" (
    "urmid" BIGSERIAL NOT NULL,
    "uid" BIGINT,
    "uoid" BIGINT,
    "roleid" BIGINT,
    "roletypeid" BIGINT,
    "employeeid" VARCHAR(45),
    "self" INTEGER,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdby" BIGINT,
    "createddate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedby" BIGINT,
    "modifieddate" TIMESTAMP(3),
    "deletedby" BIGINT,
    "deleteddate" TIMESTAMP(3),

    CONSTRAINT "userrolemapping_pkey" PRIMARY KEY ("urmid")
);

-- CreateTable
CREATE TABLE "userorganization" (
    "uoid" BIGSERIAL NOT NULL,
    "orgname" VARCHAR(255),
    "orgemail" VARCHAR(100),
    "orgmobile" VARCHAR(50),
    "uid" BIGINT,
    "iscomposite" BOOLEAN,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdby" BIGINT,
    "createddate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedby" BIGINT,
    "modifieddate" TIMESTAMP(3),
    "deletedby" BIGINT,
    "deleteddate" TIMESTAMP(3),
    "orglegalname" VARCHAR(255),
    "orgindustry" INTEGER,
    "orgincstatus" INTEGER,
    "orgfystartdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentorgid" BIGINT,

    CONSTRAINT "userorganization_pkey" PRIMARY KEY ("uoid")
);

-- CreateTable
CREATE TABLE "roles" (
    "roleid" BIGSERIAL NOT NULL,
    "type" INTEGER,
    "isdeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdby" BIGINT,
    "createddate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedby" BIGINT,
    "modifieddate" TIMESTAMP(3),
    "deletedby" BIGINT,
    "deleteddate" TIMESTAMP(3),
    "rolename" VARCHAR(200),
    "roledesc" TEXT,
    "parentrole" BIGINT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("roleid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_emailid_key" ON "users"("emailid");

-- AddForeignKey
ALTER TABLE "userrolemapping" ADD CONSTRAINT "userrolemapping_uid_fkey" FOREIGN KEY ("uid") REFERENCES "users"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userorganization" ADD CONSTRAINT "userorganization_uid_fkey" FOREIGN KEY ("uid") REFERENCES "users"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userlogin" ADD CONSTRAINT "userlogin_uid_fkey" FOREIGN KEY ("uid") REFERENCES "users"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
