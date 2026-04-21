import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages: Core & Auth
import HomePage from './pages/core/HomePage';
import NotFound from './pages/core/NotFound';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Pages: Recipe
import RecipeDetailsPage from './pages/recipe/RecipeDetailsPage';
import CreateRecipePage from './pages/recipe/CreateRecipePage';
import CookingModePage from './pages/recipe/CookingModePage';
import FridgeCreativesPage from './pages/recipe/FridgeCreativesPage';

// Pages: Admin
import AdminDashboardPage from './pages/admin/AdminDashBoardPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import ModerationPage from './pages/admin/ModerationPage';
import UserManagementPage from './pages/admin/UserManagementPage'; // <-- ĐÃ THÊM IMPORT

// Pages: User
import ProfilePage from './pages/user/ProfilePage';
import SessionManagementPage from './pages/user/SessionManagementPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES (No Layout) --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* --- PROTECTED/PRIVATE ROUTES (With Layout) --- */}
      <Route element={<UserLayout />}>
        {/* Core */}
        <Route path="/" element={<HomePage />} />
        
        {/* Recipes */}
        <Route path="/recipe/:recipeId" element={<RecipeDetailsPage />} />
        <Route path="/create" element={<CreateRecipePage />} />
        <Route path="/cooking-mode/:recipeId" element={<CookingModePage />} />
        <Route path="/fridge-creatives" element={<FridgeCreativesPage />} /> 

        {/* User */}
        <Route path="user/profile/:userId" element={<ProfilePage />} />
        {/* Settings */}
        <Route path="user/settings/sessions" element={<SessionManagementPage />} />

        {/* Admin Section */}
        <Route path="/admin">
          <Route index element={<AdminDashboardPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="moderation" element={<ModerationPage />} />
        </Route>
      </Route>

      {/* --- PROTECTED/PRIVATE ROUTES (With Layout-v2) --- */}
      <Route element={<AdminLayout />}>
        {/* Admin Section */}
        <Route path="/admin">
          <Route index element={<AdminDashboardPage />} />
          <Route path="logs" element={<AuditLogsPage />} />
          <Route path="moderation" element={<ModerationPage />} />
          <Route path="users" element={<UserManagementPage />} /> {/* <-- ĐÃ THÊM ROUTE */}
        </Route>
      </Route>

      {/* --- ERROR ROUTES --- */}
      <Route path="/error404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/error404" replace />} />
    </Routes>
  );
};

export default AppRoutes;