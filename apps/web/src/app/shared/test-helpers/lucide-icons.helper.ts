import { importProvidersFrom } from '@angular/core';
import {
  LucideAngularModule,
  FileText,
  Clipboard,
  ChartBar,
  Target,
  Sparkles,
  Lightbulb,
  Calendar,
  TriangleAlert,
  Eye,
  EyeOff,
  Heart,
  Pin,
  Check,
  Pencil,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
} from 'lucide-angular';

/**
 * テスト用のLucideAngularModuleプロバイダー
 * すべてのテストで使用するアイコンを提供します
 */
export function provideLucideIconsForTesting() {
  return importProvidersFrom(
    LucideAngularModule.pick({
      FileText,
      Clipboard,
      ChartBar,
      Target,
      Sparkles,
      Lightbulb,
      Calendar,
      TriangleAlert,
      Eye,
      EyeOff,
      Heart,
      Pin,
      Check,
      Pencil,
      ChevronDown,
      ChevronRight,
      Plus,
      X,
    })
  );
}

