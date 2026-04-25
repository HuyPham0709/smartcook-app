// smartcook-backend/controllers/recipe.controller.js
const { sql, poolPromise } = require('../config/db'); // Giả định bạn setup mssql ở file db.js

exports.createRecipe = async (req, res) => {
    // 1. Nhận payload từ Frontend gửi lên
    const { 
        userId, title, description, thumbnailURL, 
        cookingTime, servings, difficulty, digitalSignature, 
        ingredients, steps 
    } = req.body;

    try {
        // Lấy connection pool
        const pool = await poolPromise;
        // Khởi tạo Transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 2. Insert vào bảng Recipes và lấy ra ID vừa tạo (OUTPUT INSERTED.ID)
            const requestRecipe = new sql.Request(transaction);
            const recipeResult = await requestRecipe
                .input('UserID', sql.Int, userId)
                .input('Title', sql.NVarChar, title)
                .input('Description', sql.NVarChar, description || '')
                .input('ThumbnailURL', sql.NVarChar, thumbnailURL || '')
                .input('CookingTime', sql.Int, cookingTime)
                .input('Servings', sql.Int, servings)
                .input('Difficulty', sql.NVarChar, difficulty)
                .input('DigitalSignature', sql.NVarChar, digitalSignature || '')
                .query(`
                    INSERT INTO Recipes (UserID, Title, Description, ThumbnailURL, CookingTime, Servings, Difficulty, DigitalSignature) 
                    OUTPUT INSERTED.ID 
                    VALUES (@UserID, @Title, @Description, @ThumbnailURL, @CookingTime, @Servings, @Difficulty, @DigitalSignature)
                `);

            const newRecipeId = recipeResult.recordset[0].ID;

            // 3. Insert mảng Ingredients
            if (ingredients && ingredients.length > 0) {
                for (let ing of ingredients) {
                    const requestIng = new sql.Request(transaction);
                    await requestIng
                        .input('RecipeID', sql.Int, newRecipeId)
                        .input('Name', sql.NVarChar, ing.name)
                        .input('Amount', sql.Float, ing.amount)
                        .input('Unit', sql.NVarChar, ing.unit || '')
                        .input('Note', sql.NVarChar, ing.note || '')
                        .query(`
                            INSERT INTO Ingredients (RecipeID, Name, Amount, Unit, Note) 
                            VALUES (@RecipeID, @Name, @Amount, @Unit, @Note)
                        `);
                }
            }

            // 4. Insert mảng RecipeSteps
            if (steps && steps.length > 0) {
                for (let step of steps) {
                    const requestStep = new sql.Request(transaction);
                    await requestStep
                        .input('RecipeID', sql.Int, newRecipeId)
                        .input('StepNumber', sql.Int, step.stepNumber)
                        .input('Content', sql.NVarChar, step.content)
                        .input('MediaURL', sql.NVarChar, step.mediaURL || null)
                        .query(`
                            INSERT INTO RecipeSteps (RecipeID, StepNumber, Content, MediaURL) 
                            VALUES (@RecipeID, @StepNumber, @Content, @MediaURL)
                        `);
                }
            }

            // 5. Nếu tất cả đều mượt mà -> Commit lưu thật vào DB
            await transaction.commit();
            res.status(201).json({ message: 'Tạo công thức thành công!', recipeId: newRecipeId });

        } catch (err) {
            // Có lỗi ở bất kỳ bước insert nào -> Rollback (Huỷ bỏ)
            await transaction.rollback();
            throw err; // Ném lỗi ra catch bên ngoài
        }

    } catch (error) {
        console.error('Lỗi khi lưu Database:', error);
        res.status(500).json({ message: 'Lỗi server khi lưu công thức', error: error.message });
    }
};
exports.getAllRecipes = async (req, res) => {
    try {
        const pool = await poolPromise;

        // Lấy page và limit từ query parameters, mặc định page 1, limit 6
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const offset = (page - 1) * limit;

        // 1. Lấy tổng số lượng công thức (Total Count)
        const countResult = await pool.request().query('SELECT COUNT(*) as Total FROM Recipes');
        const totalCount = countResult.recordset[0].Total;
        const totalPages = Math.ceil(totalCount / limit);

        // 2. Truy vấn danh sách có phân trang bằng OFFSET và FETCH NEXT (Chuẩn SQL Server)
        const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(`
                SELECT 
                    r.ID as id, 
                    r.Title as title, 
                    r.ThumbnailURL as image, 
                    r.CookingTime as prepTime,
                    u.FullName as authorName,
                    u.AvatarURL as authorAvatar,
                    u.RoleID as roleId
                FROM Recipes r
                LEFT JOIN Users u ON r.UserID = u.ID
                ORDER BY r.CreatedAt DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);

        const formattedRecipes = result.recordset.map(row => ({
            id: row.id,
            title: row.title,
            image: row.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
            prepTime: (row.prepTime || 0) + ' mins',
            author: {
                name: row.authorName || 'Đầu bếp ẩn danh',
                avatar: row.authorAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + row.id,
                isKOL: row.roleId === 4 
            },
            likes: 0, 
            comments: 0,
            remixes: 0
        }));

        // 3. Trả về format chuẩn phân trang
        res.status(200).json({
            data: formattedRecipes,
            totalCount,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách recipes:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu' });
    }
};
exports.getRecipeById = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const currentUserId = req.query.userId || 0; 
        
        const pool = await poolPromise;

        // 1. Lấy thông tin cơ bản của Recipe và Tác giả
        const recipeResult = await pool.request()
            .input('recipeId', sql.Int, recipeId)
            .query(`
                SELECT r.*, u.FullName as AuthorName, u.AvatarURL as AuthorAvatar, u.RoleID as AuthorRole
                FROM Recipes r
                LEFT JOIN Users u ON r.UserID = u.ID
                WHERE r.ID = @recipeId
            `);
            
        if (recipeResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy công thức!' });
        }
        const recipeInfo = recipeResult.recordset[0];

        // 2. Lấy danh sách nguyên liệu
        const ingredientsResult = await pool.request()
            .input('recipeId', sql.Int, recipeId)
            .query('SELECT * FROM Ingredients WHERE RecipeID = @recipeId');

        // 3. Lấy danh sách các bước nấu
        const stepsResult = await pool.request()
            .input('recipeId', sql.Int, recipeId)
            .query('SELECT * FROM RecipeSteps WHERE RecipeID = @recipeId ORDER BY StepNumber ASC');

        // 4. Lấy tổng số Like và xem currentUser đã like chưa
        const likesResult = await pool.request()
            .input('recipeId', sql.Int, recipeId)
            .input('userId', sql.Int, currentUserId)
            .query(`
                SELECT 
                    COUNT(*) as TotalLikes,
                    SUM(CASE WHEN UserID = @userId THEN 1 ELSE 0 END) as IsLikedByMe
                FROM Likes
                WHERE RecipeID = @recipeId
            `);
        const likesCount = likesResult.recordset[0].TotalLikes || 0;
        const isLiked = likesResult.recordset[0].IsLikedByMe > 0;

        // 5. Lấy số sao (Rating) của User hiện tại đã đánh giá
        const ratingResult = await pool.request()
            .input('recipeId', sql.Int, recipeId)
            .input('userId', sql.Int, currentUserId)
            .query(`SELECT Score FROM Ratings WHERE RecipeID = @recipeId AND UserID = @userId`);
        const userRating = ratingResult.recordset.length > 0 ? ratingResult.recordset[0].Score : 0;

        // 6. Lấy danh sách Comments (Join với Ratings để lấy số sao của từng người)
        const commentsResult = await pool.request()
            .input('recipeId', sql.Int, recipeId)
            .query(`
                SELECT 
                    c.ID, c.Content, c.CreatedAt,
                    u.FullName, u.AvatarURL,
                    COALESCE(r.Score, 5) as UserScore 
                FROM Comments c
                JOIN Users u ON c.UserID = u.ID
                LEFT JOIN Ratings r ON r.RecipeID = c.RecipeID AND r.UserID = c.UserID
                WHERE c.RecipeID = @recipeId
                ORDER BY c.CreatedAt DESC
            `);

        const formattedComments = commentsResult.recordset.map(c => ({
            id: c.ID,
            user: c.FullName || 'Người dùng',
            avatar: c.AvatarURL || 'https://ui-avatars.com/api/?name=User',
            content: c.Content,
            rating: c.UserScore,
            time: new Date(c.CreatedAt).toLocaleString('vi-VN') 
        }));

        // 7. FORMAT LẠI TOÀN BỘ CHUẨN ĐỂ TRẢ VỀ FRONTEND
        res.json({
            id: recipeInfo.ID,
            title: recipeInfo.Title,
            description: recipeInfo.Description,
            image: recipeInfo.ThumbnailURL || 'https://images.unsplash.com/photo-1585407698236-7a78cdb68dec?w=1080',
            prepTime: recipeInfo.CookingTime ? `${recipeInfo.CookingTime} mins` : 'N/A',
            servings: recipeInfo.Servings || 1,
            difficulty: recipeInfo.Difficulty || 'Easy',
            author: {
                name: recipeInfo.AuthorName || 'Đầu bếp ẩn danh',
                avatar: recipeInfo.AuthorAvatar || 'https://ui-avatars.com/api/?name=User',
                isKOL: recipeInfo.AuthorRole === 4 
            },
            nutrition: {
                calories: recipeInfo.Calories || 0,
                protein: `${recipeInfo.Protein || 0}g`,
                carbs: `${recipeInfo.Carbs || 0}g`,
                fat: `${recipeInfo.Fat || 0}g`
            },
            ingredients: ingredientsResult.recordset.map(ing => ({
                id: ing.ID,
                item: `${ing.Amount || ''} ${ing.Unit || ''} ${ing.Name || ''} ${ing.Note ? `(${ing.Note})` : ''}`.trim()
            })),
            steps: stepsResult.recordset.map(step => ({
                id: step.StepNumber,
                instruction: step.Content,
                image: step.MediaURL
            })),
            likesCount,
            isLiked,
            userRating,
            comments: formattedComments
        });

    } catch (error) {
        console.error("Lỗi getRecipeById:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};