import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = { children: ReactNode };

type State = { hasError: boolean; message: string | null };

export class RegistrationErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'خطأ غير متوقع في النموذج';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('[RegistrationForm]', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Card className="mx-auto max-w-lg border-destructive/30 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
          </div>
          <CardTitle>تعذّر عرض خطوة التسجيل</CardTitle>
          <CardDescription>
            حدث خطأ أثناء تحميل النموذج. لم يُفقد ما أدخلته إن كان المتصفح يحتفظ بالجلسة — جرّب إعادة التحميل.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          {this.state.message ? (
            <p className="text-center text-xs text-muted-foreground font-mono" dir="ltr">
              {this.state.message}
            </p>
          ) : null}
          <Button type="button" onClick={this.handleRetry} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            إعادة تحميل الصفحة
          </Button>
        </CardContent>
      </Card>
    );
  }
}
