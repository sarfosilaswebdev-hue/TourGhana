import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Destinations } from "./pages/Destinations";
import { DestinationForm } from "./pages/DestinationForm";
import { Bookings } from "./pages/Bookings";
import { Users } from "./pages/Users";
import { Reviews } from "./pages/Reviews";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/*"
            element={
              <div className="flex min-h-screen bg-bg">
                <Sidebar />
                <div className="flex-1 ml-60 flex flex-col min-h-screen">
                  <TopBar />
                  <main className="flex-1 p-6">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/destinations" element={<Destinations />} />
                      <Route path="/destinations/new" element={<DestinationForm />} />
                      <Route path="/destinations/:id/edit" element={<DestinationForm />} />
                      <Route path="/bookings" element={<Bookings />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/reviews" element={<Reviews />} />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
