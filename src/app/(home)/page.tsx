'use client';

import CommonLayout from '@/layouts/CommonLayout';
import HomePage from '@/screens/Home';

export default function Page() {
  return (
    <CommonLayout isShowLottieBackground>
      <HomePage />
    </CommonLayout>
  );
}
