import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";

function App() {
  return (
    <BrowserRouter>
      {/* Bạn có thể thêm các Provider khác ở đây trong tương lai */}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;