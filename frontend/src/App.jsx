import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { AuthProvider } from "./context/auth/AuthProvider";
import { ThemeProvider } from "./context/theme/ThemeProvider";
import { useTheme } from "./hooks/useTheme";

import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import CirclePage from "./pages/CirclePage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import GuestRoute from "./components/routes/GuestRoute";

function MantineThemeBridge({ children }) {
  const { theme } = useTheme();

  return (
    <MantineProvider forceColorScheme={theme}>
      {children}
      <Notifications position="bottom-center" zIndex={10000} />
    </MantineProvider>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId="44150673484-mkq892u7cn1jpsv7kpb5abn60knfeogf.apps.googleusercontent.com">
      <BrowserRouter>
        <ThemeProvider>
          <MantineThemeBridge>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  {/* Root redirect */}
                  <Route index element={<Navigate to="/login" replace />} />

                  {/* Guest routes */}
                  <Route element={<GuestRoute />}>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                  </Route>

                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="circles/:id" element={<CirclePage />} />
                  </Route>

                  {/* Not found routes */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </AuthProvider>
          </MantineThemeBridge>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
