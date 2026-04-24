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
        const result = await pool.request().query(`
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

        res.status(200).json(formattedRecipes);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách recipes:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu' });
    }
};