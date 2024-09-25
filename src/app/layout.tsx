import Providers from './_providers';
import './font.css';
import './index.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard-dynamic-subset.css"
        />
        <link
          rel="preload"
          as="font"
          crossOrigin="anonymous"
          type="font/woff"
          href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff"
        />
        <link
          rel="preload"
          as="font"
          crossOrigin="anonymous"
          type="font/woff"
          href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://moyeomoyeo.pages.dev/" />
        <meta property="og:title" content="모여모여 | 넥스터즈 팀빌딩 서비스" />
        <meta property="og:description" content="넥스터즈 팀빌딩 서비스" />
        <meta property="og:site_name" content="모여모여" />
        <meta property="og:image" content="/ogImage.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="ko" />
        <title>모여모여 | 넥스터즈 팀빌딩 서비스</title>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
