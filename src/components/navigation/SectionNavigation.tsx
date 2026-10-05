import { sections } from '../../data/sections';

export function SectionNavigation() {
  return <nav aria-label="Portfolio sections"><ul>
    {sections.map(({ id, label }) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}
  </ul></nav>;
}
