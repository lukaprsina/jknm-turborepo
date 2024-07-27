import { Shell } from "../_components/shell";
import { PlateComponent } from "./editor";

export default function PlatePage() {
  return (
    <Shell>
      <div className="container min-h-screen pt-8">
        <PlateComponent />
      </div>
    </Shell>
  );
}
