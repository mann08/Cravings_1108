import { Link } from "react-router-dom";
import logo from "../images/craveing logo.png";

function Header() {
  return (
    <header className=" h-15 flex items-center justify-between px-10 py-4 shadow-md bg-orange-700">
      <Link to="/">
        <img
          src={logo}
          alt="Craving"
          className="h-12 w-auto object-contain cursor-pointer"
        />
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/login" className="text-white font-medium">
          Login
        </Link>

        <Link
          to="/register"
          className="bg-white text-orange-600 px-5 py-2 rounded-lg"
        >
          Register
        </Link>
      </div>
    </header>
  );
}

export default Header;
