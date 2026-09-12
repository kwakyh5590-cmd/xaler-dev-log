export interface HeroSlide {
	image: string;
	alt: string;
	eyebrow: string;
	title: string;
}

// 이미지를 교체하려면 public 폴더에 새 파일을 넣고 image 경로만 변경하세요.
// JPG, PNG, WebP, SVG를 사용할 수 있으며 권장 비율은 5:2입니다.
export const HERO_SLIDES: HeroSlide[] = [
	{
		image: '/images/hero/system-architecture-ai-v2.webp',
		alt: '유리처럼 투명한 시스템 모듈이 푸른빛 경로로 연결된 개발 아키텍처',
		eyebrow: 'BUILDING SYSTEMS',
		title: '복잡한 구조를 단순하게 연결합니다.',
	},
	{
		image: '/images/hero/debugging-path-ai-v2.webp',
		alt: '여러 기술 계층을 따라 오류 지점까지 이어지는 푸른 디버깅 경로',
		eyebrow: 'DEBUGGING FLOW',
		title: '문제의 원인을 따라가며 기록합니다.',
	},
	{
		image: '/images/hero/learning-layers-ai-v2.webp',
		alt: '지식 카드가 빛나는 상승 경로를 이루며 쌓이는 학습 과정',
		eyebrow: 'LEARNING LAYERS',
		title: '배운 내용을 나만의 지식으로 쌓습니다.',
	},
];

export const HERO_SLIDE_INTERVAL = 6500;
