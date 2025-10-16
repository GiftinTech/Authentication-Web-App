import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc'; // For Google icon
import { FaGithub } from 'react-icons/fa'; // For GitHub icon
import type React from 'react';

const tangiro = '../images/demon-slayer-3840x2160-23247.jpg';

const SignupPage = () => {
  const navigate = useNavigate();

  const handleGoogleSignup = () => {
    // Implement Google signup logic here
    console.log('Signing up with Google...');
  };

  const handleGithubSignup = () => {
    // Implement GitHub signup logic here
    console.log('Signing up with GitHub...');
  };

  const handleEmailSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement email/password signup logic here
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
      passwordConfirm: { value: string };
    };

    const email = target.email.value;
    const password = target.password.value;
    const passwordConfirm = target.passwordConfirm.value;

    console.log('Signing up with email:', { email, password, passwordConfirm });
    // Add validation and API call here
  };

  return (
    <div className="relative mx-auto min-h-screen max-w-5xl md:rounded-2xl lg:flex lg:items-center lg:overflow-hidden lg:rounded-2xl">
      {/* Background Image Container */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center lg:static lg:h-full lg:w-1/2 lg:bg-contain lg:bg-center lg:bg-no-repeat"
        style={{ backgroundImage: `url(${tangiro})` }}
      >
        {/* Dark Overlay (only for mobile) */}
        <div className="absolute inset-0 bg-black opacity-70 lg:hidden"></div>
      </div>

      {/* Signup Form Container */}
      <section className="lg:bg-opacity-50 relative z-10 flex min-h-screen flex-col justify-center pt-10 text-white lg:h-full lg:w-1/2 lg:bg-gray-800 lg:p-10">
        <div className="absolute top-2 left-2 text-3xl lg:relative lg:top-0 lg:left-0 lg:mb-4 lg:text-center">
          Anims
        </div>
        <div className="hidden lg:block lg:text-left">
          <h1 className="px-4 text-4xl font-bold sm:mb-0 lg:px-0 lg:text-5xl">
            Join Us.
          </h1>
        </div>
        <div className="absolute right-0 bottom-0 w-full rounded-tr-[150px] bg-white px-8 py-10 md:h-[42%] md:rounded-tr-[250px] md:pt-15 lg:static lg:rounded-tr-none lg:p-10 lg:text-left">
          <div>
            <h1 className="text-2xl font-bold text-black md:text-4xl lg:text-4xl">
              Welcome.
            </h1>
          </div>
          <form
            onSubmit={handleEmailSignup}
            className="mt-6 flex flex-col gap-4"
          >
            {/* Social Sign-up Buttons */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-lg font-bold text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-50"
            >
              <FcGoogle className="text-2xl" /> Sign up with Google
            </button>
            <button
              type="button"
              onClick={handleGithubSignup}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-lg font-bold text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-50"
            >
              <FaGithub className="text-2xl" /> Sign up with GitHub
            </button>

            {/* OR Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="h-px w-full bg-gray-300"></div>
              <span className="absolute bg-white px-3 text-sm text-gray-500">
                or
              </span>
              <div className="h-px w-full bg-gray-300"></div>
            </div>

            {/* Email/Password Fields */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="rounded-md border border-gray-300 p-3 text-black focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="rounded-md border border-gray-300 p-3 text-black focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="password"
              name="passwordConfirm"
              placeholder="Confirm Password"
              required
              className="rounded-md border border-gray-300 p-3 text-black focus:border-blue-500 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="cursor-pointer rounded-full border bg-black px-4 py-2 text-lg font-bold text-white transition-all duration-300 sm:py-4 sm:text-[20px] lg:py-2 lg:text-lg"
            >
              Sign up
            </button>
          </form>

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
      </section>
    </div>
  );
};

export default SignupPage;
