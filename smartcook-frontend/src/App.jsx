import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProfilePage from './pages/ProfilePage'; 
import AdminDashBoardPage from './pages/AdminDashBoardPage';
import ModerationPage from './pages/ModerationPage';
import AuditLogsPage from './pages/AuditLogsPage';
import Layout from "./components/Layout";
import RecipePage from "./components/RecipeCard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          <Route index element={<HomePage />} />
          <Route path="recipe/:id" element={<RecipePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:id" element={<ProfilePage />} />

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