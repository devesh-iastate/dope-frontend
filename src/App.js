import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "./contexts/user.context";
import Home from "./pages/Home.page";
import Login from "./pages/Login.page";
import PrivateRoute from "./pages/PrivateRoute.page";
import ResetPassword from './pages/ResetPassword';
import {Footer, Header} from "./dialogs/HeaderFooter";
import AdminPage from "./pages/Admin.page";

function App() {
  return (
      <BrowserRouter>
        <Header />
        {/* We are wrapping our whole app with UserProvider so that */}
        {/* our user is accessible through out the app from any page*/}
        <UserProvider>
          <Routes>
              <Route exact path="/login" element={<Login />} />
            {/* We are protecting our Home Page from unauthenticated */}
            {/* users by wrapping it with PrivateRoute here. */}
            <Route element={<PrivateRoute />}>
              <Route exact path="/" element={<Home />} />
            </Route>
              <Route path="/resetPassword" element={<ResetPassword />} />
              <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </UserProvider>
        <Footer />
      </BrowserRouter>
  );
}

export default App;