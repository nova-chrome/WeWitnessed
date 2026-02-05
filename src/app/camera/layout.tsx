import { Outfit } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

export default function CameraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={outfit.className}>{children}</div>;
}
