import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
const Settings = () => {
    const { user } = useAuth();

    const [isEditable, setIsEditable] = useState(false)

    const handleSave = () => {
      setIsEditable(false)
    }
  return (
    <>
      
      <div className="w-24 h-24 rounded-full overflow-hidden">
        <img src={user.photo} alt="" className="w-full h-full object-cover" />
      </div>
      <div>
        <div>
          user.fullName
        </div>
        <div>
          user.email
        </div>
        <div>
          user.phone
        </div>
      </div>
      {/* {
        isEditable === true ? (
       <>
        <button onClick={()=> setIsEditable(true) }className="border p-3">cancel</button>
 ):(
        <button onClick={()=> setIsEditable(true) }className="border p-3">edit</button>
      )} */}
    </>
  );
};

export default Settings;
