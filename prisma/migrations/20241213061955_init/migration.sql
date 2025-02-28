-- CreateTable
CREATE TABLE "Users" (
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

    CONSTRAINT "Users_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "UserRoleMapping" (
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

    CONSTRAINT "UserRoleMapping_pkey" PRIMARY KEY ("urmid")
);

-- CreateTable
CREATE TABLE "UserOrganization" (
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

    CONSTRAINT "UserOrganization_pkey" PRIMARY KEY ("uoid")
);

-- CreateTable
CREATE TABLE "UserLogin" (
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

    CONSTRAINT "UserLogin_pkey" PRIMARY KEY ("ulid")
);

-- CreateTable
CREATE TABLE "Roles" (
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

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("roleid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_emailid_key" ON "Users"("emailid");

-- AddForeignKey
ALTER TABLE "UserRoleMapping" ADD CONSTRAINT "UserRoleMapping_uid_fkey" FOREIGN KEY ("uid") REFERENCES "Users"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_uid_fkey" FOREIGN KEY ("uid") REFERENCES "Users"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLogin" ADD CONSTRAINT "UserLogin_uid_fkey" FOREIGN KEY ("uid") REFERENCES "Users"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
