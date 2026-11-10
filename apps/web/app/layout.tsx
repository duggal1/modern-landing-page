import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Repo Explainer | Architecture, understood', description: 'Understand a GitHub repository as a living architecture sketch.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }
