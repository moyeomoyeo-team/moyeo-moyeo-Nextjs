'use client';

import { useState } from 'react';

import { useGetTotalInfoForSurvey } from '@/apis/survey/queries';
import Spinner from '@/components/Spinner';
import { SurveyFormResult } from '@/types';

import NotFound from '../NotFound';
import { SurveyForm } from './SurveyForm';
import { SurveyNotAvailable } from './SurveyNotAvailable';
import { SurveyResult } from './SurveyResult';

type SurveyProps = {
  teamBuildingUuid: string;
};

const Survey = ({ teamBuildingUuid }: SurveyProps) => {
  const [formResult, setFormResult] = useState<SurveyFormResult>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isLoading, data: totalInfoForSurvey } =
    useGetTotalInfoForSurvey(teamBuildingUuid);

  const handleSubmit = (result: SurveyFormResult) => {
    setIsSubmitted(true);
    setFormResult(result);
  };

  if (isLoading) return <Spinner />;
  if (!teamBuildingUuid || !totalInfoForSurvey) return <NotFound />;
  if (totalInfoForSurvey.teamBuildingInfo.roundStatus !== 'START')
    return <SurveyNotAvailable />;
  return !isSubmitted ? (
    <SurveyForm
      teamBuildingUuid={teamBuildingUuid}
      onAfterSubmit={handleSubmit}
    />
  ) : (
    <SurveyResult formResult={formResult} />
  );
};

export default Survey;
