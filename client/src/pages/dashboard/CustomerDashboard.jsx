import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/customerDashboard/Sidebar";
import Overview from "../../components/customerDashboard/Overview";
import Orders from "../../components/customerDashboard/Orders";
import Settings from "../../components/customerDashboard/Settings";
import WishList from "../../components/customerDashboard/WishList";

const UserDashboard = () => {
  const [active, setActive] = useState("Overview");

  return (
    <>
      <div className=" flex h-[92vh] ">
        <div className="w-1/6 border border-red-500 h-full p-3">
          <Sidebar active={active} setActive={setActive} />
        </div>
        <div className="w-5/6 border border-green-500 h-full">
          {active === "Overview" && <Overview />}
          {active === "Orders" && <Orders />}
          {active === "WishList" && <WishList />}
          {active === "Settings" && <Settings />}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
