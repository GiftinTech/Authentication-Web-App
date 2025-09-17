import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col items-center justify-center gap-4 pt-10">
      <div>
        <h1>Welcome to Authentication App</h1>
      </div>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/signup')}
          className="cursor-pointer hover:font-bold"
        >
          Sign up
        </button>
        <button
          onClick={() => navigate('/login')}
          className="cursor-pointer hover:font-bold"
        >
          Login
        </button>
      </div>
    </section>
  );
};

export default WelcomePage;
