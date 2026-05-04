# 🍳 SmartCook - The Intelligent Social Cooking Network

![GitHub repo size](https://img.shields.io/github/repo-size/yourusername/smartcook)
![License](https://img.shields.io/badge/license-MIT-green)
![Tech Stack](https://img.shields.io/badge/stack-React--Node--MSSQL-orange)

**SmartCook** không chỉ là một ứng dụng lưu trữ công thức nấu ăn; đây là một hệ sinh thái mạng xã hội thông minh, nơi tích hợp AI để tối ưu hóa trải nghiệm vào bếp và hệ thống bảo mật đa lớp cấp độ doanh nghiệp.

---

## 🚀 Tính năng đột phá (Core Modules)

### 🛡️ 1. Module Xác thực & Bảo mật (Security Core)
* **Hybrid Auth:** Hỗ trợ đăng nhập truyền thống kết hợp Google OAuth2.
* **JWT Advanced:** Cơ chế Access Token (ngắn hạn) & Refresh Token (HttpOnly Cookie) chống tấn công XSS/CSRF.
* **Xác thực đa lớp (2FA):** Bảo mật tuyệt đối với mã OTP qua ứng dụng Google Authenticator.
* **Quản lý phiên bản:** Giám sát thiết bị đang đăng nhập và cho phép "Đăng xuất từ xa" (tương tự Facebook).
* **Chữ ký số (PKI):** Cơ chế xác minh danh tính cho KOLs, chống giả mạo bài đăng bài viết chuyên gia.

### 📱 2. Tương tác Mạng Xã Hội (Social Features)
* **Smart News Feed:** Thuật toán ưu tiên hiển thị bài viết từ người theo dõi và các nội dung đang Trending.
* **Real-time Notification:** Sử dụng WebSockets (Socket.io) để báo ngay lập tức khi có tương tác (Like, Comment, Follow).
* **Recipe Remix (Fork):** Tính năng lấy cảm hứng từ GitHub. Người dùng có thể "biến tấu" công thức từ người khác, hệ thống sẽ tự động ghi chú nguồn gốc ("Biến tấu từ @UserB").
* **Hồ sơ & Huy hiệu:** Hệ thống Gamification vinh danh người dùng qua các danh hiệu (Rising Star, Master Chef).

### 🤖 3. Trí tuệ Nhân tạo (AI Features)
* **Sáng tạo từ tủ lạnh:** Nhập nguyên liệu sẵn có, AI sẽ tự động đề xuất công thức hoàn chỉnh.
* **Sous Chef AI (Bếp phó):** Chatbot tích hợp trong từng công thức để giải đáp thắc mắc (VD: "Thay nước tương bằng gì?").
* **Ước tính Dinh dưỡng:** Tự động phân tích Calo, Protein, Fat từ danh sách nguyên liệu.
* **AI Writing Assistant:** Trợ lý viết dàn ý và tối ưu nội dung công thức cho người sáng tạo.

### 👨‍🍳 4. Chế độ Nấu ăn (Cooking Mode - UX/UI)
* **Interactive Guide:** Giao diện phóng to từng bước, hỗ trợ tập trung tối đa.
* **Wake Lock API:** Giữ màn hình thiết bị luôn sáng trong suốt quá trình nấu, tránh việc phải chạm tay vào điện thoại khi đang chuẩn bị thực phẩm.

### 📊 5. Quản trị viên (Admin Panel)
* **RBAC Control:** Quản lý phân quyền chuyên sâu (Admin/Moderator/User) và khóa tài khoản vi phạm.
* **Nhật ký Hệ thống (Audit Logs):** Ghi lại mọi hành động nhạy cảm để đảm bảo tính minh bạch và bảo mật.
* **Dashboard Thống kê:** Biểu đồ trực quan về lượng người dùng và xu hướng món ăn theo tháng.

---

## 🏗️ Kiến trúc thư mục (Project Structure)

```text
smartcook/
├── 📁 smartcook-backend
│   ├── 📁 config
│   │   └── 📄 db.js
│   ├── 📁 controllers
│   │   ├── 📁 admin
│   │   │   ├── 📄 audit.controller.js
│   │   │   ├── 📄 dashboard.controller.js
│   │   │   ├── 📄 moderation.controller.js
│   │   │   └── 📄 user.controller.js
│   │   ├── 📄 authController.js
│   │   ├── 📄 interactionController.js
│   │   ├── 📄 recipeController.js
│   │   └── 📄 userController.js
│   ├── 📁 middleware
│   │   ├── 📄 auth.middleware.js
│   │   └── 📄 validation.middleware.js
│   ├── 📁 routes
│   │   ├── 📄 adminRoutes.js
│   │   ├── 📄 authRoutes.js
│   │   ├── 📄 interactionRoutes.js
│   │   ├── 📄 recipeRoutes.js
│   │   └── 📄 userRoutes.js
│   ├── 📁 services
│   │   └── 📄 socket.service.js
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   └── 📄 server.js
├── 📁 smartcook-frontend
│   ├── 📁 .vite
│   │   └── 📁 deps
│   │       ├── ⚙️ _metadata.json
│   │       ├── 📄 chunk-H52QBHD2.js
│   │       ├── 📄 chunk-HAXK4ZEP.js
│   │       ├── 📄 chunk-HEFH33VQ.js
│   │       ├── 📄 lucide-react.js
│   │       ├── ⚙️ package.json
│   │       ├── 📄 react-dom_client.js
│   │       ├── 📄 react-router-dom.js
│   │       ├── 📄 react-router.js
│   │       ├── 📄 react.js
│   │       └── 📄 recharts.js
│   ├── 📁 public
│   │   ├── 🖼️ favicon.svg
│   │   └── 🖼️ icons.svg
│   ├── 📁 src
│   │   ├── 📁 api
│   │   │   ├── 📄 adminApi.ts
│   │   │   ├── 📄 authApi.ts
│   │   │   ├── 📄 axiosClient.ts
│   │   │   ├── 📄 interactionApi.ts
│   │   │   ├── 📄 publicApi.ts
│   │   │   └── 📄 recipeApi.ts
│   │   ├── 📁 assets
│   │   │   ├── 🖼️ hero.png
│   │   │   ├── 🖼️ react.svg
│   │   │   └── 🖼️ vite.svg
│   │   ├── 📁 components
│   │   │   ├── 📁 figma
│   │   │   │   └── 📄 ImageWithFallback.tsx
│   │   │   ├── 📁 ui
│   │   │   │   ├── 📄 accordion.tsx
│   │   │   │   ├── 📄 alert-dialog.tsx
│   │   │   │   ├── 📄 alert.tsx
│   │   │   │   ├── 📄 aspect-ratio.tsx
│   │   │   │   ├── 📄 avatar.tsx
│   │   │   │   ├── 📄 badge.tsx
│   │   │   │   ├── 📄 breadcrumb.tsx
│   │   │   │   ├── 📄 button.tsx
│   │   │   │   ├── 📄 calendar.tsx
│   │   │   │   ├── 📄 card.tsx
│   │   │   │   ├── 📄 carousel.tsx
│   │   │   │   ├── 📄 chart.tsx
│   │   │   │   ├── 📄 checkbox.tsx
│   │   │   │   ├── 📄 collapsible.tsx
│   │   │   │   ├── 📄 command.tsx
│   │   │   │   ├── 📄 context-menu.tsx
│   │   │   │   ├── 📄 dialog.tsx
│   │   │   │   ├── 📄 drawer.tsx
│   │   │   │   ├── 📄 dropdown-menu.tsx
│   │   │   │   ├── 📄 form.tsx
│   │   │   │   ├── 📄 hover-card.tsx
│   │   │   │   ├── 📄 input-otp.tsx
│   │   │   │   ├── 📄 input.tsx
│   │   │   │   ├── 📄 label.tsx
│   │   │   │   ├── 📄 menubar.tsx
│   │   │   │   ├── 📄 navigation-menu.tsx
│   │   │   │   ├── 📄 pagination.tsx
│   │   │   │   ├── 📄 popover.tsx
│   │   │   │   ├── 📄 progress.tsx
│   │   │   │   ├── 📄 radio-group.tsx
│   │   │   │   ├── 📄 resizable.tsx
│   │   │   │   ├── 📄 scroll-area.tsx
│   │   │   │   ├── 📄 select.tsx
│   │   │   │   ├── 📄 separator.tsx
│   │   │   │   ├── 📄 sheet.tsx
│   │   │   │   ├── 📄 sidebar.tsx
│   │   │   │   ├── 📄 skeleton.tsx
│   │   │   │   ├── 📄 slider.tsx
│   │   │   │   ├── 📄 sonner.tsx
│   │   │   │   ├── 📄 switch.tsx
│   │   │   │   ├── 📄 table.tsx
│   │   │   │   ├── 📄 tabs.tsx
│   │   │   │   ├── 📄 textarea.tsx
│   │   │   │   ├── 📄 toggle-group.tsx
│   │   │   │   ├── 📄 toggle.tsx
│   │   │   │   ├── 📄 tooltip.tsx
│   │   │   │   ├── 📄 use-mobile.ts
│   │   │   │   └── 📄 utils.ts
│   │   │   ├── 📄 RecipeCard.tsx
│   │   │   └── 📄 TrendingKeywords.tsx
│   │   ├── 📁 hooks
│   │   │   ├── 📄 useSocket.ts
│   │   │   └── 📄 useUserManagement.ts
│   │   ├── 📁 layouts
│   │   │   ├── 📄 AvatarDropdown.tsx
│   │   │   ├── 📄 Footer.tsx
│   │   │   ├── 📄 Header.tsx
│   │   │   ├── 📄 Layout.tsx
│   │   │   ├── 📄 UserLayout.tsx
│   │   │   └── 📄 UserSidebar.tsx
│   │   ├── 📁 pages
│   │   │   ├── 📁 admin
│   │   │   │   ├── 📁 UserManagement
│   │   │   │   │   └── 📄 UserManagementPage.tsx
│   │   │   │   ├── 📄 AdminDashBoardPage.tsx
│   │   │   │   ├── 📄 AuditLogsPage.tsx
│   │   │   │   └── 📄 ModerationPage.tsx
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📄 LoginPage.tsx
│   │   │   │   └── 📄 RegisterPage.tsx
│   │   │   ├── 📁 core
│   │   │   │   ├── 📄 HomePage.tsx
│   │   │   │   └── 📄 NotFound.tsx
│   │   │   ├── 📁 recipe
│   │   │   │   ├── 📄 CookingModePage.tsx
│   │   │   │   ├── 📄 CreateRecipePage.tsx
│   │   │   │   ├── 📄 FridgeCreativesPage.tsx
│   │   │   │   └── 📄 RecipeDetailsPage.tsx
│   │   │   └── 📁 user
│   │   │       ├── 📄 ProfilePage.tsx
│   │   │       └── 📄 SessionManagementPage.tsx
│   │   ├── 📁 styles
│   │   │   ├── 🎨 fonts.css
│   │   │   ├── 🎨 index.css
│   │   │   ├── 🎨 tailwind.css
│   │   │   └── 🎨 theme.css
│   │   ├── 📁 types
│   │   │   ├── 📄 admin.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 recipe.ts
│   │   │   └── 📄 user.ts
│   │   ├── 📁 utils
│   │   │   ├── 📁 supabase
│   │   │   │   └── 📄 info.tsx
│   │   │   └── 📄 pkiHelper.ts
│   │   ├── 🎨 App.css
│   │   ├── 📄 App.jsx
│   │   ├── 🎨 index.css
│   │   ├── 📄 main.jsx
│   │   ├── 📄 routes.tsx
│   │   └── 📄 socket.ts
│   ├── ⚙️ .gitignore
│   ├── 📝 README.md
│   ├── 📄 eslint.config.js
│   ├── 🌐 index.html
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   ├── 📄 postcss.config.js
│   └── 📄 vite.config.js
├── ⚙️ .gitignore
├── 📕 ERP_sql.pdf
├── 📄 SmartCook.sql
├── ⚙️ docker-compose.yml
├── ⚙️ package-lock.json
