// app/notfound.js ou app/404.js
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.heading}>404</h1>
        <p style={styles.subheading}>Página não encontrada</p>
        <p style={styles.message}>
          Desculpe, a página que você está procurando não existe.
        </p>
        <Link href="/" style={styles.link}>
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f8f9fa",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  content: {
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "100%",
  },
  heading: {
    fontSize: "72px",
    fontWeight: "bold",
    color: "#dc3545", // vermelho suave
  },
  subheading: {
    fontSize: "24px",
    margin: "10px 0",
    color: "#343a40",
  },
  message: {
    fontSize: "16px",
    margin: "20px 0",
    color: "#6c757d",
  },
  link: {
    fontSize: "18px",
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
