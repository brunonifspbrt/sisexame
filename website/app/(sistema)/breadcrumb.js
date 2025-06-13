import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import { HiHome } from "react-icons/hi";
import { usePathname } from "next/navigation";
import Link from "next/link";

const BreadcrumbSite = () => {
  const rotaAtual = usePathname();
  // cria o caminho das rotas e exibe em todas as páginas

  // separo o caminho usando barra (/). Primeira barra é removida
  const rotaSegmentos = rotaAtual.split("/").filter((segment) => segment);

  // itens na seção Atendimento
  const itensAtend = ["/agendconf", "/atendimento"];

  // Crio o breadcrumb
  const itens = rotaSegmentos.map((segment, index) => {
    // Para criar o link, juntos os segmentos
    const href = "/" + rotaSegmentos.slice(0, index + 1).join("/");
    let label = "";

    // Primeira letra do segmento da rota fica em maiúscula
    // const label = segment.charAt(0).toUpperCase() + segment.slice(1);

    label = segment.charAt(0).toUpperCase() + segment.slice(1);
    // console.log(href);

    // se for agendconf altero o título do label
    if (href === "/agendconf") {
      label = "Conferência de Dados";
    }

    if (href === "/atendimento") {
      label = "Atendimento de Pacientes";
    }

    if (href === "/resumo") {
      label = "Resumo de Atendimentos";
    }

    // dependendo o nome do segmento eu mudo o nome que será visível

    return (
      <BreadcrumbItem key={href}>
        <Link href={href} passHref>
          {label}
        </Link>
      </BreadcrumbItem>
    );
  });

  return (
    <Breadcrumb aria-label="Breadcrumb">
      <BreadcrumbItem icon={HiHome}>
        <Link href={"/"} passHref>
          Início
        </Link>
      </BreadcrumbItem>
      {itens}
    </Breadcrumb>
  );
};

export default BreadcrumbSite;
