import { useNavigate } from 'react-router-dom';

const tangiro = '../images/demon-slayer-3840x2160-23247.jpg';

const ProfilePage = () => {
  const navigate = useNavigate();

  // Dummy user data - In a real app, this would come from your auth state
  const user = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    profilePic: 'https://via.placeholder.com/150', // Placeholder image URL
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log('User logged out.');
    navigate('/'); // Redirect to the welcome page after logout
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

      {/* Profile Content Container */}
      <section className="lg:bg-opacity-50 relative z-10 flex min-h-screen flex-col justify-center pt-10 text-white lg:h-full lg:w-1/2 lg:bg-gray-800 lg:p-10">
        <div className="absolute top-2 left-2 text-3xl lg:relative lg:top-0 lg:left-0 lg:mb-4 lg:text-center">
          Anims
        </div>
        <div className="hidden lg:block lg:text-left">
          <h1 className="px-4 text-4xl font-bold sm:mb-0 lg:px-0 lg:text-5xl">
            Your Profile.
          </h1>
        </div>
        <div className="absolute right-0 bottom-0 w-full rounded-tr-[150px] bg-white p-10 md:h-[42%] md:rounded-tr-[250px] md:pt-15 lg:static lg:rounded-tr-none lg:p-10 lg:text-left">
          <div className="flex flex-col items-center text-center">
            {/* Profile Picture */}
            <img
              src={user.profilePic}
              alt="User profile"
              className="mb-6 h-24 w-24 rounded-full border-4 border-gray-300 object-cover"
            />

            {/* User Name */}
            <h1 className="text-3xl font-bold text-black">{user.name}</h1>

            {/* User Email */}
            <p className="text-md mt-2 text-gray-700">{user.email}</p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="cursor-pointer rounded-full border border-black bg-white px-6 py-2 text-lg font-bold text-black transition-all duration-300 hover:bg-black hover:text-white"
            >
              Logout
            </button>
            <button
              onClick={() => navigate('/')}
              className="cursor-pointer text-lg font-bold text-blue-500 underline-offset-2 transition-all duration-300 hover:underline"
            >
              Go to Home
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
