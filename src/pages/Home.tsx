import { Button } from "../components/ui/new-button";

const HomePage = () => {
  return (
    <div className="w-full h-screen flex flex-col md:flex-row">
      <div className="flex-1 h-1/2 md:h-full bg-white flex items-center justify-center">
        <Button
          asLink
          to="/login"
          className="bg-primary-blue text-white min-w-[300px]"
        >
          Login
        </Button>
      </div>
      {/* <div className="flex-1 h-1/2 md:h-full flex items-center justify-center">
        <Button
          asLink
          to="/register"
          className="bg-black min-w-[300px] text-white"
        >
          Register
        </Button>
      </div> */}
    </div>
  );
};

export default HomePage;
