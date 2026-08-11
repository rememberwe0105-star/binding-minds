import { Fraunces } from 'next/font/google';

/**
 * 워드마크·헤드라인용 디스플레이 세리프 — 단일 공유 인스턴스.
 *
 * 파일마다 Fraunces()를 따로 호출하면 빌드 시 Google Fonts를 그만큼 반복 페칭하고,
 * 그 네트워크 요청 하나가 실패하면 Vercel 빌드가 통째로 깨진다
 * ("Error while requesting resource" → module not found).
 * 여기서 한 번만 로드하고 전 컴포넌트가 이 인스턴스를 공유해 페칭을 최소화한다.
 *
 * weight/style은 모든 사용처의 상위집합(합집합)으로 정의한다.
 */
export const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});
