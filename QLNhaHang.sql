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

--/*==============================================================*/
--/* Table: MANAGER                                               */
--/*==============================================================*/
--CREATE TABLE MANAGER 
--(
--	ID_MANAGER		INT				IDENTITY(1,1) NOT NULL,
--	NAME			VARCHAR(20)		NOT NULL,
--	PASSWORD_HASH	VARCHAR(50)		NOT NULL,
--	PHONE			VARCHAR(13)		NULL,
--	EMAIL			VARCHAR(35)		NOT NULL,
--	PRIMARY KEY(ID_MANAGER)
--);

--/*==============================================================*/
--/* Table: BRANCH	                                            */
--/*==============================================================*/
--CREATE TABLE BRANCH 
--(
--	ID_RESTAURANT	INT				NOT NULL FOREIGN KEY(ID_RESTAURANT) REFERENCES RESTAURANT(ID_RESTAURANT),
--	ID_LOCATION		INT				NOT NULL FOREIGN KEY(ID_LOCATION) REFERENCES LOCATION(ID_LOCATION),
--	ADDRESS			VARCHAR(50)		NOT NULL,
--	PRIMARY KEY(ID_RESTAURANT, ID_LOCATION)
--);

--/*==============================================================*/
--/* Table: LOCATION	                                            */
--/*==============================================================*/
--CREATE TABLE LOCATION 
--(
--	ID_LOCATION		INT				IDENTITY(1,1) NOT NULL,
--	NAME			VARCHAR(30)		NOT NULL,
--	POSTALCODE		INT				NOT NULL,
--	COUNTRY			VARCHAR(30)		NOT NULL,
--	PRIMARY KEY(ID_LOCATION)
--);

/*==============================================================*/
/* Table: CUSTOMER                                              */
/*==============================================================*/
CREATE TABLE CUSTOMER 
(
	ID_CUSTOMER			INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(30)	NOT NULL,
	PASSWORD_HASH		VARCHAR(50)		NOT NULL,
	PHONE				CHAR(13)		NULL,
	EMAIL				VARCHAR(35)		NULL,
	BIRTHDAY			DATE			NULL,
	PHOTO				VARCHAR(MAX)	NULL,
	ADDRESS				VARCHAR(100)	NULL,
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
	PRIMARY KEY(ID_TABLETYPE)
);

/*==============================================================*/
/* Table: TABLE													*/
/*==============================================================*/
CREATE TABLE [TABLE]
(
	ID_TABLE			INT				IDENTITY(1,1) NOT NULL,
	SEATS				INT				NOT NULL,
	ID_AREA				INT				NULL FOREIGN KEY(ID_AREA) REFERENCES AREA(ID_AREA),
	ID_TABLETYPE		INT				NULL FOREIGN KEY(ID_TABLETYPE) REFERENCES TABLETYPE(ID_TABLETYPE),
	PRIMARY KEY(ID_TABLE)
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
	PHONE				CHAR(13)		NULL,
	EMAIL				VARCHAR(35)		NULL,
	RESERVATIONDATE		DATE			NOT NULL,
	RESERVATIONTIME		TIME			NOT NULL,
	PARTYSIZE			TINYINT			NOT NULL,
	ID_RESERVATIONSTATUS INT			NULL FOREIGN KEY(ID_RESERVATIONSTATUS) REFERENCES RESERVATIONSTATUS(ID_RESERVATIONSTATUS),
	ID_CUSTOMER			INT				NULL FOREIGN KEY(ID_CUSTOMER) REFERENCES CUSTOMER(ID_CUSTOMER),
	ID_TABLE			INT				NULL FOREIGN KEY(ID_TABLE) REFERENCES [TABLE](ID_TABLE),
	CONSTRAINT CHK_PHONE_EMAIL_RESERVATION CHECK (PHONE IS NOT NULL OR EMAIL IS NOT NULL),
	PRIMARY KEY(ID_RESERVATION)
);

/*==============================================================*/
/* Table: DISH													*/
/*==============================================================*/
CREATE TABLE DISH
(
	ID_DISH				INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(50)	NOT NULL,
	PRICE				INT				NOT NULL,
	PHOTO				VARCHAR(MAX)	NULL,
	DESCRIPTION			NVARCHAR(200)	NULL,
	PRIMARY KEY(ID_DISH)
);

/*==============================================================*/
/* Table: RESERVATIONORDER										*/
/*==============================================================*/
CREATE TABLE RESERVATIONORDER
(
	ID_RESERVATION		INT				FOREIGN KEY(ID_RESERVATION) REFERENCES RESERVATION(ID_RESERVATION),
	ID_DISH				INT				FOREIGN KEY(ID_DISH) REFERENCES DISH(ID_DISH),
	QUANTITY			INT				NOT NULL,
	TOTAL				INT				NOT NULL,
	PRIMARY KEY(ID_RESERVATION, ID_DISH)
);

/*==============================================================*/
/* Table: RESERVATIONLIST										*/
/*==============================================================*/
CREATE TABLE RESERVATIONLIST
(
	ID_RESERVATIONLIST	INT				IDENTITY(1,1) NOT NULL,
	QUANTITY			INT				NOT NULL,
	TOTAL				INT				NOT NULL,
	PRIMARY KEY(ID_RESERVATIONLIST)
);

--/*==============================================================*/
--/* Table: RATING												*/
--/*==============================================================*/
--CREATE TABLE RATING 
--(
--	ID_RATING			INT				IDENTITY(1,1) NOT NULL,
--	STAR				INT				NOT NULL,
--	PRIMARY KEY(ID_RATING)
--);

--/*==============================================================*/
--/* Table: DISHRATING											*/
--/*==============================================================*/
--CREATE TABLE DISHRATING 
--(
--	ID_DISH				INT				FOREIGN KEY(ID_DISH) REFERENCES DISH(ID_DISH),
--	ID_RATING			INT				FOREIGN KEY(ID_RATING) REFERENCES RATING(ID_RATING),
--	COMMENT				NVARCHAR(200)	NULL,
--	PRIMARY KEY(ID_DISH, ID_RATING)
--);

/*==============================================================*/
/* Table: ORDERSTATUS											*/
/*==============================================================*/
CREATE TABLE ORDERSTATUS 
(
	ID_ORDERSTATUS			INT				IDENTITY(1,1) NOT NULL,
	NAME				NVARCHAR(35)	NOT NULL,
	PRIMARY KEY(ID_ORDERSTATUS)
);

/*==============================================================*/
/* Table: CART													*/
/*==============================================================*/
CREATE TABLE CART 
(
	ID_CART				INT				IDENTITY(1,1) NOT NULL,
	TOTALPRICE			INT				NOT NULL,
	ID_CUSTOMER			INT				NULL FOREIGN KEY(ID_CUSTOMER) REFERENCES CUSTOMER(ID_CUSTOMER),
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
	SUBTOTAL			INT				NOT NULL,
	PRIMARY KEY(ID_CART, ID_DISH)
);

/*==============================================================*/
/* Table: ORDER													*/
/*==============================================================*/
CREATE TABLE [ORDER]
(
	ID_ORDER			INT				IDENTITY(1,1) NOT NULL,
	ORDERDATE			DATETIME		NOT NULL,
	CUSTOMERNAME		NVARCHAR(30)	NOT NULL,
	PHONE				CHAR(13)		NULL,
	EMAIL				VARCHAR(35)		NULL,
	ISSHIPPING			BIT				NOT NULL,
	SHIPADDRESS			VARCHAR(100)	NULL,
	SHIPFEE				INT				NULL,
	ORDERPRICE			INT				NOT NULL,
	ID_ORDERSTATUS		INT				NULL FOREIGN KEY(ID_ORDERSTATUS) REFERENCES ORDERSTATUS(ID_ORDERSTATUS),
	ID_CART				INT				NOT NULL FOREIGN KEY(ID_CART) REFERENCES CART(ID_CART),
	CONSTRAINT CHK_PHONE_EMAIL_ORDER CHECK (PHONE IS NOT NULL OR EMAIL IS NOT NULL),
	PRIMARY KEY(ID_ORDER)
);

/*==============================================================*/
/* Table: PAYMENT												*/
/*==============================================================*/
CREATE TABLE PAYMENT 
(
	ID_PAYMENT			INT				IDENTITY(1,1) NOT NULL,
	CARDNUMBER			CHAR(15)		NOT NULL,
	EXPIRYDATE			DATE			NOT NULL,
	CVC					SMALLINT		NOT NULL,
	ID_CUSTOMER			INT				NULL FOREIGN KEY(ID_CUSTOMER) REFERENCES CUSTOMER(ID_CUSTOMER),
	ID_ORDER			INT				NOT NULL FOREIGN KEY(ID_ORDER) REFERENCES [ORDER](ID_ORDER),
	PRIMARY KEY(ID_PAYMENT)
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
	PRIMARY KEY(ID_INVENTORYITEM)
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
	PASSWORD_HASH		VARCHAR(50)		NOT NULL,
	PHONE				CHAR(13)		NOT NULL,
	EMAIL				VARCHAR(35)		NOT NULL,
	PHOTO				VARCHAR(MAX)	NULL,
	ADDRESS				VARCHAR(100)	NOT NULL,
	HOURLYSALARY		INT				NULL,
	MONTHWORKHOUR		SMALLINT		NULL,
	ID_STAFFTYPE		INT				NOT NULL FOREIGN KEY(ID_STAFFTYPE) REFERENCES STAFFTYPE(ID_STAFFTYPE),
	PRIMARY KEY(ID_STAFF)
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
	SHIFTHOUR			TINYINT			NOT NULL,
	PRIMARY KEY(ID_WORKSHIFT)
);

/*==============================================================*/
/* Table: WEEKLYSHIFT											*/
/*==============================================================*/
CREATE TABLE WEEKLYSHIFT
(
	ID_STAFF			INT				NOT NULL FOREIGN KEY(ID_STAFF) REFERENCES STAFF(ID_STAFF),
	ID_WORKDAY			TINYINT			NOT NULL FOREIGN KEY(ID_WORKDAY) REFERENCES WORKDAY(ID_WORKDAY),
	ID_WORKSHIFT		TINYINT			NOT NULL FOREIGN KEY(ID_WORKSHIFT) REFERENCES WORKSHIFT(ID_WORKSHIFT),
	ISASSIGNED			BIT				NOT NULL DEFAULT 0,
	ATTENDED			BIT				NULL,
	PRIMARY KEY(ID_WORKSHIFT, ID_WORKDAY, ID_STAFF)
);


