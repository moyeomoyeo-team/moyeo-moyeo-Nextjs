import MobileLayout from '@/layouts/MobileLayout';
import SurveyPage from '@/pages/Survey';

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  return (
    <MobileLayout>
      <SurveyPage teamBuildingUuid={params.id} />
    </MobileLayout>
  );
}
