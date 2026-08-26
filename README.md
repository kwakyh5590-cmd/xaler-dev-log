# Xaler Dev Log

개발 학습, 프로젝트 진행 과정, 문제 해결 기록을 남기는 개인 기술 블로그입니다.

## 기술 구성

- Astro 7
- Markdown / MDX Content Collections
- GitHub Actions
- GitHub Pages

## 글 작성

`src/content/blog` 폴더에 Markdown 파일을 추가합니다.

```md
---
title: '글 제목'
description: '글 설명'
pubDate: '2026-08-26'
category: 'Learning'
tags: ['Astro', '블로그']
draft: true
---

본문을 작성합니다.
```

사용할 수 있는 카테고리는 `Project Log`, `Debugging`, `Learning`, `Developer Journal`입니다. 검토가 끝나면 `draft: false`로 변경합니다.

## 실행

```sh
npm install
npm run dev -- --background
npm run build
```

`main` 브랜치에 푸시하면 GitHub Pages 배포 워크플로가 실행됩니다.
