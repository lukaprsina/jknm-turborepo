import SignIn from "./signin";

import "./google.css";

import { Shell } from "../../components/shell";

export default function Prijava() {
  return (
    <Shell>
      <div className="h-screen w-full min-w-full">
        <SignIn />
      </div>
    </Shell>
  );
}
