USE master 
GO
ALTER DATABASE QLNhaHang set single_user with rollback immediate -- DISCONNECT FROM ALL SOURCE
DROP DATABASE IF exists QLNhaHang
GO 
CREATE DATABASE QLNhaHang
GO
USE QLNhaHang
GO
ALTER AUTHORIZATION ON DATABASE::QLNhaHang TO sa;
GO


/*==============================================================*/
/* Table: CUSTOMER                                              */
/*==============================================================*/
CREATE TABLE CUSTOMER 
(
	ID_CUSTOMER			INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(30)	NOT NULL,
	PASSWORD_HASH		VARCHAR(150)	NOT NULL,
	PHONE				VARCHAR(15)		NULL,
	EMAIL				VARCHAR(35)		NULL,
	BIRTHDAY			DATE			NULL,
	PHOTO				VARCHAR(MAX)	NULL,
	ADDRESS				NVARCHAR(100)	NULL,
	CONSTRAINT CHK_PHONE_EMAIL_CUSTOMER CHECK (PHONE IS NOT NULL OR EMAIL IS NOT NULL),
	PRIMARY KEY(ID_CUSTOMER)
);

/*==============================================================*/
/* Table: AREA													*/
/*==============================================================*/
CREATE TABLE AREA 
(
	ID_AREA				INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(35)	NOT NULL,
	PRIMARY KEY(ID_AREA)
);

/*==============================================================*/
/* Table: TABLETYPE												*/
/*==============================================================*/
CREATE TABLE TABLETYPE 
(
	ID_TABLETYPE		INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(35)	NOT NULL,
	SEATS				INT				NOT NULL,
	PRIMARY KEY(ID_TABLETYPE)
);

/*==============================================================*/
/* Table: TABLE													*/
/*==============================================================*/
CREATE TABLE DINETABLE
(
	ID_DINETABLE		INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(50)	NOT NULL UNIQUE,
	ID_TABLETYPE		INT				NULL FOREIGN KEY(ID_TABLETYPE) REFERENCES TABLETYPE(ID_TABLETYPE),
	ID_AREA				INT				NULL FOREIGN KEY(ID_AREA) REFERENCES AREA(ID_AREA),
	PRIMARY KEY(ID_DINETABLE)
);


/*==============================================================*/
/* Table: STAFFTYPE												*/
/*==============================================================*/
CREATE TABLE STAFFTYPE
(
	ID_STAFFTYPE		INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(35)	NOT NULL,
	PRIMARY KEY(ID_STAFFTYPE)
);

/*==============================================================*/
/* Table: STAFF													*/
/*==============================================================*/
CREATE TABLE STAFF 
(
	ID_STAFF			INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(35)	NOT NULL,
	PASSWORD_HASH		VARCHAR(150)	NOT NULL,
	CITIZENID			CHAR(12)		NOT NULL UNIQUE,
	PHONE				CHAR(13)		NOT NULL,
	EMAIL				VARCHAR(35)		NOT NULL,
	GENDER				BIT				NULL,
	BIRTHDAY			DATE			NOT NULL,
	PHOTO				VARCHAR(MAX)	NULL,
	ADDRESS				NVARCHAR(100)	NOT NULL,
	STARTDATE			DATE			NULL,			-- date started working
	HOURLYSALARY		FLOAT			NULL,			-- salary per hour
	ISACTIVE			BIT				NOT NULL,		-- is still working?
	ID_STAFFTYPE		INT				NULL FOREIGN KEY(ID_STAFFTYPE) REFERENCES STAFFTYPE(ID_STAFFTYPE),
	PRIMARY KEY(ID_STAFF)
);


/*==============================================================*/
/* Table: RESERVATIONSTATUS										*/
/*==============================================================*/
CREATE TABLE RESERVATIONSTATUS 
(
	ID_RESERVATIONSTATUS INT			IDENTITY(1,1) NOT NULL,
	NAME				 NVARCHAR(35)	NOT NULL,
	PRIMARY KEY(ID_RESERVATIONSTATUS)
);

/*==============================================================*/
/* Table: RESERVATION	                                        */
/*==============================================================*/
CREATE TABLE RESERVATION 
(
	ID_RESERVATION		INT				IDENTITY(1,1) NOT NULL,
	BOOKDATE			DATETIME		NOT NULL,
	PHONE				CHAR(13)		NULL,
	EMAIL				VARCHAR(35)		NULL,
	RESERVATIONDATE		DATE			NOT NULL,
	RESERVATIONTIME		TIME			NOT NULL,
	PARTYSIZE			TINYINT			NOT NULL,
	RESERVATIONPRICE	FLOAT			NULL,
	NOTE				NVARCHAR(150)	NULL,
	TRANSACTIONID		VARCHAR(100)	NULL,
	ID_RESERVATIONSTATUS INT			NULL FOREIGN KEY(ID_RESERVATIONSTATUS) REFERENCES RESERVATIONSTATUS(ID_RESERVATIONSTATUS),
	ID_CUSTOMER			INT				NULL FOREIGN KEY(ID_CUSTOMER) REFERENCES CUSTOMER(ID_CUSTOMER),
	ID_DINETABLE		INT				NULL FOREIGN KEY(ID_DINETABLE) REFERENCES DINETABLE(ID_DINETABLE),
	ID_STAFF			INT				NULL FOREIGN KEY(ID_STAFF) REFERENCES STAFF(ID_STAFF),
	CONSTRAINT CHK_PHONE_EMAIL_RESERVATION CHECK (PHONE IS NOT NULL OR EMAIL IS NOT NULL),
	PRIMARY KEY(ID_RESERVATION)
);

/*==============================================================*/
/* Table: DISHCATEGORY											*/
/*==============================================================*/
CREATE TABLE DISHCATEGORY
(
	ID_DISHCATEGORY		INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(50)	NOT NULL,
	PRIMARY KEY(ID_DISHCATEGORY)
);

/*==============================================================*/
/* Table: DISH													*/
/*==============================================================*/
CREATE TABLE DISH
(
	ID_DISH				INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(50)	NOT NULL,
	PRICE				FLOAT			NOT NULL,
	DISCOUNT			FLOAT			NULL,
	ISSOLDOUT			BIT				NOT NULL DEFAULT 0,
	PHOTO				VARCHAR(MAX)	NULL,
	DESCRIPTION			NVARCHAR(200)	NULL,
	ID_DISHCATEGORY		INT				NULL FOREIGN KEY(ID_DISHCATEGORY) REFERENCES DISHCATEGORY(ID_DISHCATEGORY),
	PRIMARY KEY(ID_DISH)
);

/*==============================================================*/
/* Table: INVENTORYITEMTYPE										*/
/*==============================================================*/
CREATE TABLE INVENTORYITEMTYPE 
(
	ID_INVENTORYITEMTYPE INT			IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(35)	NOT NULL,
	PRIMARY KEY(ID_INVENTORYITEMTYPE)
);

/*==============================================================*/
/* Table: INVENTORYITEM											*/
/*==============================================================*/
CREATE TABLE INVENTORYITEM 
(
	ID_INVENTORYITEM	INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(35)	NOT NULL,
	UNIT				NVARCHAR(20)	NOT NULL,
	AMOUNT				FLOAT			NOT NULL,
	ID_INVENTORYITEMTYPE INT			NULL FOREIGN KEY(ID_INVENTORYITEMTYPE) REFERENCES INVENTORYITEMTYPE(ID_INVENTORYITEMTYPE),
	PRIMARY KEY(ID_INVENTORYITEM)
);

/*==============================================================*/
/* Table: DISHINGREDIENT										*/
/*==============================================================*/
CREATE TABLE DISHINGREDIENT
(
	ID_DISH				INT				FOREIGN KEY(ID_DISH) REFERENCES DISH(ID_DISH),
	ID_INVENTORYITEM	INT				FOREIGN KEY(ID_INVENTORYITEM) REFERENCES INVENTORYITEM(ID_INVENTORYITEM),
	AMOUNT				FLOAT			NOT NULL,
	PRIMARY KEY(ID_INVENTORYITEM, ID_DISH)
);

/*==============================================================*/
/* Table: RESERVATIONORDER										*/
/*==============================================================*/
CREATE TABLE RESERVATIONORDER
(
	ID_RESERVATION		INT				FOREIGN KEY(ID_RESERVATION) REFERENCES RESERVATION(ID_RESERVATION),
	ID_DISH				INT				FOREIGN KEY(ID_DISH) REFERENCES DISH(ID_DISH),
	QUANTITY			INT				NOT NULL,
	TOTAL				FLOAT			NOT NULL,
	PRIMARY KEY(ID_RESERVATION, ID_DISH)
);

/*==============================================================*/
/* Table: ORDERSTATUS											*/
/*==============================================================*/
CREATE TABLE ORDERSTATUS 
(
	ID_ORDERSTATUS		INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(35)	NOT NULL,
	PRIMARY KEY(ID_ORDERSTATUS)
);

/*==============================================================*/
/* Table: CART													*/
/*==============================================================*/
CREATE TABLE CART 
(
	ID_CART				INT				IDENTITY(1,1) NOT NULL,
	TOTALPRICE			FLOAT			NOT NULL DEFAULT 0,
	ID_CUSTOMER			INT				NOT NULL UNIQUE FOREIGN KEY(ID_CUSTOMER) REFERENCES CUSTOMER(ID_CUSTOMER),
	PRIMARY KEY(ID_CART)
);

/*==============================================================*/
/* Table: CARTDETAIL											*/
/*==============================================================*/
CREATE TABLE CARTDETAIL 
(
	ID_CART				INT				FOREIGN KEY(ID_CART) REFERENCES CART(ID_CART),
	ID_DISH				INT				FOREIGN KEY(ID_DISH) REFERENCES DISH(ID_DISH),
	QUANTITY			INT				NOT NULL,
	SUBTOTAL			FLOAT			NOT NULL,
	PRIMARY KEY(ID_CART, ID_DISH)
);

/*==============================================================*/
/* Table: ORDER													*/
/*==============================================================*/
CREATE TABLE SHIPORDER
(
	ID_SHIPORDER		INT				IDENTITY(1,1) NOT NULL,
	ORDERDATE			DATETIME		NOT NULL,
	CUSTOMERNAME		NVARCHAR(30)	NOT NULL,
	PHONE				CHAR(13)		NULL,
	EMAIL				VARCHAR(35)		NULL,
	ISSHIPPING			BIT				NOT NULL,
	SHIPADDRESS			NVARCHAR(100)	NULL,
	SHIPFEE				FLOAT			NULL,
	ORDERPRICE			FLOAT			NOT NULL,
	NOTE				NVARCHAR(150)	NULL,
	TRANSACTIONID		VARCHAR(100)	NULL,
	ID_ORDERSTATUS		INT				NULL FOREIGN KEY(ID_ORDERSTATUS) REFERENCES ORDERSTATUS(ID_ORDERSTATUS),
	ID_CART				INT				NULL FOREIGN KEY(ID_CART) REFERENCES CART(ID_CART),
	ID_STAFF			INT				NULL FOREIGN KEY(ID_STAFF) REFERENCES STAFF(ID_STAFF),
	CONSTRAINT CHK_PHONE_EMAIL_ORDER CHECK (PHONE IS NOT NULL OR EMAIL IS NOT NULL),
	PRIMARY KEY(ID_SHIPORDER)
);

/*==============================================================*/
/* Table: ORDERITEM												*/
/*==============================================================*/
CREATE TABLE ORDERITEM 
(
	ID_SHIPORDER		INT				FOREIGN KEY(ID_SHIPORDER) REFERENCES SHIPORDER(ID_SHIPORDER),
	ID_DISH				INT				FOREIGN KEY(ID_DISH) REFERENCES DISH(ID_DISH),
	QUANTITY			INT				NOT NULL,
	SUBTOTAL			FLOAT			NOT NULL,
	PRIMARY KEY(ID_SHIPORDER, ID_DISH)
);

/*==============================================================*/
/* Table: WORKDAY												*/
/*==============================================================*/
CREATE TABLE WORKDAY 
(
	ID_WORKDAY			TINYINT			IDENTITY(1,1) NOT NULL,
	WEEKDAY				TINYINT			NOT NULL,
	PRIMARY KEY(ID_WORKDAY)
);

/*==============================================================*/
/* Table: WORKSHIFT												*/
/*==============================================================*/  
CREATE TABLE WORKSHIFT 
(
	ID_WORKSHIFT		TINYINT			IDENTITY(1,1) NOT NULL,
	SHIFT				TINYINT			NOT NULL,
	SHIFTSTART			TIME			NOT NULL,
	SHIFTEND			TIME			NOT NULL,
	SHIFTHOUR			FLOAT			NOT NULL,
	PRIMARY KEY(ID_WORKSHIFT)
);

/*==============================================================*/
/* Table: WEEKLYSHIFT											*/
/*==============================================================*/
CREATE TABLE WEEKLYSHIFT
(
	ID_STAFF			INT				FOREIGN KEY(ID_STAFF) REFERENCES STAFF(ID_STAFF),
	ID_WORKDAY			TINYINT			FOREIGN KEY(ID_WORKDAY) REFERENCES WORKDAY(ID_WORKDAY),
	ID_WORKSHIFT		TINYINT			FOREIGN KEY(ID_WORKSHIFT) REFERENCES WORKSHIFT(ID_WORKSHIFT),
	PROCESSED			BIT				NOT NULL DEFAULT 0,			-- check state of attended to update absence time
	ATTENDED			BIT				NOT NULL DEFAULT 0,			-- is the staff attended the shift?
	ISLATE				BIT				NOT NULL DEFAULT 0		
	PRIMARY KEY(ID_WORKSHIFT, ID_WORKDAY, ID_STAFF)
);

/*==============================================================*/
/* Table: PAYROLL												*/
/*==============================================================*/  
CREATE TABLE PAYROLL 
(
	ID_PAYROLL			INT				IDENTITY(1,1) NOT NULL,
	MONTH				SMALLINT		NOT NULL,
	YEAR				SMALLINT		NOT NULL,
	PRIMARY KEY(ID_PAYROLL)
);

/*==============================================================*/
/* Table: PAYROLLDETAIL											*/
/*==============================================================*/  
CREATE TABLE PAYROLLDETAIL 
(
	ID_STAFF			INT				FOREIGN KEY(ID_STAFF) REFERENCES STAFF(ID_STAFF),
	ID_PAYROLL			INT				FOREIGN KEY(ID_PAYROLL) REFERENCES PAYROLL(ID_PAYROLL),
	DAYS				TINYINT			NOT NULL DEFAULT 0,
	HOURS				FLOAT			NOT NULL DEFAULT 0,
	ABSENCETIMES		TINYINT			NOT NULL DEFAULT 0,
	LATETIMES			TINYINT			NOT NULL DEFAULT 0,
	SUBTRACT			FLOAT			NOT NULL DEFAULT 0,		
	BONUS				FLOAT			NOT NULL DEFAULT 0,		
	TOTALSALARY			FLOAT			NOT NULL DEFAULT 0,
	NOTE				NVARCHAR(100)	NULL,
	PRIMARY KEY(ID_STAFF, ID_PAYROLL)
);