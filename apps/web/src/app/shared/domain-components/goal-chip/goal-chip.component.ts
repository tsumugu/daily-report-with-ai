import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent } from '../../ui';

@Component({
  selector: 'app-goal-chip',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './goal-chip.component.html',
  styleUrl: './goal-chip.component.scss',
})
export class GoalChipComponent {
  @Input() goalId!: string;
  @Input() goalName!: string;
  @Input() showRemoveButton = false;
  @Input() size: 'small' | 'medium' = 'medium';
  @Input() clickable = true;

  @Output() remove = new EventEmitter<void>();

  private readonly routerService = inject(Router);

  get displayName(): string {
    const MAX_LENGTH = 20;
    if (this.goalName.length <= MAX_LENGTH) {
      return this.goalName;
    }
    return this.goalName.substring(0, MAX_LENGTH) + '...';
  }

  get showTooltip(): boolean {
    return this.goalName.length > 20;
  }

  onChipClick(): void {
    if (this.clickable && !this.showRemoveButton) {
      this.routerService.navigate(['/goals', this.goalId]);
    }
  }

  onRemoveClick(event: Event): void {
    event.stopPropagation();
    this.remove.emit();
  }
}

