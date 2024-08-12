import { Outlet, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";
import RegisterPage from "./pages/RegisterPage";
import InstructionsPage from "./pages/InstructionsPage";
import MyProfile from "./pages/MyProfile";
import MainLayout from "./context/MainLayout";
import FavoritesPage from "./pages/FavoritesPage";
import ShelterDetailsDrawer from "./components/costum/ShelterDetailsDrawer";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="map" element={<MapPage />}>
            <Route path=":id" element={<ShelterDetailsDrawer />} />
          </Route>
          <Route path="instructions" element={<InstructionsPage />} />
          <Route path="myProfile" element={<MyProfile />} />
          <Route path="favourites" element={<FavoritesPage />} />
        </Route>
        <Route path="/" element={<Outlet />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
