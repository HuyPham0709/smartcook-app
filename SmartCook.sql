-- 1. TẠO DATABASE
CREATE DATABASE SmartCookDB;
GO
USE SmartCookDB;
GO

-- 2. MODULE: PHÂN QUYỀN (RBAC)
CREATE TABLE Roles (
    ID INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL UNIQUE, -- Admin, Moderator, User, KOL
    Description NVARCHAR(255)
);

-- 3. MODULE: NGƯỜI DÙNG & BẢO MẬT
CREATE TABLE Users (
    ID INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX), -- Null nếu chỉ dùng Google OAuth
    FullName NVARCHAR(255),
    AvatarURL NVARCHAR(MAX),
    Bio NVARCHAR(1000),
    
    -- Security & 2FA
    TwoFactorSecret NVARCHAR(MAX),
    Is2FAEnabled BIT DEFAULT 0,
    GoogleId NVARCHAR(255), -- Cho OAuth2
    
    -- Verification cho KOL
    IsVerified BIT DEFAULT 0,
    PublicKey NVARCHAR(MAX), -- Chữ ký số PKI cho KOL
    
    RoleID INT DEFAULT 3, -- Mặc định là User
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleID) REFERENCES Roles(ID)
);

CREATE TABLE UserSessions (
    ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID INT NOT NULL,
    RefreshToken NVARCHAR(MAX) NOT NULL,
    DeviceInfo NVARCHAR(MAX), -- Thông tin trình duyệt/thiết bị
    IPAddress NVARCHAR(50),
    IsRevoked BIT DEFAULT 0,
    ExpiresAt DATETIME NOT NULL,
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    
    CONSTRAINT FK_Sessions_Users FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE
);

-- 4. MODULE: CÔNG THỨC (CORE)
CREATE TABLE Recipes (
    ID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    ThumbnailURL NVARCHAR(MAX),
    
    -- Thông số nấu ăn
    CookingTime INT, -- Phút
    Servings INT, -- Khẩu phần
    Difficulty NVARCHAR(50), -- Dễ, Trung bình, Khó
    
    -- AI Generated Data (Dinh dưỡng)
    Calories FLOAT DEFAULT 0,
    Protein FLOAT DEFAULT 0,
    Carbs FLOAT DEFAULT 0,
    Fat FLOAT DEFAULT 0,
    
    -- Tính năng Remix/Fork
    ParentRecipeID INT NULL, -- Trỏ về công thức gốc nếu là bản biến tấu
    
    Status NVARCHAR(50) DEFAULT 'Published', -- Draft, Published, Hidden
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT FK_Recipes_Users FOREIGN KEY (UserID) REFERENCES Users(ID),
    CONSTRAINT FK_Recipes_Remix FOREIGN KEY (ParentRecipeID) REFERENCES Recipes(ID)
);

-- Chi tiết nguyên liệu
CREATE TABLE Ingredients (
    ID INT PRIMARY KEY IDENTITY(1,1),
    RecipeID INT NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Amount FLOAT NOT NULL,
    Unit NVARCHAR(50), -- g, ml, muỗng, quả...
    Note NVARCHAR(255),
    
    CONSTRAINT FK_Ingredients_Recipes FOREIGN KEY (RecipeID) REFERENCES Recipes(ID) ON DELETE CASCADE
);

-- Các bước thực hiện
CREATE TABLE RecipeSteps (
    ID INT PRIMARY KEY IDENTITY(1,1),
    RecipeID INT NOT NULL,
    StepNumber INT NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    MediaURL NVARCHAR(MAX), -- Ảnh hoặc Video cho bước này
    
    CONSTRAINT FK_Steps_Recipes FOREIGN KEY (RecipeID) REFERENCES Recipes(ID) ON DELETE CASCADE
);

-- Phân loại (Diet, Cuisine...)
CREATE TABLE Categories (
    ID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    CategoryType NVARCHAR(50) -- 'Diet', 'Course', 'Cuisine'
);

CREATE TABLE RecipeCategoryMapping (
    RecipeID INT NOT NULL,
    CategoryID INT NOT NULL,
    PRIMARY KEY (RecipeID, CategoryID),
    CONSTRAINT FK_Map_Recipe FOREIGN KEY (RecipeID) REFERENCES Recipes(ID) ON DELETE CASCADE,
    CONSTRAINT FK_Map_Category FOREIGN KEY (CategoryID) REFERENCES Categories(ID) ON DELETE CASCADE
);

-- 5. MODULE: TƯƠNG TÁC XÃ HỘI
CREATE TABLE Follows (
    FollowerID INT NOT NULL,
    FollowingID INT NOT NULL,
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    PRIMARY KEY (FollowerID, FollowingID),
    CONSTRAINT FK_Follower FOREIGN KEY (FollowerID) REFERENCES Users(ID),
    CONSTRAINT FK_Following FOREIGN KEY (FollowingID) REFERENCES Users(ID)
);

CREATE TABLE Likes (
    UserID INT NOT NULL,
    RecipeID INT NOT NULL,
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    PRIMARY KEY (UserID, RecipeID),
    CONSTRAINT FK_Likes_User FOREIGN KEY (UserID) REFERENCES Users(ID),
    CONSTRAINT FK_Likes_Recipe FOREIGN KEY (RecipeID) REFERENCES Recipes(ID) ON DELETE CASCADE
);

CREATE TABLE Ratings (
    ID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    RecipeID INT NOT NULL,
    Score INT CHECK (Score BETWEEN 1 AND 5),
    Comment NVARCHAR(MAX),
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT FK_Ratings_User FOREIGN KEY (UserID) REFERENCES Users(ID),
    CONSTRAINT FK_Ratings_Recipe FOREIGN KEY (RecipeID) REFERENCES Recipes(ID) ON DELETE CASCADE
);

CREATE TABLE Comments (
    ID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    RecipeID INT NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    ParentCommentID INT NULL, -- Hỗ trợ Nested Comments (Trả lời bình luận)
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    
    CONSTRAINT FK_Comments_User FOREIGN KEY (UserID) REFERENCES Users(ID),
    CONSTRAINT FK_Comments_Recipe FOREIGN KEY (RecipeID) REFERENCES Recipes(ID) ON DELETE CASCADE,
    CONSTRAINT FK_Comments_Parent FOREIGN KEY (ParentCommentID) REFERENCES Comments(ID)
);

-- 6. MODULE: THÔNG BÁO & AI LOGS
CREATE TABLE Notifications (
    ID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Type NVARCHAR(50), -- 'Like', 'Comment', 'Follow', 'System'
    Message NVARCHAR(MAX),
    IsRead BIT DEFAULT 0,
    RelatedID INT, -- ID của Recipe hoặc Comment liên quan
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    
    CONSTRAINT FK_Noti_User FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE
);

CREATE TABLE AILogs (
    ID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    Prompt NVARCHAR(MAX),
    Response NVARCHAR(MAX),
    TokensUsed INT,
    FeatureType NVARCHAR(50), -- 'SuggestByIngredients', 'NutritionEstimation', 'Chatbot'
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- 7. MODULE: QUẢN TRỊ & KIỂM DUYỆT
CREATE TABLE Reports (
    ID INT PRIMARY KEY IDENTITY(1,1),
    ReporterID INT NOT NULL,
    TargetType NVARCHAR(50), -- 'Recipe', 'Comment', 'User'
    TargetID INT NOT NULL,
    Reason NVARCHAR(255),
    Status NVARCHAR(50) DEFAULT 'Pending', -- Pending, Resolved, Dismissed
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    
    CONSTRAINT FK_Reports_User FOREIGN KEY (ReporterID) REFERENCES Users(ID)
);

CREATE TABLE AuditLogs (
    ID INT PRIMARY KEY IDENTITY(1,1),
    AdminID INT NOT NULL,
    Action NVARCHAR(100), -- 'DeleteRecipe', 'BanUser'
    TargetID INT,
    ActionDetails NVARCHAR(MAX),
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    
    CONSTRAINT FK_Audit_Admin FOREIGN KEY (AdminID) REFERENCES Users(ID)
);

-- 8. TẠO CHỈ MỤC (INDEXES) ĐỂ TỐI ƯU HÓA TÌM KIẾM
CREATE INDEX IX_Recipe_Title ON Recipes(Title);
CREATE INDEX IX_Recipe_Remix ON Recipes(ParentRecipeID);
CREATE INDEX IX_Ingredient_Name ON Ingredients(Name);
CREATE INDEX IX_Noti_User_Unread ON Notifications(UserID, IsRead);
GO

-- Thêm cột lưu số lần bị cảnh cáo
ALTER TABLE Users ADD WarningCount INT DEFAULT 0;

-- Thêm cột lưu thời hạn khóa tài khoản (Null = Không khóa)
ALTER TABLE Users ADD BanUntil DATETIMEOFFSET NULL;

ALTER TABLE Users ADD BanReason NVARCHAR(500) NULL;

-- Thêm cột active với giá trị mặc định là 1 (Hoạt động)
ALTER TABLE Users ADD active INT DEFAULT 1;
GO

-- Cập nhật tất cả user cũ đang có trong DB thành 1
UPDATE Users SET active = 1 WHERE active IS NULL;
-- Bổ sung bảng Badges và UserBadges
CREATE TABLE Badges (
    ID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Icon NVARCHAR(50), -- Emoji hoặc URL icon
    Description NVARCHAR(255),
    Color NVARCHAR(50)
);

CREATE TABLE UserBadges (
    UserID INT NOT NULL,
    BadgeID INT NOT NULL,
    AchievedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    PRIMARY KEY (UserID, BadgeID),
    CONSTRAINT FK_UserBadges_User FOREIGN KEY (UserID) REFERENCES Users(ID),
    CONSTRAINT FK_UserBadges_Badge FOREIGN KEY (BadgeID) REFERENCES Badges(ID)
);

-- Thêm Data mẫu cho Badges
INSERT INTO Badges (Name, Icon, Description, Color) VALUES 
('Rising Star', '⭐', 'First 100 likes', '#FFD700'),
('Recipe Master', '👨‍🍳', '10 published recipes', '#FF8C42'),
('Community Favorite', '❤️', '1000+ total likes', '#EF4444');

-- (Tuỳ chọn) Bảng lưu công thức (Saved/Bookmarked Recipes)
CREATE TABLE SavedRecipes (
    UserID INT NOT NULL,
    RecipeID INT NOT NULL,
    SavedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    PRIMARY KEY (UserID, RecipeID),
    CONSTRAINT FK_Saved_User FOREIGN KEY (UserID) REFERENCES Users(ID),
    CONSTRAINT FK_Saved_Recipe FOREIGN KEY (RecipeID) REFERENCES Recipes(ID) ON DELETE CASCADE
);

-- Thêm cột lưu chữ ký số vào bảng Recipes
ALTER TABLE Recipes 

CREATE TABLE Notifications (
    ID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,           -- Người nhận thông báo (Tác giả món ăn)
    SenderID INT NOT NULL,         -- Người thực hiện hành động (Người thả tim/comment)
    Type NVARCHAR(50),             -- Loại: 'LIKE', 'COMMENT', 'RATING'
    RecipeID INT NULL,             -- Món ăn liên quan
    Message NVARCHAR(255),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    
    CONSTRAINT FK_Notif_User FOREIGN KEY (UserID) REFERENCES Users(ID),
    CONSTRAINT FK_Notif_Sender FOREIGN KEY (SenderID) REFERENCES Users(ID),
    CONSTRAINT FK_Notif_Recipe FOREIGN KEY (RecipeID) REFERENCES Recipes(ID) ON DELETE CASCADE
);
ADD DigitalSignature NVARCHAR(MAX) NULL;
-- 9. DỮ LIỆU MẪU CHO ROLE
INSERT INTO Roles (RoleName, Description) VALUES 
('Admin', 'Toàn quyền hệ thống'),
('Moderator', 'Kiểm duyệt nội dung'),
('User', 'Người dùng thông thường'),
('KOL', 'Đầu bếp nổi tiếng/Đã xác minh');