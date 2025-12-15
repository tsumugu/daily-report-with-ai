import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  AfterViewChecked,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  ElementRef,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HierarchyCardComponent, HierarchyCardData } from '../hierarchy-card/hierarchy-card.component';
import { IconComponent } from '../icon/icon.component';

/**
 * 階層構造のデータ型
 */
export interface HierarchyTreeNode {
  id: string;
  data: HierarchyCardData;
  children: HierarchyTreeNode[];
}

/**
 * 階層構造のツリービューコンポーネント
 * 階層構造を縦に階段状に積む形式で表示
 */
@Component({
  selector: 'app-hierarchy-tree-view',
  standalone: true,
  imports: [CommonModule, HierarchyCardComponent, HierarchyTreeViewComponent, IconComponent],
  templateUrl: './hierarchy-tree-view.component.html',
  styleUrl: './hierarchy-tree-view.component.scss',
})
export class HierarchyTreeViewComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
  @Input() nodes: HierarchyTreeNode[] = [];
  @Input() expandedIds = new Set<string>();
  @Input() showCreateChildButton = false;
  @Output() nodeClicked = new EventEmitter<string>();
  @Output() expandToggled = new EventEmitter<string>();
  @Output() createChild = new EventEmitter<string>();

  @ViewChildren('nodeElement') nodeElements!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('parentButton') parentButtons!: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChildren('cardElement') cardElements!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('treeViewContainer') treeViewContainer!: ElementRef<HTMLElement>;

  private resizeObserver?: ResizeObserver;
  private connectorLineData = new Map<string, {
    left: number;
    top: number;
    width: number;
    height: number;
    horizontalLeft: number;
    horizontalTop: number;
  }>();
  // 同じ階層のノード間の横線のデータ
  private siblingLineData = new Map<string, {
    left: number;
    top: number;
    width: number;
  }>();
  // 同じ階層のノード間の縦線のデータ
  private siblingVerticalLineData = new Map<string, {
    left: number;
    top: number;
    height: number;
  }>();

  private readonly cdr = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    // treeViewContainerが取得できるまで待つ
    setTimeout(() => {
      this.updateConnectorLines();
      this.setupResizeObserver();
    }, 0);
  }

  ngAfterViewChecked(): void {
    // 展開状態が変わったときに線を更新
    if (this.treeViewContainer) {
      this.updateConnectorLines();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.updateConnectorLines();
      this.cdr.detectChanges();
    });

    // カード要素のサイズ変更を監視
    this.cardElements.forEach((cardEl) => {
      if (cardEl.nativeElement) {
        this.resizeObserver?.observe(cardEl.nativeElement);
      }
    });
  }

  private updateConnectorLines(): void {
    if (!this.nodeElements || !this.parentButtons) {
      return;
    }

    const nodeElementsArray = this.nodeElements.toArray();
    const parentButtonsArray = this.parentButtons.toArray();

    // 同じ階層のノード間の横線と縦線をクリア
    this.siblingLineData.clear();
    this.siblingVerticalLineData.clear();

    nodeElementsArray.forEach((nodeEl, index) => {
      const node = this.nodes[index];
      if (!node) {
        return;
      }

      // 親から子へのL字の線を描画
      if (this.hasChildren(node) && this.isExpanded(node.id)) {
      const parentButton = parentButtonsArray[index];
      // children要素はnodeElの直接の子要素として取得
      const childrenElement = nodeEl.nativeElement.querySelector('.hierarchy-tree-view__children') as HTMLElement;

        if (parentButton?.nativeElement && childrenElement) {
      // 親のプラスボタンの位置を取得
      const parentButtonRect = parentButton.nativeElement.getBoundingClientRect();
      const nodeRect = nodeEl.nativeElement.getBoundingClientRect();

      // 子のプラスボタンの位置を取得（最初の子ノードのプラスボタン）
      const firstChildNode = childrenElement.querySelector('.hierarchy-tree-view__node');
      const firstChildButton = firstChildNode?.querySelector('.hierarchy-tree-view__create-child-button') as HTMLElement;

          if (firstChildButton) {
      const firstChildButtonRect = firstChildButton.getBoundingClientRect();
      const _childrenRect = childrenElement.getBoundingClientRect();

      // 親のプラスボタン中央（親ノードからの相対位置）
      const parentButtonCenterX = parentButtonRect.left - nodeRect.left + parentButtonRect.width / 2;
      const parentButtonBottom = parentButtonRect.bottom - nodeRect.top;

      // 子のプラスボタンの位置（親ノードからの相対位置）
      const childButtonLeft = firstChildButtonRect.left - nodeRect.left;
      const _childButtonCenterX = firstChildButtonRect.left - nodeRect.left + firstChildButtonRect.width / 2;
      const childButtonCenterY = firstChildButtonRect.top - nodeRect.top + firstChildButtonRect.height / 2;

      // L字の線を描画
      // 横線: 親のプラスボタン中央から子のプラスボタンの左端まで（ボタンに被らないように短くする）
      const _horizontalLineLeft = parentButtonCenterX;
      const horizontalLineWidth = childButtonLeft - parentButtonCenterX; // 子のプラスボタンの左端まで
      const horizontalLineTop = childButtonCenterY; // 子のプラスボタンの中央の高さ

      // 縦線: 親のプラスボタン下端から横線の位置まで
      const verticalLineTop = parentButtonBottom;
      const verticalLineHeight = horizontalLineTop - parentButtonBottom;

      // 線のデータを保存（children要素からの相対位置で計算）
      const childrenRectRelative = childrenElement.getBoundingClientRect();
      const verticalLineLeft = parentButtonCenterX - (childrenRectRelative.left - nodeRect.left);
      const horizontalLineLeftRelative = parentButtonCenterX - (childrenRectRelative.left - nodeRect.left);
      const verticalLineTopRelative = verticalLineTop - (childrenRectRelative.top - nodeRect.top);
      const horizontalLineTopRelative = horizontalLineTop - (childrenRectRelative.top - nodeRect.top);

      this.connectorLineData.set(node.id, {
        left: verticalLineLeft, // 縦線のleft位置
        top: verticalLineTopRelative, // 縦線のtop位置
        width: horizontalLineWidth, // 横線の幅
        height: verticalLineHeight, // 縦線の高さ
        horizontalLeft: horizontalLineLeftRelative, // 横線のleft位置
        horizontalTop: horizontalLineTopRelative, // 横線のtop位置
      });
          }
        }
      }

      // 同じ階層のノード間の横線を描画
      if (index < nodeElementsArray.length - 1) {
        const currentNode = nodeEl.nativeElement;
        const nextNode = nodeElementsArray[index + 1].nativeElement;
        const currentNodeWrapper = currentNode.querySelector('.hierarchy-tree-view__node-wrapper') as HTMLElement;
        const nextNodeWrapper = nextNode.querySelector('.hierarchy-tree-view__node-wrapper') as HTMLElement;

        if (!currentNodeWrapper || !nextNodeWrapper) {
          return;
        }

        // プラスボタンまたはカードの中央位置を取得
        const currentButton = parentButtonsArray[index];
        const nextButton = parentButtonsArray[index + 1];
        const currentCard = currentNodeWrapper.querySelector('app-hierarchy-card') as HTMLElement;
        const nextCard = nextNodeWrapper.querySelector('app-hierarchy-card') as HTMLElement;

        if (!currentCard || !nextCard) {
          return;
        }

        const currentNodeWrapperRect = currentNodeWrapper.getBoundingClientRect();
        const nextNodeWrapperRect = nextNodeWrapper.getBoundingClientRect();
        const currentCardRect = currentCard.getBoundingClientRect();

        // プラスボタンがある場合はプラスボタンの中央、ない場合はカードの左端から少し右
        let currentCenterX: number;
        let currentCenterY: number;

        if (currentButton?.nativeElement && this.showCreateChildButton) {
          const currentButtonRect = currentButton.nativeElement.getBoundingClientRect();
          currentCenterX = currentButtonRect.left - currentNodeWrapperRect.left + currentButtonRect.width / 2;
          currentCenterY = currentButtonRect.top - currentNodeWrapperRect.top + currentButtonRect.height / 2;
        } else {
          // プラスボタンがない場合は、カードの左端から少し右（プラスボタンの位置と同じ）
          // プラスボタンのサイズは2rem（32px）、中央は1rem（16px）の位置
          const remInPixels = 16; // 1rem = 16px（デフォルト）
          currentCenterX = remInPixels; // プラスボタンの中央位置と同じ
          currentCenterY = currentCardRect.top - currentNodeWrapperRect.top + currentCardRect.height / 2;
        }

        // 次のノードの中央位置（現在のノードのwrapperからの相対位置で計算）
        let nextCenterX: number;
        if (nextButton?.nativeElement && this.showCreateChildButton) {
          const nextButtonRect = nextButton.nativeElement.getBoundingClientRect();
          // 次のノードのプラスボタンの中央位置を、現在のノードのwrapperからの相対位置で計算
          // 次のノードのwrapperの位置（現在のノードのwrapperからの相対位置）+ プラスボタンのwrapper内での位置 + プラスボタンの幅の半分
          const nextWrapperOffset = nextNodeWrapperRect.left - currentNodeWrapperRect.left;
          const nextButtonOffset = nextButtonRect.left - nextNodeWrapperRect.left;
          nextCenterX = nextWrapperOffset + nextButtonOffset + nextButtonRect.width / 2;
        } else {
          // プラスボタンがない場合は、次のノードのwrapperの位置 + プラスボタンの中央位置
          const remInPixels = 16; // 1rem = 16px（デフォルト）
          const nextWrapperOffset = nextNodeWrapperRect.left - currentNodeWrapperRect.left;
          nextCenterX = nextWrapperOffset + remInPixels;
        }

        // 横線の位置と幅を計算
        const siblingLineLeft = currentCenterX;
        const siblingLineWidth = nextCenterX - currentCenterX;
        const siblingLineTop = currentCenterY;

        // 線の幅が正の値の場合のみ設定
        if (siblingLineWidth > 0) {
          // 同じ階層の横線のデータを保存（node-wrapperからの相対位置）
          this.siblingLineData.set(node.id, {
            left: siblingLineLeft,
            top: siblingLineTop,
            width: siblingLineWidth,
          });

          // 同じ階層のプラスボタン同士を縦に繋ぐ線を計算
          if (currentButton?.nativeElement && nextButton?.nativeElement && this.showCreateChildButton) {
            // コンテナを取得（ViewChildで取得できない場合は、DOMから取得）
            const container = this.treeViewContainer?.nativeElement || 
                             currentNode.closest('.hierarchy-tree-view') as HTMLElement;
            
            if (!container) {
              return;
            }
            
            const currentButtonRect = currentButton.nativeElement.getBoundingClientRect();
            const nextButtonRect = nextButton.nativeElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // 現在のノードのプラスボタンの下端（hierarchy-tree-viewコンテナからの相対位置）
            const currentButtonBottom = currentButtonRect.bottom - containerRect.top;
            
            // 次のノードのプラスボタンの上端（hierarchy-tree-viewコンテナからの相対位置）
            const nextButtonTop = nextButtonRect.top - containerRect.top;
            
            // 縦線の位置と高さを計算
            // プラスボタンの中央位置を、hierarchy-tree-viewコンテナからの相対位置で計算
            const currentButtonCenterX = currentButtonRect.left - containerRect.left + currentButtonRect.width / 2;
            const verticalLineLeft = currentButtonCenterX; // プラスボタンの中央
            const verticalLineTop = currentButtonBottom; // 現在のプラスボタンの下端
            const verticalLineHeight = nextButtonTop - currentButtonBottom; // 次のプラスボタンの上端まで
            
            // 縦線の高さが正の値の場合のみ設定
            if (verticalLineHeight > 0) {
              this.siblingVerticalLineData.set(node.id, {
                left: verticalLineLeft,
                top: verticalLineTop,
                height: verticalLineHeight,
              });
            }
          }
        }
      }
    });

    this.cdr.detectChanges();
  }

  getConnectorLineLeft(nodeId: string): number {
    const data = this.connectorLineData.get(nodeId);
    return data?.left ?? 0;
  }

  getConnectorLineTop(nodeId: string): number {
    const data = this.connectorLineData.get(nodeId);
    return data?.top ?? 0;
  }

  getConnectorLineWidth(nodeId: string): number {
    const data = this.connectorLineData.get(nodeId);
    return data?.width ?? 0;
  }

  getConnectorLineHeight(nodeId: string): number {
    const data = this.connectorLineData.get(nodeId);
    return data?.height ?? 0;
  }

  getConnectorLineHorizontalLeft(nodeId: string): number {
    const data = this.connectorLineData.get(nodeId);
    return data?.horizontalLeft ?? 0;
  }

  getConnectorLineHorizontalTop(nodeId: string): number {
    const data = this.connectorLineData.get(nodeId);
    return data?.horizontalTop ?? 0;
  }

  // 同じ階層のノード間の横線の位置と幅を取得
  getSiblingLineLeft(nodeId: string): number {
    const data = this.siblingLineData.get(nodeId);
    return data?.left ?? 0;
  }

  getSiblingLineTop(nodeId: string): number {
    const data = this.siblingLineData.get(nodeId);
    return data?.top ?? 0;
  }

  getSiblingLineWidth(nodeId: string): number {
    const data = this.siblingLineData.get(nodeId);
    return data?.width ?? 0;
  }

  // 同じ階層の線を表示するかどうか（最後のノード以外）
  hasSiblingLine(nodeId: string): boolean {
    return this.siblingLineData.has(nodeId);
  }

  // 同じ階層の縦線の位置と高さを取得
  getSiblingVerticalLineLeft(nodeId: string): number {
    const data = this.siblingVerticalLineData.get(nodeId);
    return data?.left ?? 0;
  }

  getSiblingVerticalLineTop(nodeId: string): number {
    const data = this.siblingVerticalLineData.get(nodeId);
    return data?.top ?? 0;
  }

  getSiblingVerticalLineHeight(nodeId: string): number {
    const data = this.siblingVerticalLineData.get(nodeId);
    return data?.height ?? 0;
  }

  // 同じ階層の縦線を表示するかどうか
  hasSiblingVerticalLine(nodeId: string): boolean {
    return this.siblingVerticalLineData.has(nodeId);
  }

  onNodeClick(nodeId: string): void {
    this.nodeClicked.emit(nodeId);
  }

  onExpandToggle(nodeId: string): void {
    this.expandToggled.emit(nodeId);
    // 展開状態が変わったら線を更新
    setTimeout(() => {
      this.updateConnectorLines();
    }, 0);
  }

  onCreateChild(goalId: string): void {
    this.createChild.emit(goalId);
  }

  isExpanded(nodeId: string): boolean {
    return this.expandedIds.has(nodeId);
  }

  hasChildren(node: HierarchyTreeNode): boolean {
    return node.children && node.children.length > 0;
  }
}

