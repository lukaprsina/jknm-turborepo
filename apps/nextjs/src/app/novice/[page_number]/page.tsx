import { Shell } from "~/components/shell";
import { DataTableDemo } from "./demo";

interface NoviceProps {
  params: {
    page_number: string;
  };
}

export default function Novice({
  params: { page_number: page_string },
}: NoviceProps) {
  const page_number = parseInt(page_string);

  return (
    <Shell>
      <DataTableDemo page_number={page_number} />
    </Shell>
  );
}
