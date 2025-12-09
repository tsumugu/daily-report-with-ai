import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

/**
 * ページ遷移のフェードインアニメーション
 */
export const fadeInAnimation = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-in', style({ opacity: 1 })),
  ]),
]);

/**
 * リストアイテムの表示アニメーション（stagger効果付き）
 */
export const listItemAnimation = trigger('listItem', [
  transition(':enter', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(10px)' }),
      stagger(50, [
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ], { optional: true }),
  ]),
]);

/**
 * モーダルのスケールアニメーション
 */
export const modalScaleAnimation = trigger('modalScale', [
  transition(':enter', [
    style({ transform: 'scale(0.95)', opacity: 0 }),
    animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ transform: 'scale(0.95)', opacity: 0 })),
  ]),
]);

