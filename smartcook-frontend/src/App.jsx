import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 1. Import các component dùng chung và trang Public
import Layout from "./layouts/Layout";
import RecipePage from "./components/RecipeCard";
import HomePage from "./pages/public/HomePage";
import ProfilePage from "./pages/public/ProfilePage";

// 2. Import các trang Admin (Chỉ một lần duy nhất)
import AdminDashBoardPage from "./pages/admin/AdminDashBoardPage";
import ModerationPage from "./pages/admin/ModerationPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          {/* CÁC TRANG PUBLIC */}
          <Route index element={<HomePage />} />
          <Route path="recipe/:id" element={<RecipePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:id" element={<ProfilePage />} />

          {/* CÁC TRANG ADMIN */}
          <Route path="admin">
            <Route index element={<AdminDashBoardPage />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;