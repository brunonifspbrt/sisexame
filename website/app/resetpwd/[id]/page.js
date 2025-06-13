import Formulario from "./form";

export default async function Page({ params }) {
  const { id } = await params;
  // console.log(id);
  return (
    <>
      <Formulario UsuarioId={id} />
    </>
  );
}
