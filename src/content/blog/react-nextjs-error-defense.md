---
title: 'React와 Next.js 핵심 차이, 연타에도 흔들리지 않는 에러 방어 전략'
description: 'React와 Next.js의 역할과 렌더링 방식을 정확히 구분하고, 빠른 연속 입력에도 안전한 프론트엔드와 서버 방어 전략을 정리합니다.'
pubDate: '2026-09-12'
category: 'Learning'
tags: ['React', 'Next.js', '프론트엔드', '에러처리']
draft: false
---

React와 Next.js를 공부하면서 처음에는 **React는 CSR, Next.js는 SSR**이라고 이해했습니다. 방향은 비슷하지만, 실제로는 조금 더 정확한 구분이 필요했습니다.

이번 글에서는 두 기술의 역할과 렌더링 방식을 다시 정리하고, 사용자가 메뉴나 버튼을 빠르게 반복 클릭해도 서비스가 흔들리지 않게 만드는 방법을 함께 기록합니다.

## 이 주제를 공부하게 된 계기

Next.js로 구성된 한 웹사이트를 살펴보다가 상단 메뉴를 빠르게 연속해서 눌러 화면을 전환해 본 적이 있습니다. 그 과정에서 정상적인 페이지 대신 오류 코드가 표시되는 장면을 보게 되었습니다.

이 경험을 통해 두 가지 질문이 생겼습니다.

- 사용자의 빠른 연속 입력에도 오류가 발생하지 않도록 하려면 어떻게 설계해야 할까?
- 오류를 완전히 막을 수 없다면, 사용자가 당황하지 않도록 화면 안에서 어떻게 자연스럽게 안내하고 복구하게 만들 수 있을까?

물론 이 장면만으로 Next.js 자체가 오류의 원인이라고 단정할 수는 없습니다. 중복된 네트워크 요청, 처리되지 않은 예외, 요청 간 순서 충돌, 서버 과부하처럼 여러 원인이 있을 수 있습니다. 중요한 것은 오류를 숨기는 것이 아니라, 실패 가능성을 예상하고 사용자가 계속 서비스를 이용할 수 있도록 설계하는 것이라고 생각했습니다.

이 궁금증을 출발점으로 React와 Next.js의 역할부터 다시 살펴보고, 프론트엔드와 서버에서 적용할 수 있는 방어 전략을 정리했습니다.

## 먼저 바로잡은 핵심 내용

- React는 CSR 전용 프레임워크가 아니라 **사용자 인터페이스를 만드는 라이브러리**입니다.
- Next.js는 React를 기반으로 라우팅, 렌더링, 데이터 처리, 최적화 규칙을 제공하는 **프레임워크**입니다.
- Googlebot은 JavaScript를 실행할 수 있습니다. 다만 렌더링 대기와 실행 실패 가능성이 있어 미리 생성된 HTML이 여전히 유리합니다.
- Next.js가 항상 24시간 동작하는 서버를 요구하는 것은 아닙니다. 정적 내보내기를 사용하면 CDN이나 정적 호스팅에도 배포할 수 있습니다.
- 사용자의 연속 클릭을 프론트엔드에서 막는 것만으로는 충분하지 않습니다. 서버에도 요청 제한과 중복 처리 방어가 필요합니다.

## 1. React와 Next.js의 차이

### React

React는 화면을 컴포넌트 단위로 만들고 상태에 따라 UI를 갱신하는 라이브러리입니다.

Vite로 만든 React SPA는 일반적으로 브라우저에서 JavaScript를 실행해 화면을 완성하는 CSR 방식을 사용합니다. 하지만 이것은 React 자체의 한계가 아닙니다. React는 프레임워크와 함께 사용하면 CSR, SSR, SSG 같은 여러 방식을 사용할 수 있습니다.

React만으로 프로젝트를 시작하면 다음 선택을 개발자가 직접 해야 합니다.

- 라우팅
- 데이터 요청과 캐싱
- 빌드와 배포 방식
- 메타데이터와 SEO 처리
- 서버 렌더링 여부

자유도가 높은 대신 프로젝트 구조와 기술 선택을 직접 설계해야 합니다.

### Next.js

Next.js는 React를 기반으로 애플리케이션 구조와 실행 방식을 제공하는 프레임워크입니다.

App Router에서는 폴더 구조로 URL을 만들고, 기본적으로 Server Component를 사용합니다. 상태, 이벤트 처리, 브라우저 API가 필요한 부분만 Client Component로 분리할 수 있습니다.

주요 기능은 다음과 같습니다.

- 파일 시스템 기반 라우팅
- 정적 생성과 동적 서버 렌더링
- Server Component와 Client Component 조합
- 페이지별 메타데이터 관리
- 이미지와 폰트 최적화
- 로딩 UI, 스트리밍, 에러 처리
- Route Handler와 Server Function

즉, Next.js는 React를 대체하는 기술이 아니라 **React 애플리케이션을 일정한 규칙으로 운영하게 도와주는 상위 프레임워크**입니다.

## 2. 렌더링 방식은 둘 중 하나가 아니다

렌더링 방식은 프로젝트 전체에 하나만 선택하는 것이 아니라 페이지의 목적에 따라 섞어 사용할 수 있습니다.

### CSR: Client-Side Rendering

브라우저가 JavaScript를 내려받아 화면을 구성합니다.

- 로그인 이후의 대시보드처럼 상호작용이 많은 화면에 적합합니다.
- 초기 HTML에 실제 콘텐츠가 적으면 첫 화면 표시와 검색 수집에 불리할 수 있습니다.
- 서버 없이 정적 파일로 배포하기 쉽습니다.

### SSG: Static Site Generation

빌드할 때 각 페이지의 HTML을 미리 생성합니다.

- 블로그, 문서, 포트폴리오처럼 내용이 자주 바뀌지 않는 사이트에 적합합니다.
- 빠르고 저렴하게 CDN에서 제공할 수 있습니다.
- 새 글을 반영하려면 보통 다시 빌드해야 합니다.

### SSR: Server-Side Rendering

요청이 들어올 때 서버가 HTML을 생성합니다.

- 사용자별 데이터나 자주 바뀌는 정보에 적합합니다.
- 서버 실행 비용, 캐시, 장애 대응을 고려해야 합니다.
- 모든 페이지에 적용할 필요는 없습니다.

### ISR과 동적 렌더링

정적으로 생성한 페이지를 일정 조건에서 갱신하거나, 요청 시점의 정보가 필요한 일부 경로만 동적으로 처리할 수도 있습니다.

중요한 것은 **Next.js를 사용한다고 모든 페이지가 SSR이 되는 것은 아니라는 점**입니다.

## 3. 검색 로봇과 SEO를 정확히 이해하기

검색 로봇은 링크를 따라 페이지를 발견하고, HTML과 리소스를 분석한 뒤 검색 색인에 저장합니다.

Googlebot은 JavaScript를 실행해 CSR 페이지도 렌더링할 수 있습니다. 따라서 “React 사이트는 검색 로봇이 전혀 읽지 못한다”는 표현은 정확하지 않습니다.

다만 JavaScript 렌더링은 별도의 처리 단계가 필요하고, 일부 봇은 JavaScript를 충분히 실행하지 못합니다. 네트워크 오류나 차단된 리소스 때문에 콘텐츠가 누락될 수도 있습니다. 그래서 블로그처럼 공개 검색이 중요한 콘텐츠는 SSG나 SSR로 실제 글이 포함된 HTML을 제공하는 편이 안정적입니다.

SEO는 프레임워크 하나로 결정되지 않습니다. 다음 요소도 함께 필요합니다.

- 고유한 제목과 설명
- 크롤링 가능한 실제 링크
- 올바른 HTTP 상태 코드
- 사이트맵과 canonical URL
- 모바일 사용성
- 빠른 로딩 속도
- 독자에게 유용하고 정확한 본문

AI 검색 서비스의 수집 봇과 기존 검색 엔진 봇은 목적과 정책이 서로 다를 수 있습니다. 검색에 색인됐다는 사실만으로 AI 학습이나 답변 출처 채택이 보장되는 것은 아닙니다.

## 4. 비용과 서버 장애에 대한 오해

Next.js는 서버 기능을 사용할 수 있지만, 서버 사용이 필수인 것은 아닙니다.

`output: 'export'`를 사용하면 페이지별 HTML, CSS, JavaScript를 생성해 GitHub Pages 같은 정적 호스팅에 배포할 수 있습니다. 이 경우 런타임 서버 장애 가능성은 거의 없지만, SSR·Server Function·기본 이미지 최적화처럼 서버가 필요한 기능에는 제한이 생깁니다.

따라서 비용과 운영 난이도는 “React인가 Next.js인가”보다 **어떤 렌더링 방식과 서버 기능을 선택했는가**에 의해 달라집니다.

## 5. 어떤 기술을 선택할까?

### React SPA가 잘 맞는 경우

- 로그인 후 사용하는 사내 관리자 화면
- 검색 노출이 중요하지 않은 대시보드
- 브라우저 상호작용이 중심인 도구
- 정적 호스팅과 단순한 배포가 최우선인 서비스

### Next.js가 잘 맞는 경우

- 검색 노출과 메타데이터가 중요한 콘텐츠 서비스
- 공개 페이지와 로그인 기능을 함께 제공하는 서비스
- 서버 데이터 처리와 React UI를 한 프로젝트에서 관리할 때
- 페이지별로 정적·동적 렌더링을 조합해야 할 때

### 블로그라면 Next.js가 필수일까?

아닙니다. 정적 HTML을 잘 생성하는 Astro, Next.js, 다른 SSG 도구 모두 적합합니다.

현재 Xaler Dev Log는 Astro로 글을 정적 생성하고 있습니다. 검색 노출과 속도만을 이유로 Next.js로 다시 만들 필요는 없습니다. 회원 기능, 개인화, 데이터베이스 기반 편집, 서버 기능이 필요해질 때 마이그레이션 이점을 다시 비교하는 편이 합리적입니다.

## 6. 사용자의 연속 클릭은 왜 문제가 될까?

메뉴를 빠르게 눌렀다는 이유만으로 서버가 종료되거나 `Application error`가 발생하는 것은 정상적인 상황이 아닙니다.

연속 클릭은 숨어 있던 문제를 드러낼 수 있습니다.

- 같은 변경 요청이 중복 실행됨
- 늦게 끝난 이전 요청이 최신 화면을 덮어씀
- 요청마다 무거운 서버 연산이 반복됨
- 예외가 처리되지 않아 전체 경로가 실패함
- 로딩 중인 버튼이 계속 활성화돼 있음

따라서 방어는 UI, 요청 상태, 렌더링 오류, 서버의 네 계층에서 해야 합니다.

## 7. 1차 방어: 중복 실행 잠금과 Loading State

저장, 결제, 생성처럼 중복 실행되면 안 되는 작업은 클릭 즉시 잠급니다. React 상태만 확인하면 같은 렌더링 안에서 매우 빠른 입력이 들어올 수 있으므로 `ref`를 잠금 장치로 함께 사용할 수 있습니다.

```tsx
'use client'

import { useRef, useState } from 'react'

export function SaveButton() {
  const locked = useRef(false)
  const [pending, setPending] = useState(false)

  async function handleSave() {
    if (locked.current) return

    locked.current = true
    setPending(true)

    try {
      await saveData()
    } finally {
      locked.current = false
      setPending(false)
    }
  }

  return (
    <button type="button" disabled={pending} onClick={handleSave}>
      {pending ? '저장 중…' : '저장'}
    </button>
  )
}
```

단순 페이지 이동은 직접 요청 코드를 만들기보다 Next.js의 `<Link>`를 우선 사용하고, 느린 동적 경로에는 `loading.tsx`로 즉시 피드백을 보여주는 편이 좋습니다.

## 8. 쓰로틀과 디바운스는 목적이 다르다

### Throttle

일정 시간 동안 최대 한 번만 실행합니다.

- 스크롤 위치 계산
- 창 크기 변경 처리
- 지속적으로 들어오는 이벤트 샘플링

### Debounce

입력이 멈춘 뒤 마지막 이벤트만 실행합니다.

- 검색어 자동완성
- 필터 조건 변경
- 자동 저장

메뉴 이동에 무조건 디바운스를 적용하면 클릭 후 반응이 늦어져 오히려 UX가 나빠질 수 있습니다. 메뉴에는 링크 기반 이동과 로딩 표시를 우선하고, 실제로 중복 호출되는 부수 효과만 제한하는 편이 낫습니다.

## 9. 요청 취소로 오래된 응답 막기

검색어나 선택 항목이 바뀌면 이전 요청을 취소해 오래된 결과가 최신 화면을 덮어쓰지 않게 합니다.

```tsx
import { useEffect, useState } from 'react'

export function SearchResult({ keyword }: { keyword: string }) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`, {
          signal: controller.signal,
        })
        const data = await response.json()
        setResult(data)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        throw error
      }
    }

    load()
    return () => controller.abort()
  }, [keyword])

  return <ResultView data={result} />
}
```

`AbortController`는 브라우저의 요청과 응답 소비를 중단합니다. 하지만 서버가 이미 작업을 시작했다면 서버 연산까지 반드시 멈춘다고 보장할 수는 없습니다. 서버에도 취소 신호 처리, 타임아웃, 중복 방지가 필요합니다.

## 10. Error Boundary의 역할과 한계

Error Boundary는 하위 컴포넌트의 렌더링 오류를 격리하고 대체 화면을 보여줍니다. Next.js App Router에서는 경로 구간에 `error.tsx`를 두어 비슷한 경계를 만들 수 있습니다.

하지만 Error Boundary가 모든 오류를 잡는 것은 아닙니다.

- 이벤트 핸들러 내부 오류
- 임의의 비동기 콜백 오류
- 이미 실패한 API 요청의 비즈니스 오류
- 서버 과부하와 네트워크 단절

이런 오류는 요청 코드에서 직접 처리하고, 사용자가 다시 시도할 수 있는 상태를 제공해야 합니다.

## 11. 최종 방어선은 서버다

프론트엔드의 `disabled`, throttle, debounce는 정상 사용자의 실수를 줄이는 UX 장치입니다. 개발자 도구나 별도 스크립트로 API를 직접 호출하는 요청까지 막을 수는 없습니다.

서버에는 다음 방어가 필요합니다.

- 사용자·IP·API 키별 rate limit
- 중복 POST를 막는 idempotency key
- 요청 본문과 페이지 크기 제한
- 실행 시간과 외부 API 타임아웃
- 읽기 요청 캐싱과 동일 요청 병합
- 예외 로깅, 모니터링, 안전한 오류 응답

특히 결제, 주문, 메일 발송처럼 비용이나 데이터 변경이 발생하는 요청은 **같은 요청이 여러 번 도착해도 결과가 한 번만 반영되도록** 설계해야 합니다.

## 정리

React와 Next.js의 차이는 단순히 CSR과 SSR의 차이가 아닙니다.

- React는 UI를 만드는 기반입니다.
- Next.js는 React 애플리케이션의 라우팅, 렌더링, 서버와 배포 규칙을 제공합니다.
- SEO는 미리 생성된 HTML이 유리하지만 프레임워크 이름만으로 결정되지 않습니다.
- Next.js도 정적 배포가 가능하며 서버 비용은 선택한 기능에 따라 달라집니다.
- 연속 클릭 방어는 프론트엔드 UX와 서버 안정성을 함께 설계해야 합니다.

이번 학습에서 가장 크게 수정한 생각은 이것입니다.

> 좋은 프레임워크가 오류를 자동으로 없애주는 것이 아니라, 요청이 중복되거나 실패해도 안전하도록 각 계층의 책임을 나누는 설계가 필요하다.

## 참고한 공식 문서

- [React: Creating a React App](https://react.dev/learn/creating-a-react-app)
- [Next.js: App Router](https://nextjs.org/docs/app)
- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js: Static Exports](https://nextjs.org/docs/pages/guides/static-exports)
- [Next.js: Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating)
- [Next.js: Error Handling](https://nextjs.org/docs/app/getting-started/error-handling)
- [Google Search Central: JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [MDN: AbortController.abort()](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort)
- [OWASP API Security: Unrestricted Resource Consumption](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/)
