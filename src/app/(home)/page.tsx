'use client';

import CommonLayout from '@/layouts/CommonLayout';
import HomePage from '@/pages/Home';

export default function Page() {
  return (
    <CommonLayout isShowLottieBackground>
      <HomePage />
    </CommonLayout>
  );
}
