USE QLNhaHang
GO

-- RESET AUTO_INCREAMENT
IF exists (SELECT * FROM AREA)				DBCC CHECKIDENT (AREA,				RESEED, 0)
IF exists (SELECT * FROM CART)				DBCC CHECKIDENT (CART,				RESEED, 0)
IF exists (SELECT * FROM CUSTOMER)			DBCC CHECKIDENT (CUSTOMER,			RESEED, 0)
IF exists (SELECT * FROM DISH)				DBCC CHECKIDENT (DISH,				RESEED, 0)
IF exists (SELECT * FROM DISHCATEGORY)		DBCC CHECKIDENT (DISHCATEGORY,		RESEED, 0)
IF exists (SELECT * FROM IMPORTTICKET)		DBCC CHECKIDENT (IMPORTTICKET,		RESEED, 0)
IF exists (SELECT * FROM INVENTORYITEM)		DBCC CHECKIDENT (INVENTORYITEM,		RESEED, 0)
IF exists (SELECT * FROM INVENTORYITEMTYPE)	DBCC CHECKIDENT (INVENTORYITEMTYPE,	RESEED, 0)
IF exists (SELECT * FROM [ORDER])			DBCC CHECKIDENT ([ORDER],			RESEED, 0)
IF exists (SELECT * FROM ORDERSTATUS)		DBCC CHECKIDENT (ORDERSTATUS,		RESEED, 0)
IF exists (SELECT * FROM PAYMENT)			DBCC CHECKIDENT (PAYMENT,			RESEED, 0)
IF exists (SELECT * FROM PAYROLL)			DBCC CHECKIDENT (PAYROLL,			RESEED, 0)
IF exists (SELECT * FROM RESERVATION)		DBCC CHECKIDENT (RESERVATION,		RESEED, 0)
IF exists (SELECT * FROM RESERVATIONSTATUS) DBCC CHECKIDENT (RESERVATIONSTATUS, RESEED, 0)
IF exists (SELECT * FROM STAFF)				DBCC CHECKIDENT (STAFF,				RESEED, 0)
IF exists (SELECT * FROM STAFFTYPE)			DBCC CHECKIDENT (STAFFTYPE,			RESEED, 0) 
IF exists (SELECT * FROM [TABLE])			DBCC CHECKIDENT ([TABLE],			RESEED, 0) 
IF exists (SELECT * FROM TABLETYPE)			DBCC CHECKIDENT (TABLETYPE,			RESEED, 0) 
IF exists (SELECT * FROM WORKDAY)			DBCC CHECKIDENT (WORKDAY,			RESEED, 0) 
IF exists (SELECT * FROM WORKSHIFT)			DBCC CHECKIDENT (WORKSHIFT,			RESEED, 0) 

-- DELETE DATA FROM TABLES
DELETE FROM AREA				
DELETE FROM RESERVATIONORDER				
DELETE FROM CARTDETAIL				
DELETE FROM DISHINGREDIENT				
DELETE FROM IMPORTTICKETDETAIL				
DELETE FROM PAYROLLDETAIL				
DELETE FROM WEEKLYSHIFT				
DELETE FROM CART			
DELETE FROM CUSTOMER		
DELETE FROM DISH		
DELETE FROM DISHCATEGORY				
DELETE FROM IMPORTTICKET				
DELETE FROM INVENTORYITEM		
DELETE FROM INVENTORYITEMTYPE		
DELETE FROM [ORDER]	
DELETE FROM ORDERSTATUS		
DELETE FROM PAYMENT		
DELETE FROM PAYROLL
DELETE FROM RESERVATION		
DELETE FROM RESERVATIONSTATUS 
DELETE FROM STAFF			
DELETE FROM STAFFTYPE			
DELETE FROM [TABLE]		
DELETE FROM TABLETYPE	
DELETE FROM WORKDAY		
DELETE FROM WORKSHIFT		

INSERT INTO CUSTOMER (NAME, PASSWORD_HASH, PHONE, EMAIL, BIRTHDAY, PHOTO, ADDRESS, ID_PAYMENT) VALUES						--1
(N'Nguyễn Văn An',	'abc123hashed', '0901234567', NULL, '1990-01-15', NULL, N'123 Lê Lợi, Q1', NULL),						--2
(N'Lê Thị Bình',	'bcd234hashed', NULL, 'le.b@example.com', '1992-03-10', NULL, N'45 Trần Hưng Đạo, Q5', NULL),			--3
(N'Trần Văn Chung', 'cde345hashed', '0939876543', NULL, '1985-12-20', NULL, N'78 Nguyễn Huệ, Q3', NULL),					--4
(N'Phạm Thị Dung',	'def456hashed', NULL, 'pham.d@example.com', NULL, NULL, N'56 Pasteur, Q10', NULL),						--5
(N'Hồ Văn Toàn',	'efg567hashed', '0912345678', 'ho.e@example.com', '1998-07-04', NULL, N'22 Lý Tự Trọng, Q1', NULL),		--6
(N'Đặng Thị Nhi',	'fgh678hashed', NULL, 'dang.f@example.com', '1993-08-25', NULL, N'99 Hai Bà Trưng, Q3', NULL),			--7
(N'Võ Văn Giang',	'ghi789hashed', '0987654321', NULL, '1991-11-11', NULL, N'10 Điện Biên Phủ, Q1', NULL),					--8
(N'Thái Thị Hồng',	'hij890hashed', NULL, 'thai.h@example.com', NULL, NULL, N'88 Nguyễn Trãi, Q5', NULL),					--9
(N'Phan Văn Ánh',	'ijk901hashed', '0909090909', NULL, '1995-05-05', NULL, N'37 Phạm Ngũ Lão, Q1', NULL),					--10
(N'Lý Thị Kiều',	'jkl012hashed', NULL, 'ly.k@example.com', '1999-09-09', NULL, N'12 Trường Chinh, Tân Bình', NULL),		--11
(N'Ngô Văn Linh',	'klm123hashed', '0977123456', NULL, '1994-06-20', NULL, N'33 Lạc Long Quân, Tân Phú', NULL),			--12
(N'Tăng Thị Minh',	'lmn234hashed', NULL, 'tang.m@example.com', '1988-02-14', NULL, N'21 Cách Mạng Tháng 8, Q10', NULL),	--13
(N'Bùi Văn Nam',	'mno345hashed', '0933222111', NULL, NULL, NULL, N'60 An Dương Vương, Q5', NULL),						--14
(N'Đoàn Thị Hồng',	'nop456hashed', NULL, 'doan.o@example.com', '1997-10-10', NULL, N'73 Hồng Bàng, Q6', NULL),				--15
(N'La Văn Phượng',	'opq567hashed', '0911222333', NULL, '2000-01-01', NULL, N'85 Nguyễn Thị Minh Khai, Q3', NULL)			--16

INSERT INTO INVENTORYITEMTYPE VALUES
(N'Nguyên liệu'),
(N'Dụng cụ')

INSERT INTO INVENTORYITEM (NAME, UNIT, AMOUNT, ID_INVENTORYITEMTYPE) VALUES 
(N'Thịt gà', N'gram', 5000, 1),			--1
(N'Thịt bò', N'gram', 5000, 1),			--2
(N'Cá hồi', N'gram', 3000, 1),			--3
(N'Cơm trắng', N'gram', 10000, 1),		--4
(N'Trứng', N'quả', 200, 1),				--5
(N'Rau cải', N'gram', 3000, 1),			--6
(N'Cà chua', N'gram', 2000, 1),			--7
(N'Hành lá', N'gram', 1500, 1),			--8
(N'Tỏi', N'gram', 1000, 1),				--9
(N'Miến', N'gram', 2000, 1),			--10
(N'Rau xà lách', N'gram', 2000, 1),		--11
(N'Khoai tây', N'gram', 3000, 1),		--12
(N'Dĩa lớn', N'cái', 100, 2),			--13
(N'Dĩa nhỏ', N'cái', 200, 2),			--14
(N'Bát', N'cái', 200, 2),				--15
(N'Tô nhỏ', N'cái', 150, 2),			--16
(N'Tô lớn', N'cái', 80, 2),				--17
(N'Đũa', N'đôi', 300, 2),				--18
(N'Muỗng', N'cái', 200, 2),				--19
(N'Khăn lạnh', N'cái', 400, 2)			--20


INSERT INTO DISHCATEGORY VALUES
(N'Khai vị'),
(N'Món chính'),
(N'Món phụ'),
(N'Tráng miệng'),
(N'Đồ uống')

INSERT INTO DISH (NAME, PRICE, DISCOUNT, ISSOLDOUT, PHOTO, DESCRIPTION, ID_DISHCATEGORY)
VALUES 
(N'Cơm gà',			65000,		10, 0, NULL, N'Cơm trắng ăn kèm thịt gà luộc', 2),			--1
(N'Cơm bò lúc lắc', 130000,		NULL, 0, NULL, N'Cơm với bò lúc lắc sốt tiêu', 2),			--2
(N'Miến gà',		80000,		5, 0, NULL, N'Miến gà thơm ngon', 2),					--3
(N'Cơm cá hồi áp chảo', 75000,	NULL, 0, NULL, N'Cá hồi tươi áp chảo cùng cơm', 2),			--4
(N'Trứng chiên',	50000,		NULL, 0, NULL, N'Trứng gà chiên giòn', 3),					--5
(N'Rau luộc',		35000,		NULL, 0, NULL, N'Rau cải, cà rốt luộc chấm mắm', 3),		--6
(N'Cơm trứng cà chua', 30000,	5, 0, NULL, N'Trứng chiên, sốt cà chua, cơm', 2),		--7
(N'Bò xào rau cải',	60000,		NULL, 0, NULL, N'Thịt bò xào với rau cải', 2),				--8
(N'Miến xào thập cẩm', 70000,	10, 0, NULL, N'Miến xào với trứng, thịt và rau', 2),		--9
(N'Salad rau trộn', 65000,		NULL, 0, NULL, N'Xà lách, cà chua, nước sốt', 1),			--10
(N'Súp gà',         120000,		NULL, 0, NULL, N'Súp gà nóng hổi', 1),						--11
(N'Khoai tây chiên',35000,		5, 0, NULL, N'Khoai tây chiên giòn', 1)					--12
																								
 INSERT INTO DISHINGREDIENT VALUES
-- Cơm gà (DISH.ID = 1)
(1, 1, 200), -- Thịt gà
(1, 4, 150), -- Cơm trắng
-- Cơm bò lúc lắc (DISH.ID = 2)
(2, 2, 200), -- Thịt bò
(2, 4, 150), -- Cơm trắng
(2, 7, 50),  -- Cà chua
-- Miến gà (3)
(3, 1, 150),
(3, 10, 100),
-- Cá hồi áp chảo (4)
(4, 3, 200),
(4, 4, 150),
-- Trứng chiên (5)
(5, 5, 2),
-- Rau luộc (6)
(6, 6, 100),
(6, 7, 50),
-- Cơm trứng cà chua (7)
(7, 4, 150),
(7, 5, 1),
(7, 7, 50),
-- Bò xào rau cải (8)
(8, 2, 150),
(8, 6, 100),
-- Miến xào thập cẩm (9)
(9, 10, 100),
(9, 5, 1),
(9, 1, 50),
(9, 6, 50),
 -- Salad rau trộn (10)
(10, 11, 100),   -- Rau xà lách
(10, 7,  30),    -- Cà chua 
-- Súp gà (11)
(11, 1, 100),    -- Thịt gà
(11, 6,  20),    -- Rau cải
-- Khoai tây chiên (12)
(12, 12, 150)	-- Khoai tây

INSERT INTO TABLETYPE VALUES 
('Bàn thường'),
('Bàn VIP'),
('Bàn VIP tròn'),
('Bàn ngoài trời')

INSERT INTO AREA VALUES 
('Tầng trệt'),
('Lầu 1'),
('Ngoài trời lầu 1')
('Phòng VIP 1'),
('Phòng VIP 2'),

INSERT INTO [TABLE] (TABLENUMBER, SEATS, ID_TABLETYPE, ID_AREA) VALUES 
(1, 4, 1, 1),
(2, 2, 1, 1),
(3, 6, 2, 2),  -- Bàn VIP ở Lầu 1
(4, 4, 3, 3),  -- Bàn ngoài trời ở Lầu 1
(5, 8, 2, 2);  -- Bàn VIP lớn ở Lầu 1
