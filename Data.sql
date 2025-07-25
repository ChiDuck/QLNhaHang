﻿USE QLNhaHang
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
IF exists (SELECT * FROM SHIPORDER)			DBCC CHECKIDENT (SHIPORDER,			RESEED, 0)
IF exists (SELECT * FROM ORDERSTATUS)		DBCC CHECKIDENT (ORDERSTATUS,		RESEED, 0)
IF exists (SELECT * FROM PAYMENT)			DBCC CHECKIDENT (PAYMENT,			RESEED, 0)
IF exists (SELECT * FROM PAYROLL)			DBCC CHECKIDENT (PAYROLL,			RESEED, 0)
IF exists (SELECT * FROM RESERVATION)		DBCC CHECKIDENT (RESERVATION,		RESEED, 0)
IF exists (SELECT * FROM RESERVATIONSTATUS) DBCC CHECKIDENT (RESERVATIONSTATUS, RESEED, 0)
IF exists (SELECT * FROM STAFF)				DBCC CHECKIDENT (STAFF,				RESEED, 0)
IF exists (SELECT * FROM STAFFTYPE)			DBCC CHECKIDENT (STAFFTYPE,			RESEED, 0) 
IF exists (SELECT * FROM DINETABLE)			DBCC CHECKIDENT (DINETABLE,			RESEED, 0) 
IF exists (SELECT * FROM TABLETYPE)			DBCC CHECKIDENT (TABLETYPE,			RESEED, 0) 
IF exists (SELECT * FROM WORKDAY)			DBCC CHECKIDENT (WORKDAY,			RESEED, 0) 
IF exists (SELECT * FROM WORKSHIFT)			DBCC CHECKIDENT (WORKSHIFT,			RESEED, 0) 

-- DELETE DATA FROM TABLES
DELETE FROM RESERVATIONORDER				
DELETE FROM CARTDETAIL				
DELETE FROM ORDERITEM				
DELETE FROM DISHINGREDIENT				
DELETE FROM IMPORTTICKETDETAIL				
DELETE FROM PAYROLLDETAIL				
DELETE FROM WEEKLYSHIFT	
DELETE FROM SHIPORDER	
DELETE FROM CART
DELETE FROM RESERVATION
DELETE FROM CUSTOMER		
DELETE FROM DISH		
DELETE FROM DISHCATEGORY				
DELETE FROM IMPORTTICKET				
DELETE FROM INVENTORYITEM		
DELETE FROM INVENTORYITEMTYPE		
DELETE FROM ORDERSTATUS		
DELETE FROM PAYMENT		
DELETE FROM PAYROLL		
DELETE FROM RESERVATIONSTATUS 
DELETE FROM STAFF			
DELETE FROM STAFFTYPE			
DELETE FROM DINETABLE		
DELETE FROM TABLETYPE	
DELETE FROM AREA				
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
(N'La Văn Phượng',	'$2a$11$RaiCpE6N5i/z2a.GtOqRNOocBVx/RKLlDyIS4Wxf7OGy3XMyTBLOW', '123', NULL, '2000-01-01', NULL, N'85 Nguyễn Thị Minh Khai, Q3', NULL)			--16

INSERT INTO INVENTORYITEMTYPE VALUES
(N'Nguyên liệu'),
(N'Dụng cụ')

--INSERT INTO INVENTORYITEM (NAME, UNIT, AMOUNT, ID_INVENTORYITEMTYPE) VALUES 
--(N'Thịt gà', N'gram', 5000, 1),			--1
--(N'Thịt bò', N'gram', 5000, 1),			--2
--(N'Cá hồi', N'gram', 3000, 1),			--3
--(N'Cơm trắng', N'gram', 10000, 1),		--4
--(N'Trứng', N'quả', 200, 1),				--5
--(N'Rau cải', N'gram', 3000, 1),			--6
--(N'Cà chua', N'gram', 2000, 1),			--7
--(N'Hành lá', N'gram', 1500, 1),			--8
--(N'Tỏi', N'gram', 1000, 1),				--9
--(N'Miến', N'gram', 2000, 1),				--10
--(N'Rau xà lách', N'gram', 2000, 1),		--11
--(N'Khoai tây', N'gram', 3000, 1),			--12
INSERT INTO Inventoryitem (Name, Unit, Amount, ID_INVENTORYITEMTYPE)
VALUES
(N'Tôm tươi', N'gram', 10000, 1),				--1
(N'Trứng gà', N'quả', 500, 1),					--2
(N'Thịt bò', N'gram', 8000, 1),				--3
(N'Rau xà lách', N'gram', 3000, 1),			--4
(N'Khoai tây', N'gram', 5000, 1),				--5
(N'Bơ', N'gram', 2000, 1),						--6
(N'Phô mai', N'gram', 1500, 1),				--7
(N'Sữa tươi', N'ml', 3000, 1),					--8
(N'Chanh', N'quả', 200, 1),					--9
(N'Mì Ý', N'gram', 4000, 1),					--10
(N'Cà chua', N'gram', 2000, 1),				--11
(N'Dưa hấu', N'gram', 2500, 1),				--12
(N'Nho', N'gram', 2000, 1),					--13
(N'Cà phê', N'gram', 1500, 1),					--14
(N'Trà xanh', N'gram', 1000, 1),				--15
(N'Sốt mayonnaise', N'ml', 1000, 1),			--16
(N'Thịt gà', N'gram', 6000, 1),				--17
(N'Nước khoáng', N'ml', 5000, 1),				--18
(N'Sô-cô-la', N'gram', 1000, 1),				--19
(N'Mật ong', N'ml', 800, 1),					--20
(N'Dĩa lớn', N'cái', 100, 2),			
(N'Dĩa nhỏ', N'cái', 200, 2),			
(N'Bát', N'cái', 200, 2),				
(N'Tô nhỏ', N'cái', 150, 2),			
(N'Tô lớn', N'cái', 80, 2),				
(N'Đũa', N'đôi', 300, 2),				
(N'Muỗng', N'cái', 200, 2),				
(N'Khăn lạnh', N'cái', 400, 2)			

INSERT INTO DISHCATEGORY VALUES
(N'Khai vị'),
(N'Món chính'),
(N'Món phụ'),
(N'Tráng miệng'),
(N'Đồ uống')

INSERT INTO Dish (Name, Price, Issoldout, ID_DISHCATEGORY, Description, PHOTO)
VALUES
-- Khai vị (1)
(N'Salad tôm bơ', 150000, 0, 1, N'Khai vị với tôm và bơ tươi.', '/photo/dish/photo_00b5d7f790a34c0caa5f47a4892f9771.jpg'),
(N'Súp trứng gà', 120000, 0, 1, N'Súp nhẹ với trứng và rau.', '/photo/dish/sup-trung-ga-voi-nam-huong-845x564_95735bbb05af48e28893856a46af2b69.jpg'),
(N'Súp gà ngô non', 125000, 0, 1, N'Súp nóng với thịt gà.', '/photo/dish/Thanh-pham-3-3-8670-1650018610_7af547f5cb934cc09d4c52d225980271.jpg'),

-- Món chính (2)
(N'Bò nướng phô mai', 320000, 0, 2, N'Món chính đậm đà với bò và phô mai.', '/photo/dish/so-che-va-tam-uop-thit-bo_9db9_0508e752e8e8493ea0354ea2d52f8279.webp'),
(N'Mỳ Ý sốt bò', 280000, 0, 2, N'Mì Ý kết hợp sốt cà chua và thịt bò.', '/photo/dish/cach-lam-mi-y-sot-thit-bo-bam-ngon-chuan-vi-Y-1_c9623d5fb2a04bbb95578b8f5c5a0079.jpg'),
(N'Gà quay mật ong', 300000, 0, 2, N'Thịt gà quay sốt mật ong đặc biệt.', '/photo/dish/ga-nuong-mat-ong_f310304ea9e24a4980736339f0ddf019.webp'),
(N'Bít tết bò', 350000, 0, 2, N'Món chính cao cấp.', '/photo/dish/bo-bit-tet-va-khoai-tay-chien (2)-1_ac1e67ba43c44468822803ee3676c5ac.png'),

-- Món phụ (3)
(N'Khoai tây nghiền', 80000, 0, 3, N'Món phụ mềm mịn.', '/photo/dish/khoaitay-1633657549-9352-1633657656_9314fb6b443c469ab98e8e5fcb657d46.jpg'),
(N'Rau xào bơ tỏi', 100000, 0, 3, N'Món rau nhẹ nhàng.', '/photo/dish/1632277823-416-thumbnail-width640height480_86301bd89b834eea99e281edbb4f7d93.jpg'),
(N'Rau củ hấp', 90000, 0, 3, N'Món phụ dinh dưỡng.', '/photo/dish/unnamed_3d18a04ce9dd44dabe464741a21278fe.png'),

-- Tráng miệng (4)
(N'Bánh panna cotta', 110000, 0, 4, N'Món tráng miệng kiểu Ý.', '/photo/dish/coffee-panna-cotta-1-scaled_53771ab9a4b24a729afcd54bdebbf3a2.jpg'),
(N'Kem sô-cô-la', 90000, 0, 4, N'Kem lạnh vị sô-cô-la đậm đà.' , null),
(N'Bánh flan', 95000, 0, 4, N'Flan mềm mịn, ngọt dịu.', '/photo/dish/banh-flan-socola-2_71a4b9be8ddc459c9be9a7226ae74476_525c8617f006450bb7a5e27f7117f16b.jpg'),
(N'Bánh tart trái cây', 120000, 0, 4, N'Tráng miệng nhiều loại trái cây.', '/photo/dish/1a-1200x676-2_be273c6b12a04ddca5a781e444f98335.jpg'),

-- Đồ uống (5)
(N'Sinh tố bơ', 60000, 0, 5, N'Bơ xay tươi ngon.', '/photo/dish/sinh-to-bo_d649106efd3c463981f024a144d2e933.jpg'),
(N'Nước ép dưa hấu', 55000, 0, 5, N'Mát lạnh giải khát.', null),
(N'Nước ép nho', 58000, 0, 5, N'Dinh dưỡng, tươi ngon.', null),
(N'Cà phê đen', 45000, 0, 5, N'Cà phê nguyên chất.', '/photo/dish/Ca-Phe-Den-scaled_6b4fd13ee36d44fab439083f20411c80.jpg'),
(N'Trà xanh mật ong', 50000, 0, 5, N'Trà dịu nhẹ kết hợp mật ong.', '/photo/dish/shutterstock-134444405-8182-1644678448_ea9b71c3d40c4b13b757103326978ccb.jpg'),
(N'Sữa tươi đánh bọt', 50000, 0, 5, N'Đơn giản nhưng ngon.', null);

-- Salad tôm bơ
INSERT INTO Dishingredient VALUES (1, 1, 150), (1, 4, 50), (1, 6, 30);

-- Súp trứng gà
INSERT INTO Dishingredient VALUES (2, 2, 2), (2, 4, 30);

-- Bò nướng phô mai
INSERT INTO Dishingredient VALUES (3, 3, 200), (3, 7, 50);

-- Mỳ Ý sốt bò
INSERT INTO Dishingredient VALUES (4, 10, 100), (4, 3, 100), (4, 11, 50);

-- Gà quay mật ong
INSERT INTO Dishingredient VALUES (5, 17, 200), (5, 20, 20);

-- Khoai tây nghiền
INSERT INTO Dishingredient VALUES (6, 5, 150), (6, 6, 20);

-- Rau xào bơ tỏi
INSERT INTO Dishingredient VALUES (7, 4, 100), (7, 6, 10);

-- Panna cotta
INSERT INTO Dishingredient VALUES (8, 8, 100), (8, 7, 20);

-- Kem sô-cô-la
INSERT INTO Dishingredient VALUES (9, 8, 50), (9, 19, 30);

-- Bánh flan
INSERT INTO Dishingredient VALUES (10, 2, 2), (10, 8, 50);

-- Sinh tố bơ
INSERT INTO Dishingredient VALUES (11, 6, 100), (11, 8, 50);

-- Nước ép dưa hấu
INSERT INTO Dishingredient VALUES (12, 12, 150);

-- Nước ép nho
INSERT INTO Dishingredient VALUES (13, 13, 150);

-- Cà phê đen
INSERT INTO Dishingredient VALUES (14, 14, 15);

-- Trà xanh mật ong
INSERT INTO Dishingredient VALUES (15, 15, 10), (15, 20, 10);

-- Súp gà ngô non
INSERT INTO Dishingredient VALUES (16, 17, 100), (16, 2, 1);

-- Bít tết bò
INSERT INTO Dishingredient VALUES (17, 3, 250);

-- Rau củ hấp
INSERT INTO Dishingredient VALUES (18, 4, 50), (18, 5, 50), (18, 11, 20);

-- Bánh tart trái cây
INSERT INTO Dishingredient VALUES (19, 12, 30), (19, 13, 30), (19, 8, 20);

-- Sữa tươi đánh bọt
INSERT INTO Dishingredient VALUES (20, 8, 100);

--INSERT INTO DISH (NAME, PRICE, DISCOUNT, ISSOLDOUT, PHOTO, DESCRIPTION, ID_DISHCATEGORY)
--VALUES 
--(N'Cơm gà',			65000,		10, 0, NULL, N'Cơm trắng ăn kèm thịt gà luộc', 2),			--1
--(N'Cơm bò lúc lắc', 130000,		NULL, 0, NULL, N'Cơm với bò lúc lắc sốt tiêu', 2),			--2
--(N'Miến gà',		80000,		5, 0, NULL, N'Miến gà thơm ngon', 2),						--3
--(N'Cơm cá hồi áp chảo', 75000,	NULL, 0, NULL, N'Cá hồi tươi áp chảo cùng cơm', 2),			--4
--(N'Trứng chiên',	50000,		NULL, 0, NULL, N'Trứng gà chiên giòn', 3),					--5
--(N'Rau luộc',		35000,		NULL, 0, NULL, N'Rau cải, cà rốt luộc chấm mắm', 3),		--6
--(N'Cơm trứng cà chua', 30000,	5, 0, NULL, N'Trứng chiên, sốt cà chua, cơm', 2),			--7
--(N'Bò xào rau cải',	60000,		NULL, 0, NULL, N'Thịt bò xào với rau cải', 2),				--8
--(N'Miến xào thập cẩm', 70000,	10, 0, NULL, N'Miến xào với trứng, thịt và rau', 2),		--9
--(N'Salad rau trộn', 65000,		NULL, 0, NULL, N'Xà lách, cà chua, nước sốt', 1),			--10
--(N'Súp gà',         120000,		NULL, 0, NULL, N'Súp gà nóng hổi', 1),						--11
--(N'Khoai tây chiên',35000,		5, 0, NULL, N'Khoai tây chiên giòn', 1)						--12
																								
-- INSERT INTO DISHINGREDIENT VALUES
---- Cơm gà (DISH.ID = 1)
--(1, 1, 200), -- Thịt gà
--(1, 4, 150), -- Cơm trắng
---- Cơm bò lúc lắc (DISH.ID = 2)
--(2, 2, 200), -- Thịt bò
--(2, 4, 150), -- Cơm trắng
--(2, 7, 50),  -- Cà chua
---- Miến gà (3)
--(3, 1, 150),
--(3, 10, 100),
---- Cá hồi áp chảo (4)
--(4, 3, 200),
--(4, 4, 150),
---- Trứng chiên (5)
--(5, 5, 2),
---- Rau luộc (6)
--(6, 6, 100),
--(6, 7, 50),
---- Cơm trứng cà chua (7)
--(7, 4, 150),
--(7, 5, 1),
--(7, 7, 50),
---- Bò xào rau cải (8)
--(8, 2, 150),
--(8, 6, 100),
---- Miến xào thập cẩm (9)
--(9, 10, 100),
--(9, 5, 1),
--(9, 1, 50),
--(9, 6, 50),
-- -- Salad rau trộn (10)
--(10, 11, 100),   -- Rau xà lách
--(10, 7,  30),    -- Cà chua 
---- Súp gà (11)
--(11, 1, 100),    -- Thịt gà
--(11, 6,  20),    -- Rau cải
---- Khoai tây chiên (12)
--(12, 12, 150)	-- Khoai tây

INSERT INTO TABLETYPE (NAME, SEATS) VALUES 
(N'Bàn vuông', 4),
(N'Bàn vuông lớn', 8),
(N'Bàn dài', 14),
(N'Bàn tròn', 6),
(N'Bàn tròn lớn', 12),
(N'Bàn vuông ghế sofa', 4)

INSERT INTO AREA VALUES 
(N'Tầng trệt'),
(N'Lầu 1'),
(N'Ngoài trời lầu 1'),
(N'Phòng VIP 1'),
(N'Phòng VIP 2')

INSERT INTO DINETABLE (NAME, ID_TABLETYPE, ID_AREA) VALUES 
(N'Bàn trệt 1', 1, 1),			--1
(N'Bàn trệt 2', 1, 1),			--2
(N'Bàn trệt 3', 1, 1),			--3
(N'Bàn trệt 4', 1, 1),			--4
(N'Bàn trệt 5', 1, 1),			--5
(N'Bàn trệt 6', 2, 1),			--6
(N'Bàn trệt 7', 2, 1),			--7
(N'Bàn trệt 8', 3, 1),			--8
(N'Bàn lầu 1_1', 1, 2),			--9
(N'Bàn lầu 1_2', 1, 2),			--10
(N'Bàn lầu 1_3', 1, 2),			--11
(N'Bàn lầu 1_4', 4, 2),			--12
(N'Bàn lầu 1_5', 4, 2),			--13
(N'Bàn lầu 1_6', 5, 2),			--14
(N'Bàn lầu 1_7', 6, 2),			--15
(N'Bàn lầu 1_8', 6, 2),			--16
(N'Bàn trời lầu 1_1', 2, 3),	--17
(N'Bàn trời lầu 1_2', 2, 3),	--18
(N'Bàn phòng VIP 1', 3, 4),		--19
(N'Bàn phòng VIP 2', 5, 5)		--20

INSERT INTO STAFFTYPE VALUES 
(N'Quản lý'),
(N'Nhân viên bếp'),
(N'Bếp trưởng'),
(N'Kế toán'),
(N'Nhân viên phục vụ'),
(N'Nhân viên an ninh'),
(N'Nhân viên trực kho'),
(N'Lễ tân'),
(N'Nhân viên giao hàng')

-- Chèn dữ liệu nhân viên
INSERT INTO STAFF (NAME, PASSWORD_HASH, CITIZENID, PHONE, EMAIL, GENDER, BIRTHDAY, ADDRESS, STARTDATE, HOURLYSALARY, ISACTIVE, ID_STAFFTYPE) VALUES
-- Quản lý (1 người)
(N'Lê Thị Thanh Hương', '$2a$11$tuxya.c8cSpTtlkqyWz8xOSEst6lDm4HRlHZ5z02074eduE4pIsSO', '036198000123', '0912345678', 'breadwithginger@gmail.com', 0, '1985-11-15', N'12 Nguyễn Huệ, Q.1, TP.HCM', '2018-06-10', 50000, 1, 1),
-- Nhân viên phục vụ (10 người)
(N'Nguyễn Văn Minh',	'e10adc3949ba59abbe56e057f20f883e', '036198001234', '0912345679', 'nguyenminh.nv@email.com', 1, '1995-03-22', N'45 Lê Lợi, Q.1, TP.HCM', '2021-01-15', 30000, 1, 5),
(N'Trần Thị Ngọc Ánh',	'e10adc3949ba59abbe56e057f20f883e', '036198002345', '0912345680', 'trananh.nv@email.com', 0,	'1996-07-18', N'78 Trần Hưng Đạo, Q.5, TP.HCM', '2021-02-20', 30000, 1, 5),
(N'Phạm Hoàng Long',	'e10adc3949ba59abbe56e057f20f883e', '036198003456', '0912345681', 'phamlong.nv@email.com', 1,	'1997-05-30', N'23 Nguyễn Trãi, Q.5, TP.HCM', '2021-03-10', 30000, 1, 5),
(N'Vũ Thị Mai Linh',	'e10adc3949ba59abbe56e057f20f883e', '036198004567', '0912345682', 'vulinh.nv@email.com', 0,		'1994-09-12', N'56 Cách Mạng Tháng 8, Q.3, TP.HCM', '2020-11-05', 32000, 1, 5),
(N'Đặng Văn Tú',		'e10adc3949ba59abbe56e057f20f883e', '036198005678', '0912345683', 'dangtu.nv@email.com', 1,		'1993-12-05', N'89 Lý Thường Kiệt, Q.10, TP.HCM', '2020-09-15', 32000, 1, 5),
(N'Bùi Thị Thu Hà',		'e10adc3949ba59abbe56e057f20f883e', '036198006789', '0912345684', 'buiha.nv@email.com', 0,		'1998-02-28', N'34 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', '2022-01-10', 28000, 1, 5),
(N'Hoàng Văn Đức',		'e10adc3949ba59abbe56e057f20f883e', '036198007890', '0912345685', 'hoangduc.nv@email.com', 1,	'1992-08-15', N'67 Nguyễn Thị Minh Khai, Q.3, TP.HCM', '2019-07-22', 35000, 1, 5),
(N'Lý Thị Kim Ngân',	'e10adc3949ba59abbe56e057f20f883e', '036198008901', '0912345686', 'lyngan.nv@email.com', 0,		'1999-04-03', N'12 Lê Duẩn, Q.1, TP.HCM', '2022-03-05', 28000, 1, 5),
(N'Mai Văn Hải',		'e10adc3949ba59abbe56e057f20f883e', '036198009012', '0912345687', 'maihai.nv@email.com', 1,		'1991-10-20', N'45 Võ Văn Tần, Q.3, TP.HCM', '2019-05-18', 35000, 1, 5),
(N'Đỗ Thị Phương Thảo', 'e10adc3949ba59abbe56e057f20f883e', '036198010123', '0912345688', 'dothao.nv@email.com', 0,		'1996-01-25', N'78 Nguyễn Đình Chiểu, Q.3, TP.HCM', '2021-04-12', 30000, 1, 5),
-- Bếp trưởng (1 người)
(N'Trần Văn Đại',		'e10adc3949ba59abbe56e057f20f883e', '036198011234', '0912345689', 'tran.dai@email.com', 1,		'1982-06-08', N'23 Trương Định, Q.3, TP.HCM', '2017-08-15', 80000, 1, 3),
-- Nhân viên bếp (2 người)
(N'Nguyễn Thị Hồng Nhung', 'e10adc3949ba59abbe56e057f20f883e', '036198012345', '0912345690', 'nguyennhung.bep@email.com', 0, '1990-07-19', N'56 Nguyễn Văn Trỗi, Q.Phú Nhuận, TP.HCM', '2019-09-10', 45000, 1, 2),
(N'Phan Văn Thắng',		'e10adc3949ba59abbe56e057f20f883e', '036198013456', '0912345691', 'phan.thang@email.com', 1,	'1988-11-30', N'89 Hoàng Văn Thụ, Q.Tân Bình, TP.HCM', '2018-11-05', 48000, 1, 2),
-- Kế toán (1 người)
(N'Lê Thị Bích Ngọc',	'e10adc3949ba59abbe56e057f20f883e', '036198014567', '0912345692', 'le.ngoc@email.com', 0,		'1987-03-22', N'34 Lê Quý Đôn, Q.3, TP.HCM', '2017-05-20', 60000, 1, 4),
-- Nhân viên an ninh (2 người)
(N'Võ Văn Sơn',			'e10adc3949ba59abbe56e057f20f883e', '036198015678', '0912345693', 'vo.son@email.com', 1,		'1983-09-14', N'12 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM', '2016-12-01', 35000, 1, 6),
(N'Đinh Thị Hồng Nga',	'e10adc3949ba59abbe56e057f20f883e', '036198016789', '0912345694', 'dinh.nga@email.com', 0,		'1984-12-05', N'45 Phan Đăng Lưu, Q.Bình Thạnh, TP.HCM', '2017-02-15', 35000, 1, 6),
-- Nhân viên trực kho (2 người)
(N'Trương Văn Tài',		'e10adc3949ba59abbe56e057f20f883e', '036198017890', '0912345695', 'truong.tai@email.com', 1,	'1986-04-18', N'78 Nguyễn Hữu Cảnh, Q.Bình Thạnh, TP.HCM', '2018-03-10', 40000, 1, 7),
(N'Ngô Thị Thu Hiền',	'e10adc3949ba59abbe56e057f20f883e', '036198018901', '0912345696', 'ngo.hien@email.com', 0,		'1989-08-22', N'23 Xô Viết Nghệ Tĩnh, Q.Bình Thạnh, TP.HCM', '2019-04-05', 38000, 1, 7),
-- Lễ tân (1 người)
(N'Hoàng Thị Ngọc Hân', 'e10adc3949ba59abbe56e057f20f883e', '036198019012', '0912345697', 'hoang.han@email.com', 0,		'1995-02-28', N'56 Nguyễn Văn Cừ, Q.1, TP.HCM', '2020-07-15', 45000, 1, 8);

INSERT INTO RESERVATIONSTATUS VALUES 
(N'Chờ xác nhận'),
(N'Đã chấp nhận'),
(N'Đã từ chối'),
(N'Đã hoàn thành'),
(N'Đã hủy')

INSERT INTO RESERVATION (BOOKDATE, PHONE, EMAIL, RESERVATIONDATE, RESERVATIONTIME, PARTYSIZE, RESERVATIONPRICE,
NOTE, TRANSACTIONID, ID_RESERVATIONSTATUS, ID_CUSTOMER, ID_DINETABLE) VALUES 
('2025-04-20', '0987654321', NULL,					'2025-04-24', '20:00', 2, 0, NULL, NULL, 4, 8, 1),
('2025-05-12', '0923999445', 'hoang.k@example.com',	'2025-05-18', '11:30', 4, 0, NULL, NULL, 4, NULL, 1),
('2025-05-12', '0987654321', NULL,					'2025-05-28', '19:00', 2, 0, NULL, NULL, 4, 8, 4),
('2025-06-01', NULL, 'ly.k@example.com',			'2025-06-03', '16:30', 2, 0, NULL, NULL, 4, 11, 12),
('2025-06-03', '0336664321', NULL,					'2025-06-06', '22:00', 2, 0, NULL, NULL, 3, NULL, 1),
('2025-06-13', NULL, 'ly.k@example.com',			'2025-06-15', '17:30', 10, 0, N'Có thể trễ 10p', NULL, 2, 11, 8)

INSERT INTO ORDERSTATUS VALUES
(N'Chờ xác nhận'),
(N'Từ chối'),
(N'Đang thực hiện'),
(N'Đang giao'),
(N'Đã hoàn thành')

INSERT INTO WORKDAY VALUES 
(2),(3),(4),(5),(6),(7),(8)

INSERT INTO WORKSHIFT VALUES 
(1, '9:00', '13:00', 4),	-- 9 - 13
(2, '13:00', '18:00', 5),	-- 13 - 18
(3, '18:00', '22:00', 4)  -- 18 - 22

select * from CUSTOMER
select * from cart
select * from cartdetail where ID_CART = 1
select * from staff
select * from WORKDAY
select * from WORKSHIFT
select * from weeklySHIFT
select * from INVENTORYITEM
select * from SHIPORDER
select * from ORDERITEM 
select * from RESERVATION
select * from RESERVATION re where re.ID_CUSTOMER = 17
select * from RESERVATIONORDER r Where r.ID_RESERVATION = 10
SELECT * FROM Weeklyshift
WHERE ID_WORKDAY = 2 AND ID_WORKSHIFT = 2
SELECT * FROM payrolldetail
SELECT * FROM payroll