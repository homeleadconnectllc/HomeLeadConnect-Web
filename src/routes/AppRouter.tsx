import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./AppLayout";
import HomePage from "../pages/HomePage";
import ContactPage from "../pages/ContactPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
