'use client';

import { useState } from 'react';

import CommonLayout from '@/layouts/CommonLayout';
import TeamBuildingPage from '@/screens/TeamBuilding';

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  const [showLottie, setShowLottie] = useState(false);

  return (
    <CommonLayout isShowLottieBackground={showLottie}>
      <TeamBuildingPage
        teamBuildingUuid={params.id}
        setShowLottie={setShowLottie}
      />
    </CommonLayout>
  );
}
