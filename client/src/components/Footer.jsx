import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3">
        <div className="space-y-4">
          <p className="text-2xl font-bold text-white">Cravings</p>
          <p className="text-sm leading-7 text-slate-400 max-w-md">
            Delivering quality meals from the best restaurants in your city. Browse menus freely and login when you're ready to order.
          </p>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold mb-4">Quick links</p>
          <div className="flex flex-col gap-3 text-sm text-slate-300">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/register" className="hover:text-white transition-colors">
              Register
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold mb-4">Contact</p>
          <p className="text-sm text-slate-300">support@cravings.com</p>
          <p className="text-sm text-slate-300 mt-2">+91 12345 67890</p>
          <p className="text-sm text-slate-500 mt-4">Open hours: Mon - Sun, 8am - 10pm</p>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        © 2026 Cravings. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
