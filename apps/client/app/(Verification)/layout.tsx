import React from "react";
import Appbar from "../../components/Appbar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Appbar />
      {children}
    </div>
  );
};

export default layout;
