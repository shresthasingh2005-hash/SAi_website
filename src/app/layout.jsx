export const metadata = {
  title: 'S.Ai - Personal Health Assistant',
  description: 'Your advanced AI health companion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
