import './globals.css';

export const metadata = {
  title: 'Toshiko Sushi | Menú Digital',
  description: 'Pide directamente a nuestro WhatsApp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}