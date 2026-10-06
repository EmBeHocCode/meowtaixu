import type { MasteryDiscipline, Technique } from '../types/skills';

export const techniques: readonly Technique[] = [
  { id: 'html', name: 'HTML', category: 'Nền tảng', note: 'Cấu trúc nội dung có ngữ nghĩa', glyph: '文', asset: '/assets/xianxia/techniques/relic-html-foundation.webp', prominence: 'supporting' },
  { id: 'css', name: 'CSS', category: 'Hình thái', note: 'Bố cục, responsive và chuyển động', glyph: '形', asset: '/assets/xianxia/techniques/relic-css-scroll.webp', prominence: 'supporting' },
  { id: 'javascript', name: 'JavaScript', category: 'Vận hành', note: 'Tương tác và logic phía trình duyệt', glyph: '動', asset: '/assets/xianxia/techniques/relic-javascript-plate.webp', prominence: 'primary' },
  { id: 'react', name: 'React', category: 'Kiến tạo', note: 'Giao diện theo thành phần', glyph: '陣', asset: '/assets/xianxia/techniques/relic-react-seal.webp', prominence: 'primary' },
  { id: 'typescript', name: 'TypeScript', category: 'Khuôn phép', note: 'Kiểu dữ liệu rõ ràng, dễ bảo trì', glyph: '律', asset: '/assets/xianxia/techniques/relic-typescript-jade.webp', prominence: 'supporting' },
  { id: 'nextjs', name: 'Next.js', category: 'Ứng dụng', note: 'Xây sản phẩm web hoàn chỉnh', glyph: '典', asset: '/assets/xianxia/techniques/relic-nextjs-scripture.webp', prominence: 'supporting' },
] as const;

export const masteryDisciplines: readonly MasteryDiscipline[] = [
  { id: 'ai', name: 'Thực thi cùng AI', state: 'Đang tinh luyện', stage: 3 },
  { id: 'planning', name: 'Tư duy & hoạch định sản phẩm', state: 'Đang áp dụng', stage: 2 },
  { id: 'frontend', name: 'Xây dựng frontend web', state: 'Đã có sản phẩm', stage: 4 },
  { id: 'commerce', name: 'Tư duy E-Commerce', state: 'Đang phát triển', stage: 2 },
] as const;
