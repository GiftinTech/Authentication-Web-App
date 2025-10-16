import { useNavigate } from 'react-router-dom';

const tangiro = '../images/demon-slayer-3840x2160-23247.jpg';

const WelcomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="relative mx-auto min-h-screen max-w-5xl lg:flex lg:items-center lg:overflow-hidden lg:rounded-2xl">
      {/* Background Image Container */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center lg:static lg:h-full lg:w-1/2 lg:bg-contain lg:bg-center lg:bg-no-repeat"
        style={{ backgroundImage: `url(${tangiro})` }}
      >
        {/* Dark Overlay (only for mobile) */}
        <div className="absolute inset-0 bg-black opacity-70 lg:hidden"></div>
      </div>

      {/* Content Container */}
      <section className="lg:bg-opacity-50 relative z-10 flex min-h-screen flex-col justify-center pt-10 text-white lg:h-full lg:w-1/2 lg:bg-gray-800 lg:p-10">
        <div className="absolute top-2 left-2 text-3xl lg:relative lg:top-0 lg:left-0 lg:mb-4 lg:text-center">
          Anims
        </div>
        <div className="lg:text-left">
          <h1 className="welcome-font mb-20 px-3 text-4xl lg:px-0">
            Experience the best anime collection
          </h1>
        </div>
        <div className="absolute right-0 bottom-0 w-full rounded-tr-[150px] bg-white p-10 md:h-[42%] md:rounded-tr-[250px] md:pt-15 lg:static lg:rounded-tr-none lg:text-left">
          <div>
            <h1 className="text-2xl font-bold text-black md:text-4xl">
              Explore.
            </h1>
            <p className="mt-4 mb-8 text-sm text-gray-700 md:text-[20px]">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. autem
              natus inventore.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="cursor-pointer rounded-full border bg-black px-4 py-2 text-lg font-bold text-white transition-all duration-300 sm:py-4 sm:text-[20px]"
            >
              Sign up
            </button>
            <div className="mt-6 mb-4 flex flex-col items-center">
              <span className="text-black">Already have an account?</span>
              <button
                onClick={() => navigate('/login')}
                className="cursor-pointer text-lg font-bold text-blue-500 underline-offset-2 transition-all duration-300 hover:underline"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WelcomePage;
