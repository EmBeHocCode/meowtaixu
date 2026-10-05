export type ExpertiseDiscipline = {
  id: 'commerce' | 'web' | 'ai' | 'planning';
  index: string;
  title: string;
  english: string;
  chinese: string;
  description: string;
  asset: string;
};

export type ExpertiseSceneProps = {
  active: boolean;
  mobile: boolean;
  selected: number;
  onReady: () => void;
};
