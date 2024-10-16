import { useEffect } from 'react';

import ExtraRound from '@/assets/icons/modalLogo/extraRound.svg';
import Finish from '@/assets/icons/modalLogo/finish.svg';
import FirstRound from '@/assets/icons/modalLogo/firstRound.svg';
import FourthRound from '@/assets/icons/modalLogo/fourthRound.svg';
import SecondRound from '@/assets/icons/modalLogo/secondRound.svg';
import StartRound from '@/assets/icons/modalLogo/startRound.svg';
import ThirdRound from '@/assets/icons/modalLogo/thirdRound.svg';
import { Modal } from '@/components/Modal';
import { Round } from '@/types';

type RoundFinishModalProps = {
  isOpen: boolean;
  onClose: () => void;
  round: Round;
};

const DURATION = 3000;

const modalLogoMap = {
  START: <StartRound />,
  FIRST_ROUND: <FirstRound />,
  SECOND_ROUND: <SecondRound />,
  THIRD_ROUND: <ThirdRound />,
  FOURTH_ROUND: <FourthRound />,
  ADJUSTED_ROUND: <ExtraRound />,
  COMPLETE: <Finish />,
};

const RoundStartModal = ({ isOpen, onClose, round }: RoundFinishModalProps) => {
  const isModalClosable = round !== 'START';

  useEffect(() => {
    if (!isOpen) return;
    const delay = setTimeout(() => {
      if (isModalClosable) {
        onClose();
      }
    }, DURATION);
    return () => clearTimeout(delay);
  }, [isOpen, onClose, isModalClosable]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      shouldCloseOnOverlayClick={isModalClosable}
      shouldCloseOnEsc={isModalClosable}
    >
      {round && modalLogoMap[round]}
    </Modal>
  );
};

export default RoundStartModal;
