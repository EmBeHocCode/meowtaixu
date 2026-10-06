export type TechniqueId = 'html' | 'css' | 'javascript' | 'react' | 'typescript' | 'nextjs';

export type Technique = Readonly<{
  id: TechniqueId;
  name: string;
  category: string;
  note: string;
  glyph: string;
  asset: string;
  prominence: 'primary' | 'supporting';
}>;

export type MasteryDiscipline = Readonly<{
  id: string;
  name: string;
  state: string;
  stage: 1 | 2 | 3 | 4;
}>;

export type TechniquesSceneProps = {
  active: boolean;
  mobile: boolean;
  selected: number;
  onReady: () => void;
};
