import { Route, Routes, BrowserRouter } from "react-router-dom";
import Hero from "./pages/Hero";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Hero />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
