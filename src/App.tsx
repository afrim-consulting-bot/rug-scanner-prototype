import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ScanPage } from "./pages/ScanPage";
import { ReportPage } from "./pages/ReportPage";
import { SharedReportPage } from "./pages/SharedReportPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ScanPage />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/r/:shareId" element={<SharedReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
