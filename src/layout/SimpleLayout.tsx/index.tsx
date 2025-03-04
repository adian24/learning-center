import { ReactNode } from "react";
import Navbar from "./Navbar";

function SimpleLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="container max-w-7xl mx-auto py-10">{children}</div>
    </>
  );
}

export default SimpleLayout;
