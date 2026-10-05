import type { ExpertiseDiscipline } from '../types/expertise';

export const expertiseDisciplines: readonly ExpertiseDiscipline[] = [
  {
    id: 'commerce',
    index: '01',
    title: 'THƯƠNG ĐẠO',
    english: 'E-Commerce Mindset',
    chinese: '商道',
    description: 'Nhìn sản phẩm số không chỉ ở phần giao diện, mà còn từ nhu cầu người dùng, vận hành và giá trị thực tế mà sản phẩm có thể tạo ra.',
    asset: '/assets/xianxia/expertise/merchant-scripture.webp',
  },
  {
    id: 'web',
    index: '02',
    title: 'KIẾN WEB',
    english: 'Web Product Building',
    chinese: '構築',
    description: 'Từ landing page, portfolio đến web app nhỏ — tập trung biến ý tưởng thành sản phẩm có cấu trúc rõ ràng, dễ dùng và có thể tiếp tục phát triển.',
    asset: '/assets/xianxia/expertise/web-construction-tablet.webp',
  },
  {
    id: 'ai',
    index: '03',
    title: 'TRỢ PHÁP AI',
    english: 'AI-assisted Workflow',
    chinese: '輔法',
    description: 'Dùng AI như một pháp khí để tăng tốc nghiên cứu, triển khai, thử nghiệm và gỡ lỗi; còn hướng đi và quyết định cuối cùng vẫn do người làm nắm giữ.',
    asset: '/assets/xianxia/expertise/ai-jade-talisman.webp',
  },
  {
    id: 'planning',
    index: '04',
    title: 'MƯU HOẠCH',
    english: 'Product Planning',
    chinese: '謀劃',
    description: 'Trước khi bắt tay vào làm, cần hiểu vấn đề, xác định logic hệ thống và chọn cách triển khai hợp lý để ý tưởng có thể trở thành sản phẩm thực tế.',
    asset: '/assets/xianxia/expertise/product-strategy-scroll.webp',
  },
] as const;

export const expertiseBackground = '/assets/xianxia/expertise/scripture-hall-midnight.webp';
