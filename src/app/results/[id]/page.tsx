'use client';

import MobileLayout from '@/layouts/MobileLayout';
import { Result as TeamBuildingResultPage } from '@/screens/TeamBuilding/Result';

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  return (
    <MobileLayout>
      <TeamBuildingResultPage teamBuildingUuid={params.id} />
    </MobileLayout>
  );
}
