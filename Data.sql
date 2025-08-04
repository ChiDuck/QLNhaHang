USE QLNhaHang
GO

-- RESET AUTO_INCREAMENT
IF exists (SELECT * FROM AREA)				DBCC CHECKIDENT (AREA,				RESEED, 0)
IF exists (SELECT * FROM CART)				DBCC CHECKIDENT (CART,				RESEED, 0)
IF exists (SELECT * FROM CUSTOMER)			DBCC CHECKIDENT (CUSTOMER,			RESEED, 0)
IF exists (SELECT * FROM DISH)				DBCC CHECKIDENT (DISH,				RESEED, 0)
IF exists (SELECT * FROM DISHCATEGORY)		DBCC CHECKIDENT (DISHCATEGORY,		RESEED, 0)
IF exists (SELECT * FROM INVENTORYITEM)		DBCC CHECKIDENT (INVENTORYITEM,		RESEED, 0)
IF exists (SELECT * FROM INVENTORYITEMTYPE)	DBCC CHECKIDENT (INVENTORYITEMTYPE,	RESEED, 0)
IF exists (SELECT * FROM SHIPORDER)			DBCC CHECKIDENT (SHIPORDER,			RESEED, 0)
IF exists (SELECT * FROM ORDERSTATUS)		DBCC CHECKIDENT (ORDERSTATUS,		RESEED, 0)
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
DELETE FROM PAYROLLDETAIL				
DELETE FROM WEEKLYSHIFT	
DELETE FROM SHIPORDER	
DELETE FROM CART
DELETE FROM RESERVATION
DELETE FROM CUSTOMER		
DELETE FROM DISH		
DELETE FROM DISHCATEGORY				
DELETE FROM INVENTORYITEM		
DELETE FROM INVENTORYITEMTYPE		
DELETE FROM ORDERSTATUS		
DELETE FROM PAYROLL		
DELETE FROM RESERVATIONSTATUS 
DELETE FROM STAFF			
DELETE FROM STAFFTYPE			
DELETE FROM DINETABLE		
DELETE FROM TABLETYPE	
DELETE FROM AREA				
DELETE FROM WORKDAY		
DELETE FROM WORKSHIFT		

INSERT INTO CUSTOMER (NAME, PASSWORD_HASH, PHONE, EMAIL, BIRTHDAY, PHOTO, ADDRESS) VALUES	
(N'Nguyễn Chí Đức',	'$2a$11$RaiCpE6N5i/z2a.GtOqRNOocBVx/RKLlDyIS4Wxf7OGy3XMyTBLOW', '0123456789', 'nguyenchiduc003@gmail.com', '2000-01-01', NULL, N'85 Nguyễn Thị Minh Khai, Q3'),		--1
(N'Nguyễn Văn An',	'abc123hashed', '0901234567', 'an@example.com', '1990-01-15', NULL, N'123 Lê Lợi, Q1'),						--2
(N'Lê Thị Bình',	'bcd234hashed', '0943334567', 'le.b@example.com', '1992-03-10', NULL, N'45 Trần Hưng Đạo, Q5'),				--3
(N'Trần Văn Chung', 'cde345hashed', '0939876543', 'chung@example.com', '1985-12-20', NULL, N'78 Nguyễn Huệ, Q3'),				--4
(N'Phạm Thị Dung',	'def456hashed', '0902323331', 'pham.d@example.com', NULL, NULL, N'56 Pasteur, Q10'),						--5
(N'Hồ Văn Toàn',	'efg567hashed', '0912345678', 'ho.e@example.com', '1998-07-04', NULL, N'22 Lý Tự Trọng, Q1'),				--6
(N'Đặng Thị Nhi',	'fgh678hashed', '0901232485', 'dang.f@example.com', '1993-08-25', NULL, N'99 Hai Bà Trưng, Q3'),			--7
(N'Võ Văn Giang',	'ghi789hashed', '0987654321', 'giang@example.com', '1991-11-11', NULL, N'10 Điện Biên Phủ, Q1'),			--8
(N'Thái Thị Hồng',	'hij890hashed', '0958954347', 'thai.h@example.com', NULL, NULL, N'88 Nguyễn Trãi, Q5'),						--9
(N'Phan Văn Ánh',	'ijk901hashed', '0909090909', 'anh@example.com', '1995-05-05', NULL, N'37 Phạm Ngũ Lão, Q1'),				--10
(N'Lý Thị Kiều',	'jkl012hashed', '0944323567', 'ly.k@example.com', '1999-09-09', NULL, N'12 Trường Chinh, Tân Bình'),		--11
(N'Ngô Văn Linh',	'klm123hashed', '0977123456', 'linh@example.com', '1994-06-20', NULL, N'33 Lạc Long Quân, Tân Phú'),		--12
(N'Tăng Thị Minh',	'lmn234hashed', '0232323367', 'tang.m@example.com', '1988-02-14', NULL, N'21 Cách Mạng Tháng 8, Q10'),		--13
(N'Bùi Văn Nam',	'mno345hashed', '0933222111', 'nam@example.com', NULL, NULL, N'60 An Dương Vương, Q5'),						--14
(N'Đoàn Thị Hồng',	'nop456hashed', '0323123247', 'doan.o@example.com', '1997-10-10', NULL, N'73 Hồng Bàng, Q6')				--15

INSERT INTO INVENTORYITEMTYPE VALUES
(N'Nguyên liệu'),
(N'Dụng cụ')

INSERT INTO Inventoryitem (Name, Unit, Amount, ID_INVENTORYITEMTYPE)
VALUES
(N'Tôm tươi', N'gram', 10000, 1),				--1
(N'Trứng gà', N'quả', 500, 1),					--2
(N'Thịt bò', N'gram', 15000, 1),				--3
(N'Rau xà lách', N'gram', 3000, 1),				--4
(N'Khoai tây', N'gram', 5000, 1),				--5
(N'Bơ', N'gram', 2000, 1),						--6
(N'Phô mai', N'gram', 1500, 1),					--7
(N'Sữa tươi', N'ml', 3000, 1),					--8
(N'Chanh', N'quả', 200, 1),						--9
(N'Mì Ý', N'gram', 4000, 1),					--10
(N'Cà chua', N'gram', 2000, 1),					--11
(N'Dưa hấu', N'gram', 2500, 1),					--12
(N'Nho', N'gram', 2000, 1),						--13
(N'Cà phê', N'gram', 1500, 1),					--14
(N'Trà xanh', N'gram', 1000, 1),				--15
(N'Sốt mayonnaise', N'ml', 1000, 1),			--16
(N'Thịt gà', N'gram', 2000, 1),					--17
(N'Mực', N'gram', 8000, 1),						--18
(N'Sô-cô-la', N'gram', 1000, 1),				--19
(N'Mật ong', N'ml', 800, 1),					--20
(N'Cà rốt', N'gram', 6000, 1),					--21
(N'Thịt heo', N'gram', 20000, 1),				--22
(N'Gạo nếp', N'gram', 40000, 1),				--23
(N'Gạo tẻ', N'gram', 65000, 1),					--24
(N'Xoài', N'quả', 40, 1),						--25
(N'Bột mì', N'gram', 70000, 1),					--26
(N'Tôm hùm', N'gram', 8000, 1),					--27
(N'Thịt vịt', N'gram', 20000, 1),				--28
(N'Coca-cola', N'lon', 200, 1),					--29
(N'Sprite', N'lon', 200, 1),					--30
(N'Rượu táo mèo', N'chai', 15, 1),				--31
(N'Dĩa lớn', N'cái', 100, 2),					--32
(N'Dĩa nhỏ', N'cái', 200, 2),					--33
(N'Bát', N'cái', 200, 2),						--34
(N'Tô nhỏ', N'cái', 150, 2),					--35
(N'Tô lớn', N'cái', 80, 2),						--36
(N'Đũa', N'đôi', 300, 2),						--37
(N'Muỗng', N'cái', 200, 2),						--38
(N'Khăn lạnh', N'cái', 400, 2)					--39
												
INSERT INTO DISHCATEGORY VALUES
(N'Khai vị'),
(N'Món chính'),
(N'Món phụ'),
(N'Tráng miệng'),
(N'Đồ uống')

INSERT INTO Dish (Name, Price, Issoldout, ID_DISHCATEGORY, Description, PHOTO)
VALUES

(N'Salad tôm bơ', 150000, 0, 1, N'Khai vị với tôm và bơ tươi thanh nhẹ.', '/photo/dish/photo_00b5d7f790a34c0caa5f47a4892f9771.jpg'),											--1		
(N'Súp trứng gà', 120000, 0, 1, N'Súp nhẹ với trứng và rau.', '/photo/dish/sup-trung-ga-voi-nam-huong-845x564_95735bbb05af48e28893856a46af2b69.jpg'),							--2
(N'Súp gà ngô non', 125000, 0, 1, N'Súp nóng với thịt gà.', '/photo/dish/Thanh-pham-3-3-8670-1650018610_7af547f5cb934cc09d4c52d225980271.jpg'),									--3
(N'Bò nướng phô mai', 320000, 0, 2, N'Món chính đậm đà với bò và phô mai.', '/photo/dish/so-che-va-tam-uop-thit-bo_9db9_0508e752e8e8493ea0354ea2d52f8279.webp'),				--4	
(N'Mỳ Ý sốt bò', 280000, 0, 2, N'Mì Ý kết hợp sốt cà chua và thịt bò.', '/photo/dish/cach-lam-mi-y-sot-thit-bo-bam-ngon-chuan-vi-Y-1_c9623d5fb2a04bbb95578b8f5c5a0079.jpg'),	--5
(N'Gà quay mật ong', 300000, 0, 2, N'Thịt gà quay sốt mật ong da giòn nóng hổi đặc biệt.', '/photo/dish/ga-nuong-mat-ong_f310304ea9e24a4980736339f0ddf019.webp'),				--6	
(N'Bít tết bò', 350000, 0, 2, N'Chế biến từ thịt bò cao cấp nhập khẩu với độ mềm tan chảy.', '/photo/dish/bo-bit-tet-va-khoai-tay-chien (2)-1_ac1e67ba43c44468822803ee3676c5ac.png'),--7																																
(N'Khoai tây nghiền', 80000, 0, 3, N'Khoai tây mềm mịn.', '/photo/dish/khoaitay-1633657549-9352-1633657656_9314fb6b443c469ab98e8e5fcb657d46.jpg'),								--8	
(N'Rau xào bơ tỏi', 100000, 0, 3, N'Món rau nhẹ nhàng.', '/photo/dish/1632277823-416-thumbnail-width640height480_86301bd89b834eea99e281edbb4f7d93.jpg'),						--9	
(N'Rau củ hấp', 90000, 0, 3, N'Các loại rau củ dinh dưỡng ăn kèm.', '/photo/dish/unnamed_3d18a04ce9dd44dabe464741a21278fe.png'),												--10																																										--12
(N'Bánh panna cotta', 110000, 0, 4, N'Món tráng miệng kiểu Ý.', '/photo/dish/coffee-panna-cotta-1-scaled_53771ab9a4b24a729afcd54bdebbf3a2.jpg'),								--11
(N'Kem sô-cô-la', 90000, 0, 4, N'Kem lạnh vị sô-cô-la đậm đà.' , null),																											--12
(N'Bánh flan', 95000, 0, 4, N'Flan mềm mịn, ngọt dịu.', '/photo/dish/banh-flan-socola-2_71a4b9be8ddc459c9be9a7226ae74476_525c8617f006450bb7a5e27f7117f16b.jpg'),				--13
(N'Bánh tart trái cây', 120000, 0, 4, N'Tráng miệng nhiều loại trái cây.', '/photo/dish/1a-1200x676-2_be273c6b12a04ddca5a781e444f98335.jpg'),									--14
(N'Sinh tố bơ', 60000, 0, 5, N'Bơ xay tươi ngon.', '/photo/dish/sinh-to-bo_d649106efd3c463981f024a144d2e933.jpg'),																--15	
(N'Nước ép dưa hấu', 55000, 0, 5, N'Mát lạnh giải khát.', null),																												--16
(N'Nước ép nho', 58000, 0, 5, N'Dinh dưỡng, tươi ngon.', null),																													--17
(N'Cà phê đen', 45000, 0, 5, N'Cà phê nguyên chất.', '/photo/dish/Ca-Phe-Den-scaled_6b4fd13ee36d44fab439083f20411c80.jpg'),														--18
(N'Trà xanh mật ong', 50000, 0, 5, N'Trà dịu nhẹ kết hợp mật ong.', '/photo/dish/shutterstock-134444405-8182-1644678448_ea9b71c3d40c4b13b757103326978ccb.jpg'),					--19
(N'Sữa tươi đánh bọt', 50000, 0, 5, N'Đơn giản nhưng ngon.', null),																												--20

(N'Gỏi Thái hải sản chua cay', 150000, 0, 1, N'Gỏi tôm mực Thái Lan có vị chua ngọt, không chỉ kích thích vị giác mà còn hấp dẫn bởi màu sắc vốn có của món gỏi.', '/photo/dish/goi-tom-muc-thai-lan-thumbnail_7808151f57fe4d2e98871414957c256f.jpg'),		--21
(N'Gỏi miến trộn tôm thịt', 120000, 0, 1, N'Gỏi miến trộn tôm thịt có vị chua chua ngọt ngọt, sợi miến giòn, thịt tôm béo ngậy ăn cùng rau củ.', '/photo/dish/goi-y-8-mon-nguoi-khai-vi-cho-nhung-buoi-tiec-hoi-hop-voi-gia-dinh-202204040922172703_004ba5eca3524e71b6eb2c6d74a2fa6e.jpg'),							--22	
(N'Xôi xoài', 80000, 0, 4, N'Xôi xoài kết hợp sự giản dị của gạo nếp với hương vị nhiệt đới của xoài chín.', '/photo/dish/xoixoai_a079468a3df74631a7d6908919977262.png'),																--23																														
(N'Tôm hùm sốt bơ tỏi', 400000, 0, 2, N'Món ăn thơm ngon, bổ dưỡng được nhiều người yêu thích.', '/photo/dish/tomhum_d91d27eb11d14c10868e5d22f1e876c4.jpg'),																			--24																														
(N'Sườn xào chua ngọt', 230000, 0, 2, N'Sườn non xào gia vị đậm đà.', '/photo/dish/suonxao_2946084422444a45a3f00aa7160aaf56.jpg'),																									--25																														
(N'Vịt quay Bắc Kinh', 500000, 0, 2, N'Món vịt quay truyền thống có hương vị đặc biệt thơm ngon, thịt vịt ngọt mềm, lớp da giòn tan.', null),									--26																														
(N'Bánh tiramisu', 130000, 0, 4, N'Bánh kem nhiều lớp.', '/photo/dish/tiramisu202108082258460504_3b2c04b7a24e4d0cb1008c6d141585ed.jpg'),																													--27																														
(N'Chè long nhãn', 80000, 0, 4, N'Chè long nhãn ngọt và mát.', '/photo/dish/che-hat-sen-long-nhankho-scaled_065b718dcc3c49809794d6204bb2fade.jpeg'),																											--28																														
(N'Cocacola', 25000, 0, 5, null, '/photo/dish/coca_f9c86920462d40f7bd5ed03fde218e3f.webp'),																																			--29																														
(N'Sprite', 25000, 0, 5, null, '/photo/dish/sprite_2cfe5a7a081c4e8e832aa443eeeef361.jpg'),																																			--30																														
(N'Rượu táo mèo', 300000, 0, 5, null, '/photo/dish/ruou_fc70359500f14957a9855b64bf8f636d.webp')																																			--30																														
select * from dish
-- Salad tôm bơ
INSERT INTO Dishingredient VALUES (1, 1, 150), (1, 4, 50), (1, 6, 30);
-- Súp trứng gà
INSERT INTO Dishingredient VALUES (2, 2, 2), (2, 4, 30);
-- Bò nướng phô mai
INSERT INTO Dishingredient VALUES (4, 3, 200), (4, 7, 50);
-- Mỳ Ý sốt bò
INSERT INTO Dishingredient VALUES (5, 10, 100), (5, 3, 100), (5, 11, 50);
-- Gà quay mật ong
INSERT INTO Dishingredient VALUES (6, 17, 200), (6, 20, 20);
-- Khoai tây nghiền
INSERT INTO Dishingredient VALUES (8, 5, 150), (8, 6, 20);
-- Rau xào bơ tỏi
INSERT INTO Dishingredient VALUES (9, 4, 100), (9, 6, 10);
-- Panna cotta
INSERT INTO Dishingredient VALUES (11, 8, 100), (11, 7, 20);
-- Kem sô-cô-la
INSERT INTO Dishingredient VALUES (12, 8, 50), (12, 19, 30);
-- Bánh flan
INSERT INTO Dishingredient VALUES (13, 2, 2), (13, 8, 50);
-- Sinh tố bơ
INSERT INTO Dishingredient VALUES (15, 6, 100), (15, 8, 50);
-- Nước ép dưa hấu
INSERT INTO Dishingredient VALUES (16, 12, 150);
-- Nước ép nho
INSERT INTO Dishingredient VALUES (17, 13, 150);
-- Cà phê đen
INSERT INTO Dishingredient VALUES (18, 14, 15);
-- Trà xanh mật ong
INSERT INTO Dishingredient VALUES (19, 15, 10), (19, 20, 10);
-- Súp gà ngô non
INSERT INTO Dishingredient VALUES (3, 17, 100), (3, 2, 1);
-- Bít tết bò
INSERT INTO Dishingredient VALUES (7, 3, 250);
-- Rau củ hấp
INSERT INTO Dishingredient VALUES (10, 4, 50), (10, 5, 50), (10, 11, 20);
-- Bánh tart trái cây
INSERT INTO Dishingredient VALUES (14, 12, 30), (14, 13, 30), (14, 8, 20);
-- Sữa tươi đánh bọt
INSERT INTO Dishingredient VALUES (20, 8, 100);																							
-- Gỏi Thái hải sản chua cay
INSERT INTO Dishingredient VALUES (21, 1, 100), (21, 18, 100), (21, 21, 70);		
-- Gỏi miến trộn tôm thịt
INSERT INTO Dishingredient VALUES (22, 26, 100), (22, 1, 80), (22, 22, 80);	
-- Xôi xoài
INSERT INTO Dishingredient VALUES (23, 23, 100), (23, 25, 1);																						
-- Tôm hùm sốt bơ tỏi
INSERT INTO Dishingredient VALUES (24, 27, 300);		
-- Sườn xào chua ngọt
INSERT INTO Dishingredient VALUES (25, 22, 350);	
-- Vịt quay Bắc Kinh
INSERT INTO Dishingredient VALUES (26, 28, 2500);	
-- Cocacola
INSERT INTO Dishingredient VALUES (26, 29, 1);	
-- Sprite
INSERT INTO Dishingredient VALUES (26, 30, 1);
-- Rượu táo mèo
INSERT INTO Dishingredient VALUES (26, 31, 1);

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
(N'Lê Thị Thanh Hương', '$2a$11$tuxya.c8cSpTtlkqyWz8xOSEst6lDm4HRlHZ5z02074eduE4pIsSO', '036198000123', '0912345678', 'quanly@gmail.com', 0, '1985-11-15', N'12 Nguyễn Huệ, Q.1, TP.HCM', '2018-06-10', 50000, 1, 1),
-- Nhân viên phục vụ (10 người)
(N'Nguyễn Văn Minh',	'e10adc3949ba59abbe56e057f20f883e', '036198001234', '0912345679', 'nguyenminh.nv@email.com', 1, '1995-03-22', N'45 Lê Lợi, Q.1, TP.HCM', '2021-01-15', 30000, 1, 5),
(N'Trần Thị Ngọc Ánh',	'e10adc3949ba59abbe56e057f20f883e', '036198002345', '0912345680', 'trananh.nv@email.com',	0,	'1996-07-18', N'78 Trần Hưng Đạo, Q.5, TP.HCM', '2021-02-20', 30000, 1, 5),
(N'Phạm Hoàng Long',	'e10adc3949ba59abbe56e057f20f883e', '036198003456', '0912345681', 'phamlong.nv@email.com',	1,	'1997-05-30', N'23 Nguyễn Trãi, Q.5, TP.HCM', '2021-03-10', 30000, 1, 5),
(N'Vũ Thị Mai Linh',	'e10adc3949ba59abbe56e057f20f883e', '036198004567', '0912345682', 'vulinh.nv@email.com',	0,	'1994-09-12', N'56 Cách Mạng Tháng 8, Q.3, TP.HCM', '2023-11-05', 32000, 1, 5),
(N'Đặng Văn Tú',		'e10adc3949ba59abbe56e057f20f883e', '036198005678', '0912345683', 'dangtu.nv@email.com',	1,	'1993-12-05', N'89 Lý Thường Kiệt, Q.10, TP.HCM', '2022-09-15', 32000, 1, 5),
(N'Bùi Thị Thu Hà',		'e10adc3949ba59abbe56e057f20f883e', '036198006789', '0912345684', 'buiha.nv@email.com',		0,	'1998-02-28', N'34 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', '2022-01-10', 28000, 1, 5),
(N'Hoàng Văn Đức',		'e10adc3949ba59abbe56e057f20f883e', '036198007890', '0912345685', 'hoangduc.nv@email.com',	1,	'1992-08-15', N'67 Nguyễn Thị Minh Khai, Q.3, TP.HCM', '2021-07-22', 35000, 1, 5),
(N'Lý Thị Kim Ngân',	'e10adc3949ba59abbe56e057f20f883e', '036198008901', '0912345686', 'lyngan.nv@email.com',	0,	'1999-04-03', N'12 Lê Duẩn, Q.1, TP.HCM', '2024-03-05', 28000, 1, 5),
(N'Mai Văn Hải',		'e10adc3949ba59abbe56e057f20f883e', '036198009012', '0912345687', 'maihai.nv@email.com',	1,	'1991-10-20', N'45 Võ Văn Tần, Q.3, TP.HCM', '2024-05-18', 35000, 1, 5),
(N'Đỗ Thị Phương Thảo', 'e10adc3949ba59abbe56e057f20f883e', '036198010123', '0912345688', 'dothao.nv@email.com',	0,	'1996-01-25', N'78 Nguyễn Đình Chiểu, Q.3, TP.HCM', '2021-04-12', 30000, 1, 5),
-- Bếp trưởng (1 người)
(N'Trần Văn Đại',		'e10adc3949ba59abbe56e057f20f883e', '036198011234', '0912345689', 'tran.dai@email.com',		1,	'1982-06-08', N'23 Trương Định, Q.3, TP.HCM', '2019-08-15', 80000, 1, 3),
-- Nhân viên bếp (3 người)
(N'Nguyễn Thị Hồng Nhung', 'e10adc3949ba59abbe56e057f20f883e', '036198012345', '0912345690', 'nguyennhung.bep@email.com', 0, '1990-07-19', N'56 Nguyễn Văn Trỗi, Q.Phú Nhuận, TP.HCM', '2020-09-10', 45000, 1, 2),
(N'Phan Văn Thắng',		'e10adc3949ba59abbe56e057f20f883e', '036198013456', '0912345691', 'phan.thang@email.com',	1,	'1988-11-30', N'89 Hoàng Văn Thụ, Q.Tân Bình, TP.HCM', '2018-11-05', 48000, 1, 2),
(N'Phạm Quang Vinh',	'e10adc3949ba59abbe56e057f20f883e', '036133422242', '0914345641', 'qunag.vinh@email.com',	1,	'1989-10-20', N'208 Nguyễn Hữu Thọ, Q.Tân Bình, TP.HCM', '2018-11-25', 43000, 1, 2),
-- Kế toán (2 người)
(N'Lê Thị Bích Ngọc',	'e10adc3949ba59abbe56e057f20f883e', '036198014567', '0912345692', 'le.ngoc@email.com',		0,	'1987-03-22', N'34 Lê Quý Đôn, Q.3, TP.HCM', '2017-05-20', 60000, 1, 4),
(N'Lê Thị Tuyết Hạnh',	'e10adc3949ba59abbe56e057f20f883e', '034498014444', '0912345444', 'tuyethanh@email.com',	0,	'1977-07-12', N'20 Võ Thị Sáu, Q.5, TP.HCM', '2020-05-20', 65000, 1, 4),
-- Nhân viên an ninh (3 người)
(N'Võ Văn Sơn',			'e10adc3949ba59abbe56e057f20f883e', '036198015678', '0912345693', 'vo.son@email.com',		1,	'1983-09-14', N'12 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM', '2016-12-01', 35000, 1, 6),
(N'Đinh Thị Hồng Nga',	'e10adc3949ba59abbe56e057f20f883e', '036198016789', '0912345694', 'dinh.nga@email.com',		0,	'1984-12-05', N'45 Phan Đăng Lưu, Q.Bình Thạnh, TP.HCM', '2017-02-15', 35000, 1, 6),
(N'Tường Ngọc Vĩ',		'e10adc3949ba59abbe56e057f20f883e', '036128016123', '0912345232', 'tuongvi@email.com',		0,	'1993-12-05', N'89 Lý Thường Kiệt, Q.10, TP.HCM', '2022-09-15', 32000, 1, 6),
-- Nhân viên trực kho (2 người)
(N'Trương Văn Tài',		'e10adc3949ba59abbe56e057f20f883e', '036198017890', '0912345695', 'truong.tai@email.com',	1,	'1986-04-18', N'78 Nguyễn Hữu Cảnh, Q.Bình Thạnh, TP.HCM', '2018-03-10', 40000, 1, 7),
(N'Ngô Thị Thu Hiền',	'e10adc3949ba59abbe56e057f20f883e', '036198018901', '0912345696', 'ngo.hien@email.com',		0,	'1989-08-22', N'23 Xô Viết Nghệ Tĩnh, Q.Bình Thạnh, TP.HCM', '2019-04-05', 38000, 1, 7),
-- Lễ tân (2 người)
(N'Hoàng Thị Ngọc Hân', 'e10adc3949ba59abbe56e057f20f883e', '036198019012', '0912345697', 'hoang.han@email.com',	0,	'1995-02-28', N'56 Nguyễn Văn Cừ, Q.1, TP.HCM', '2020-07-15', 45000, 1, 8),
(N'Trương Thuận',		'e10adc3949ba59abbe56e057f20f883e', '03619646012',	'0912354397', 'thuan@email.com',		1,	'1996-01-25', N'78 Nguyễn Đình Chiểu, Q.3, TP.HCM', '2021-04-12', 43000, 1, 8);

INSERT INTO RESERVATIONSTATUS VALUES 
(N'Chờ xác nhận'),
(N'Đã chấp nhận'),
(N'Đã từ chối'),
(N'Đã hoàn thành'),
(N'Đã hủy')

INSERT INTO RESERVATION (BOOKDATE, PHONE, EMAIL, RESERVATIONDATE, RESERVATIONTIME, PARTYSIZE, RESERVATIONPRICE,
NOTE, TRANSACTIONID, ID_RESERVATIONSTATUS, ID_CUSTOMER, ID_DINETABLE, ID_STAFF) VALUES 
('2025-02-25 8:30', '0912345444', 'hoang.k@example.com',		'2025-03-25', '20:00', 2, 0,		NULL, NULL,		4, 8, 1,	2),		--1
('2025-03-02 8:30', '0912345444', 'ngoc.k@example.com',			'2025-04-02', '21:00', 2, 590000,	NULL, 2343251,	3, 4, 1,	2),		--2
('2025-03-08 8:30', '0987654321', 'phat.k@example.com',			'2025-04-08', '19:00', 3, 0,		NULL, NULL,		3, 6, 1,	2),		--3
('2025-03-10 8:30', '0912345694', 'hoang.k@example.com',		'2025-04-10', '20:00', 3, 200000,	NULL, 2323231,	4, 9, 1,	2),		--4
('2025-04-20 8:30', '0912345684', 'hoang.k@example.com',		'2025-05-20', '20:00', 2, 0,		NULL, NULL,		4, 12, 1,	2),		--5
('2025-05-02 8:30', '0923999445', 'phat.k@example.com',			'2025-06-02', '11:30', 4, 250000,	NULL, 3424421,	3, NULL, 1, 3),		--6
('2025-05-12 8:30', '0987654321', 'ly.k@example.com',			'2025-06-12', '12:00', 2, 0,		NULL, NULL,		4, 4, 4,	4),		--7
('2025-05-14 8:30', '0987654321', 'ly.k@example.com',			'2025-06-14', '19:00', 10, 370000,	NULL, 5541543,	4, 8, 20,	4),		--8
('2025-05-19 8:30', '0987654321', 'ly.k@example.com',			'2025-06-19', '19:00', 5, 0,		NULL, NULL,		4, 8, 17,	4),		--9
('2025-06-01 8:30', '0912345694', 'hung.k@example.com',			'2025-07-01', '16:30', 5, 590000,	NULL, 2561414,	3, 11, 17,	4),		--10
('2025-06-03 8:30', '0336664321', 'ly.k@example.com',			'2025-07-03', '22:00', 2, 0,		NULL, NULL,		4, NULL, 1, 7),		--11
('2025-06-13 8:30', '0912345684', 'hung.k@example.com',			'2025-07-13', '17:30', 6, 475000,	NULL, 5145345,	4, 12, 17,	1),		--12
('2025-06-20 8:30', '0987654321', 'ly.k@example.com',			'2025-07-20', '12:30', 4, 0,		NULL, NULL,		4, 11, 8,	1),		--13
('2025-06-21 8:30', '0912345694', 'hung.k@example.com',			'2025-07-21', '13:30', 2, 670000,	NULL, 2456355,	4, 5, 8,	1),		--14
('2025-07-01 8:30', '0987654321', 'hung.k@example.com',			'2025-08-01', '14:30', 2, 0,		NULL, NULL,		4, 9, 8,	3),		--15
('2025-07-06 8:30', '0912345444', 'hung.k@example.com',			'2025-08-06', '15:30', 3, 0,		NULL, NULL,		2, 11, 8,	3),		--16
('2025-07-09 8:30', '0987654321', 'ly.k@example.com',			'2025-08-09', '16:30', 4, 0,		NULL, NULL,		2, 5, 8,	1),		--17
('2025-07-10 8:30', '0912345694', 'ly.k@example.com',			'2025-08-10', '17:30', 4, 0,		NULL, NULL,		2, 9, 8,	1),		--18
('2025-07-15 8:30', '0912345444', 'nguyenchiduc003@gmail.com',	'2025-07-16', '17:30', 6, 425000,	NULL, 8356255,	4, 1, 17,	5),		--19
('2025-07-15 8:30', '0912345694', 'ngoc.k@example.com',			'2025-08-15', '18:30', 4, 0,		NULL, NULL,		2, 10, 8,	9),		--20
('2025-07-25 8:30', '0987654321', 'ngoc.k@example.com',			'2025-08-25', '19:30', 4, 0,		NULL, NULL,		2, 5, 8,	9),		--21
('2025-07-27 8:30', '0912345684', 'phat.k@example.com',			'2025-08-27', '20:30', 4, 0,		NULL, NULL,		2, 4, 8,	6),		--22
('2025-07-30 8:30', '0987654321', 'ly.k@example.com',			'2025-08-30', '21:30', 14, 0,		NULL, NULL,		2, 11, 20,	10),	--23
('2025-07-30 8:30', '0987654321', 'nguyenchiduc003@gmail.com',	'2025-07-30', '17:30', 2, 530000,	NULL, 6175434, 4, 1, 8,		10),	--24
('2025-07-30 8:30', '0912345684', 'ly.k@example.com',			'2025-08-30', '12:30', 10, 0,		NULL, NULL,		2, 5, 20,	5),		--25
('2025-08-01 8:30', '0912345684', 'phat.k@example.com',			'2025-09-01', '10:30', 12, 330000,	NULL, 2342356,	2, 6, 20,	10),	--26
('2025-08-01 8:30', '0912345444', 'ly.k@example.com',			'2025-09-01', '17:30', 3, 0,		NULL, NULL,		2, 11, 8,	5),		--27
('2025-08-02 8:30', '0987654321', 'nguyenchiduc003@gmail.com',	'2025-09-02', '17:30', 2, 0,		NULL, NULL,		2, 1, 8,	3)		--28
																																
INSERT INTO RESERVATIONORDER (ID_RESERVATION,ID_DISH,QUANTITY,TOTAL) VALUES														
(2, 1, 1, 150000),	(2, 12, 1, 90000),	(2, 7, 1, 350000),																			
(4, 2, 1, 120000),	(4, 8, 1, 80000),																							
(6, 1, 1, 150000),	(6, 9, 1, 100000),																							
(8, 5, 1, 280000),	(8, 10, 1, 90000),																							
(10, 1, 1, 150000),	(10, 6, 1, 300000),	(10, 12, 1, 90000),(10, 20, 1, 50000),														
(12, 3, 1, 125000),	(12, 7, 1, 350000),	 
(14, 2, 1, 120000),	(14, 7, 1, 350000),	(14, 20, 1, 50000),(14, 21, 1, 150000),
(19, 3, 1, 125000),	(19, 6, 1, 300000),	 
(24, 6, 1, 300000),	(24, 8, 1, 80000),	(24, 21, 1, 150000),
(26, 1, 1, 150000),	(26, 8, 1, 80000),	(26, 20, 2, 100000)

INSERT INTO ORDERSTATUS VALUES
(N'Chờ xác nhận'),
(N'Từ chối'),
(N'Đang thực hiện'),
(N'Đang giao'),
(N'Đã hoàn thành')

INSERT INTO SHIPORDER (ORDERDATE,CUSTOMERNAME,PHONE,EMAIL,ISSHIPPING,SHIPADDRESS,SHIPFEE,ORDERPRICE,NOTE,TRANSACTIONID,ID_ORDERSTATUS,ID_CART,ID_STAFF) VALUES
('2025-02-25 12:30',	N'Trần Văn Chung', 	'0912345444', 'hoang.k@example.com',		0, NULL, 0, 470000, null, null, 5, 2, 2),	--1
('2025-03-02 12:30',	N'Phạm Thị Dung',	'0912345444', 'ngoc.k@example.com',			0, NULL, 0, 470000, null, null, 5, 2, 2),	--2
('2025-03-08 12:30',	N'Hồ Văn Toàn',		'0987654321', 'phat.k@example.com',			0, NULL, 0, 470000, null, null, 2, 2, 2),	--3
('2025-03-10 12:30',	N'Đặng Thị Nhi',	'0912345694', 'hoang.k@example.com',		0, NULL, 0, 470000, null, null, 5, 2, 2),	--4
('2025-04-20 12:30',	N'Võ Văn Giang',	'0912345684', 'hoang.k@example.com',		0, NULL, 0, 470000, null, null, 5, 2, 2),	--5
('2025-05-02 12:30',	N'Thái Thị Hồng',	'0923999445', 'phat.k@example.com',			0, NULL, 0, 470000, null, null, 5, 3, 3),	--6
('2025-05-12 12:30',	N'Phan Văn Ánh',	'0987654321', 'ly.k@example.com',			0, NULL, 0, 470000, null, null, 5, 4, 4),	--7
('2025-05-14 12:30',	N'Trần Văn Chung', 	'0987654321', 'ly.k@example.com',			0, NULL, 0, 470000, null, null, 5, 4, 4),	--8
('2025-05-19 12:30',	N'Phạm Thị Dung',	'0987654321', 'ly.k@example.com',			0, NULL, 0, 470000, null, null, 2, 4, 4),	--9
('2025-06-01 12:30',	N'Hồ Văn Toàn',		'0912345694', 'hung.k@example.com',			0, NULL, 0, 470000, null, null, 5, 4, 4),	--10
('2025-06-03 12:30',	N'Đặng Thị Nhi',	'0336664321', 'ly.k@example.com',			0, NULL, 0, 470000, null, null, 5, 7, 7),	--11
('2025-06-13 12:30',	N'Võ Văn Giang',	'0912345684', 'hung.k@example.com',			0, NULL, 0, 470000, null, null, 5, 10, 1),	--12
('2025-06-20 12:30',	N'Thái Thị Hồng',	'0987654321', 'ly.k@example.com',			0, NULL, 0, 470000, null, null, 2, 10, 1),	--13
('2025-06-21 12:30',	N'Phan Văn Ánh',	'0912345694', 'hung.k@example.com',			0, NULL, 0, 470000, null, null, 5, 6, 1),	--14
('2025-07-01 12:30',	N'Trần Văn Chung', 	'0987654321', 'hung.k@example.com',			0, NULL, 0, 470000, null, null, 5, 3, 3),	--15
('2025-07-06 12:30',	N'Phạm Thị Dung',	'0912345444', 'hung.k@example.com',			0, NULL, 0, 470000, null, null, 5, 3, 3),	--16
('2025-07-09 12:30',	N'Hồ Văn Toàn',		'0987654321', 'ly.k@example.com',			0, NULL, 0, 470000, null, null, 5, 3, 1),	--17
('2025-07-10 12:30',	N'Đặng Thị Nhi',	'0912345694', 'ly.k@example.com',			0, NULL, 0, 470000, null, null, 5, 3, 1),	--18
('2025-07-15 12:30',	N'Nguyễn Chí Đức',	'0123456789', 'nguyenchiduc003@gmail.com',	0, NULL, 0, 470000, null, null, 5, 1, 5),	--19
('2025-07-15 12:30',	N'Thái Thị Hồng',	'0912345694', 'ngoc.k@example.com',			0, NULL, 0, 470000, null, null, 5, 9, 9),	--20
('2025-07-25 12:30',	N'Phan Văn Ánh',	'0987654321', 'ngoc.k@example.com',			0, NULL, 0, 470000, null, null, 5, 9, 9),	--21
('2025-07-27 12:30',	N'Trần Văn Chung', 	'0912345684', 'phat.k@example.com',			0, NULL, 0, 470000, null, null, 5, 6, 6),	--22
('2025-07-30 12:30',	N'Phạm Thị Dung',	'0987654321', 'ly.k@example.com',			0, NULL, 0, 470000, null, null, 5, 3, 10),	--23
('2025-07-30 12:30',	N'Nguyễn Chí Đức',	'0123456789', 'nguyenchiduc003@gmail.com',	0, NULL, 0, 570000, null, null, 5, 1, 10),	--24
('2025-07-30 12:30',	N'Đặng Thị Nhi',	'0912345684', 'ly.k@example.com',			0, NULL, 0, 470000, null, null, 5, 5, 5),	--25
('2025-08-01 12:30',	N'Võ Văn Giang',	'0912345684', 'phat.k@example.com',			0, NULL, 0, 470000, null, null, 5, 3, 10),	--26
('2025-08-01 12:30',	N'Thái Thị Hồng',	'0912345444', 'ly.k@example.com',			0, NULL, 0, 470000, null, null, 5, 5, 5),	--27
('2025-08-02 12:30',	N'Nguyễn Chí Đức',	'0123456789', 'nguyenchiduc003@gmail.com',	0, NULL, 0, 470000, null, null, 5, 1, 3)	--28

INSERT INTO ORDERITEM(ID_SHIPORDER, ID_DISH, QUANTITY, SUBTOTAL) VALUES 
(1, 2, 1, 120000),	(1, 7, 1, 350000),		--1
(2, 2, 1, 120000),	(2, 7, 1, 350000),		--2
(3, 2, 1, 120000),	(3, 7, 1, 350000),		--3
(4, 2, 1, 120000),	(4, 7, 1, 350000),		--4
(5, 2, 1, 120000),	(5, 7, 1, 350000),		--5
(6, 2, 1, 120000),	(6, 7, 1, 350000),		--6
(7, 2, 1, 120000),	(7, 7, 1, 350000),		--7
(8, 2, 1, 120000),	(8, 7, 1, 350000),		--8
(9, 2, 1, 120000),	(9, 7, 1, 350000),		--9
(10, 2, 1, 120000), (10, 7, 1, 350000),		--10
(11, 2, 1, 120000), (11, 7, 1, 350000),		--11
(12, 2, 1, 120000), (12, 7, 1, 350000),		--12
(13, 2, 1, 120000), (13, 7, 1, 350000),		--13
(14, 2, 1, 120000), (14, 7, 1, 350000),		--14
(15, 2, 1, 120000), (15, 7, 1, 350000),		--15
(16, 2, 1, 120000), (16, 7, 1, 350000),		--16
(17, 2, 1, 120000), (17, 7, 1, 350000),		--17
(18, 2, 1, 120000), (18, 7, 1, 350000),		--18
(19, 2, 1, 120000), (19, 7, 1, 350000),		--19
(20, 2, 1, 120000), (20, 7, 1, 350000),		--20
(21, 2, 1, 120000), (21, 7, 1, 350000),		--21
(22, 2, 1, 120000), (22, 7, 1, 350000),		--22
(23, 2, 1, 120000), (23, 7, 1, 350000),		--23
(24, 2, 1, 120000), (24, 7, 1, 350000), (24, 20, 2, 100000),	--24
(25, 2, 1, 120000), (25, 7, 1, 350000),		--25
(26, 2, 1, 120000), (26, 7, 1, 350000),		--26
(27, 2, 1, 120000), (27, 7, 1, 350000),		--27
(28, 2, 1, 120000), (28, 7, 1, 350000)		--28

INSERT INTO WORKDAY VALUES 
(2),(3),(4),(5),(6),(7),(8)

INSERT INTO WORKSHIFT VALUES 
(1, '9:00', '13:00', 4),	-- 9 - 13
(2, '13:00', '18:00', 5),	-- 13 - 18
(3, '18:00', '22:00', 4)  -- 18 - 22
INSERT INTO WEEKLYSHIFT (ID_STAFF, ID_WORKDAY, ID_WORKSHIFT, PROCESSED, ATTENDED, ISLATE) VALUES 
(3, 1, 1, 0, 0, 0), (4, 1, 1, 0, 0, 0), (7, 1, 1, 0, 0, 0),	(10, 1, 1, 0, 0, 0), (11, 1, 1, 0, 0, 0), (12, 1, 1, 0, 0, 0), (15, 1, 1, 0, 0, 0), (18, 1, 1, 0, 0, 0), (21, 1, 1, 0, 0, 0), (24, 1, 1, 0, 0, 0),
(1, 2, 1, 0, 0, 0), (3, 2, 1, 0, 0, 0), (6, 2, 1, 0, 0, 0),	(7, 2, 1, 0, 0, 0),	 (14, 2, 1, 0, 0, 0), (15, 2, 1, 0, 0, 0), (17, 2, 1, 0, 0, 0), (19, 2, 1, 0, 0, 0), (23, 2, 1, 0, 0, 0), 
(6, 3, 1, 0, 0, 0), (8, 3, 1, 0, 0, 0), (10, 3, 1, 0, 0, 0),(13, 3, 1, 0, 0, 0), (15, 3, 1, 0, 0, 0), (17, 3, 1, 0, 0, 0), (18, 3, 1, 0, 0, 0), (22, 3, 1, 0, 0, 0), (24, 3, 1, 0, 0, 0), 
(2, 4, 1, 0, 0, 0), (3, 4, 1, 0, 0, 0), (4, 4, 1, 0, 0, 0),	(9, 4, 1, 0, 0, 0),  (12, 4, 1, 0, 0, 0), (14, 4, 1, 0, 0, 0), (16, 4, 1, 0, 0, 0), (18, 4, 1, 0, 0, 0), (22, 4, 1, 0, 0, 0), (23, 4, 1, 0, 0, 0),
(1, 5, 1, 0, 0, 0), (2, 5, 1, 0, 0, 0), (3, 5, 1, 0, 0, 0),	(5, 5, 1, 0, 0, 0),  (6, 5, 1, 0, 0, 0),  (8, 5, 1, 0, 0, 0),  (14, 5, 1, 0, 0, 0), (16, 5, 1, 0, 0, 0), (20, 5, 1, 0, 0, 0), (22, 5, 1, 0, 0, 0), (24, 5, 1, 0, 0, 0),
(1, 6, 1, 0, 0, 0), (6, 6, 1, 0, 0, 0), (9, 6, 1, 0, 0, 0),	(10, 6, 1, 0, 0, 0), (12, 6, 1, 0, 0, 0), (14, 6, 1, 0, 0, 0), (18, 6, 1, 0, 0, 0), (22, 6, 1, 0, 0, 0), (24, 6, 1, 0, 0, 0), 					   
(1, 7, 1, 0, 0, 0), (2, 7, 1, 0, 0, 0), (3, 7, 1, 0, 0, 0),	(4, 7, 1, 0, 0, 0),  (8, 7, 1, 0, 0, 0),  (11, 7, 1, 0, 0, 0), (12, 7, 1, 0, 0, 0), (13, 7, 1, 0, 0, 0), (16, 7, 1, 0, 0, 0), (18, 7, 1, 0, 0, 0), (19, 7, 1, 0, 0, 0), (22, 7, 1, 0, 0, 0), (24, 7, 1, 0, 0, 0),
(1, 1, 2, 0, 0, 0), (3, 1, 2, 0, 0, 0), (5, 1, 2, 0, 0, 0),	(6, 1, 2, 0, 0, 0),  (12, 1, 2, 0, 0, 0), (14, 1, 2, 0, 0, 0), (18, 1, 2, 0, 0, 0), (21, 1, 2, 0, 0, 0), (23, 1, 2, 0, 0, 0), 					   					    
(1, 2, 2, 0, 0, 0), (4, 2, 2, 0, 0, 0), (7, 2, 2, 0, 0, 0),	(11, 2, 2, 0, 0, 0), (12, 2, 2, 0, 0, 0), (14, 2, 2, 0, 0, 0), (17, 2, 2, 0, 0, 0), (20, 2, 2, 0, 0, 0), (23, 2, 2, 0, 0, 0), 					   					    
(1, 3, 2, 0, 0, 0), (2, 3, 2, 0, 0, 0), (3, 3, 2, 0, 0, 0),	(5, 3, 2, 0, 0, 0),  (8, 3, 2, 0, 0, 0),  (11, 3, 2, 0, 0, 0), (12, 3, 2, 0, 0, 0), (13, 3, 2, 0, 0, 0), (16, 3, 2, 0, 0, 0), (18, 3, 2, 0, 0, 0), (23, 3, 2, 0, 0, 0), 
(1, 4, 2, 0, 0, 0), (2, 4, 2, 0, 0, 0), (8, 4, 2, 0, 0, 0),	(9, 4, 2, 0, 0, 0),  (14, 4, 2, 0, 0, 0), (15, 4, 2, 0, 0, 0), (17, 4, 2, 0, 0, 0), (21, 4, 2, 0, 0, 0), (23, 4, 2, 0, 0, 0), 					   					    
(1, 5, 2, 0, 0, 0), (2, 5, 2, 0, 0, 0), (3, 5, 2, 0, 0, 0),	(4, 5, 2, 0, 0, 0),  (9, 5, 2, 0, 0, 0),  (10, 5, 2, 0, 0, 0), (12, 5, 2, 0, 0, 0), (15, 5, 2, 0, 0, 0), (18, 5, 2, 0, 0, 0), (20, 5, 2, 0, 0, 0), (21, 5, 2, 0, 0, 0), (23, 5, 2, 0, 0, 0),
(1, 6, 2, 0, 0, 0), (3, 6, 2, 0, 0, 0), (5, 6, 2, 0, 0, 0),	(10, 6, 2, 0, 0, 0), (13, 6, 2, 0, 0, 0), (14, 6, 2, 0, 0, 0), (16, 6, 2, 0, 0, 0), (20, 6, 2, 0, 0, 0), (22, 6, 2, 0, 0, 0), (24, 6, 2, 0, 0, 0), 					    
(1, 7, 2, 0, 0, 0), (2, 7, 2, 0, 0, 0), (4, 7, 2, 0, 0, 0),	(5, 7, 2, 0, 0, 0),  (7, 7, 2, 0, 0, 0),  (9, 7, 2, 0, 0, 0),  (12, 7, 2, 0, 0, 0), (13, 7, 2, 0, 0, 0), (14, 7, 2, 0, 0, 0), (17, 7, 2, 0, 0, 0), (18, 7, 2, 0, 0, 0), (20, 7, 2, 0, 0, 0), (21, 7, 2, 0, 0, 0), (22, 7, 2, 0, 0, 0), (23, 7, 2, 0, 0, 0),
(1, 1, 3, 0, 0, 0), (2, 1, 3, 0, 0, 0), (3, 1, 3, 0, 0, 0),	(5, 1, 3, 0, 0, 0),  (6, 1, 3, 0, 0, 0),  (12, 1, 3, 0, 0, 0), (13, 1, 3, 0, 0, 0), (17, 1, 3, 0, 0, 0), (18, 1, 3, 0, 0, 0), (24, 1, 3, 0, 0, 0), 					    
(1, 2, 3, 0, 0, 0), (2, 2, 3, 0, 0, 0), (6, 2, 3, 0, 0, 0),	(9, 2, 3, 0, 0, 0),  (10, 2, 3, 0, 0, 0), (13, 2, 3, 0, 0, 0), (14, 2, 3, 0, 0, 0), (16, 2, 3, 0, 0, 0), (20, 2, 3, 0, 0, 0), (21, 2, 3, 0, 0, 0), (24, 2, 3, 0, 0, 0), 
(1, 3, 3, 0, 0, 0), (2, 3, 3, 0, 0, 0), (7, 3, 3, 0, 0, 0),	(10, 3, 3, 0, 0, 0), (11, 3, 3, 0, 0, 0), (12, 3, 3, 0, 0, 0), (15, 3, 3, 0, 0, 0), (20, 3, 3, 0, 0, 0), (24, 3, 3, 0, 0, 0), 					   					    
(1, 4, 3, 0, 0, 0), (3, 4, 3, 0, 0, 0), (5, 4, 3, 0, 0, 0),	(11, 4, 3, 0, 0, 0), (12, 4, 3, 0, 0, 0), (13, 4, 3, 0, 0, 0), (18, 4, 3, 0, 0, 0), (22, 4, 3, 0, 0, 0), (23, 4, 3, 0, 0, 0), 					   					    
(1, 5, 3, 0, 0, 0), (4, 5, 3, 0, 0, 0), (5, 5, 3, 0, 0, 0),	(7, 5, 3, 0, 0, 0),  (9, 5, 3, 0, 0, 0),  (13, 5, 3, 0, 0, 0), (15, 5, 3, 0, 0, 0), (16, 5, 3, 0, 0, 0), (20, 5, 3, 0, 0, 0), (22, 5, 3, 0, 0, 0), (23, 5, 3, 0, 0, 0), 
(1, 6, 3, 0, 0, 0), (2, 6, 3, 0, 0, 0), (4, 6, 3, 0, 0, 0),	(5, 6, 3, 0, 0, 0),  (8, 6, 3, 0, 0, 0),  (10, 6, 3, 0, 0, 0), (11, 6, 3, 0, 0, 0), (12, 6, 3, 0, 0, 0), (13, 6, 3, 0, 0, 0), (15, 6, 3, 0, 0, 0), (18, 6, 3, 0, 0, 0), (20, 6, 3, 0, 0, 0), (21, 6, 3, 0, 0, 0), (24, 6, 3, 0, 0, 0),
(7, 7, 3, 0, 0, 0), (9, 7, 3, 0, 0, 0), (10, 7, 3, 0, 0, 0),(11, 7, 3, 0, 0, 0), (12, 7, 3, 0, 0, 0), (13, 7, 3, 0, 0, 0), (14, 7, 3, 0, 0, 0), (17, 7, 3, 0, 0, 0), (19, 7, 3, 0, 0, 0), (20, 7, 3, 0, 0, 0), (22, 7, 3, 0, 0, 0), (23, 7, 3, 0, 0, 0)
