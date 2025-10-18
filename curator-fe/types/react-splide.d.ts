declare module '@splidejs/react-splide' {
  import { ReactNode, Component, ComponentProps } from 'react';

  export interface SplideProps {
    options?: Record<string, any>;
    extensions?: Record<string, any>;
    transition?: Record<string, any>;
    className?: string;
    tag?: string;
    children?: ReactNode;
    onMounted?: (splide: any) => void;
    onUpdated?: (splide: any) => void;
    onMove?: (splide: any, newIndex: number, prevIndex: number, destIndex: number) => void;
    onMoved?: (splide: any, newIndex: number, prevIndex: number, destIndex: number) => void;
    onClick?: (splide: any, slide: any, e: Event) => void;
    onArrowsMounted?: (splide: any, prev: HTMLElement, next: HTMLElement) => void;
    onArrowsUpdated?: (splide: any, prev: HTMLElement, next: HTMLElement) => void;
    onPaginationMounted?: (splide: any, data: any) => void;
    onPaginationUpdated?: (splide: any, data: any) => void;
    onNavigationMounted?: (splide: any, splides: any[]) => void;
    onAutoplayPlay?: (splide: any) => void;
    onAutoplayPause?: (splide: any) => void;
    onLazyLoadLoaded?: (splide: any, img: HTMLImageElement, slide: any) => void;
    [key: string]: any;
  }

  export interface SplideSlideProps {
    className?: string;
    tag?: string;
    children?: ReactNode;
    [key: string]: any;
  }

  export class Splide extends Component<SplideProps> {}
  export class SplideSlide extends Component<SplideSlideProps> {}
}

declare module '@splidejs/react-splide/css/core' {
  const css: any;
  export = css;
}