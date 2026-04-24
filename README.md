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
├── 📁 smartcook-backend      # Node.js, Express, MSSQL, Socket.io
│   ├── 📁 config             # Cấu hình Database & Security
│   ├── 📁 controllers        # Logic xử lý Admin, Auth, Recipes
│   ├── 📁 middleware         # JWT, RBAC, 2FA Validation
│   └── 📁 routes             # API Endpoints
├── 📁 smartcook-frontend     # React, Vite, TypeScript, Tailwind CSS
│   ├── 📁 src/api            # Axios Client & API Services
│   ├── 📁 src/components/ui  # Hệ thống UI Reusable (Shadcn)
│   ├── 📁 src/pages/admin    # Quản trị viên & Dashboard
│   ├── 📁 src/pages/auth     # Đăng nhập/Đăng ký/2FA
│   └── 📁 src/utils          # PKI Helpers, Socket Client
└── 📄 SmartCook.sql          # Toàn bộ cấu trúc Database & Procedures
