import { Route, Routes } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import ProfilePage from './pages/ProfilePage';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/me" element={<ProfilePage />} />
      </Routes>
    </>
  );
};

export default App;
