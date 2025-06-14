'use client';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

NProgress.configure({ showSpinner: false });

const GlobalLoadingBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let timeout;
    const start = () => {
      timeout = setTimeout(() => NProgress.start(), 100); // avoid flicker on fast nav
    };
    const done = () => {
      clearTimeout(timeout);
      NProgress.done();
    };

    router.events?.on?.('routeChangeStart', start);
    router.events?.on?.('routeChangeComplete', done);
    router.events?.on?.('routeChangeError', done);

    return () => {
      router.events?.off?.('routeChangeStart', start);
      router.events?.off?.('routeChangeComplete', done);
      router.events?.off?.('routeChangeError', done);
    };
  }, [pathname]);

  return null;
};

export default GlobalLoadingBar;
