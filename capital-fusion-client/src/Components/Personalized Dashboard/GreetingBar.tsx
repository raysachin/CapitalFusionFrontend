import { FC, useEffect, useState } from "react";

const GreetingBar: FC = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) setUsername(username);
  }, []);

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold">
        Greetings, <small className="text-gray">{username.toUpperCase()}</small>!
      </h2>
    </div>
  );
};

export default GreetingBar;
