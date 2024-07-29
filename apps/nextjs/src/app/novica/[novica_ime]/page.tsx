import PlateEditor from "~/app/uredi/[novica_ime]/editor";

interface NovicaProps {
  params: {
    novica_ime: string;
  };
}

export default function NovicaPage({ params: { novica_ime } }: NovicaProps) {
  return (
    <>
      <p>Novica: {novica_ime}</p>
      <PlateEditor readOnly />
    </>
  );
}
