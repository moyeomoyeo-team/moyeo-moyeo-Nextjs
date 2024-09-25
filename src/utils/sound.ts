const soundUrls = {
  배경: '/sounds/electronic-rock-king-around-here-15045.mp3',
  토스트: '/sounds/soft-notice-146623.mp3',
  에러_토스트: '/sounds/error-2-126514.mp3',
  버튼_클릭: '/sounds/button-124476.mp3',
  페이지_전환: '/sounds/interface-124464.mp3',
  팀원_선택: '/sounds/mouse-click-117076.mp3',
  팀원_확정: '/sounds/decidemp3-14575.mp3',
  라운드_변경: '/sounds/call-to-attention-123107.mp3',
  팀빌딩_완료: '/sounds/success-fanfare-trumpets-6185.mp3',
};

type SoundName = keyof typeof soundUrls;

const sounds = new Map<string, HTMLAudioElement>();
const getSound = (name: SoundName) => {
  if (!sounds.has(name)) {
    const sound = new Audio(soundUrls[name]);
    sounds.set(name, sound);
  }
  return sounds.get(name) as HTMLAudioElement;
};

export const playSound = (name: keyof typeof soundUrls, loop = false) => {
  const sound = getSound(name);
  sound.volume = 0.3;
  sound.loop = loop;
  return sound.play();
};

export const stopSound = (name: keyof typeof soundUrls) => {
  const sound = getSound(name);
  sound.pause();
  sound.currentTime = 0;
};
