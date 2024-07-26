import { Shell } from "../_components/shell";
import { PlateComponent } from "./editor";

export default function PlatePage() {
  return (
    <Shell>
      <div className="container mt-4 min-h-screen">
        <PlateComponent />
      </div>
    </Shell>
  );
}
