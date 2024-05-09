import "../styles/index.css"

export const metadata = {
  title: 'Chat2edit',
  description: 'Nature UI for Edit Image and Create Video',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='overflow-hidden max-w-screen-2xl m-auto'>
        {children}
      </body>
    </html>
  )
}