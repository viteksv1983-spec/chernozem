import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'Inter', system-ui, sans-serif";

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Check if fallback was explicitly provided (including null/false/0)
      // Using 'in' operator so that <ErrorBoundary fallback={null}> renders nothing
      // instead of the full error page.
      if ('fallback' in this.props) return this.props.fallback;

      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#0d1a0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: SANS,
            padding: "24px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "440px" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>

            <h1
              style={{
                fontFamily: SERIF,
                fontSize: "26px",
                fontWeight: 700,
                color: "#f5f0e8",
                marginBottom: "12px",
              }}
            >
              Щось пішло не так
            </h1>

            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.7,
                marginBottom: "28px",
              }}
            >
              Сторінка зіткнулась з неочікуваною помилкою. Спробуйте перезавантажити.
            </p>

            {this.state.error && (
              <pre
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "11px",
                  color: "#f87171",
                  textAlign: "left",
                  overflowX: "auto",
                  marginBottom: "24px",
                  fontFamily: "monospace",
                }}
              >
                {this.state.error.message}
              </pre>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: "13px 24px",
                  background: "linear-gradient(135deg, #3a7a57, #2d6045)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: SANS,
                  boxShadow: "0 4px 16px rgba(58,122,87,0.35)",
                }}
              >
                Перезавантажити сторінку
              </button>

              <a
                href="tel:+380981116059"
                style={{
                  padding: "13px 24px",
                  background: "rgba(255,255,255,0.06)",
                  color: "#7ee8b2",
                  border: "1px solid rgba(126,232,178,0.2)",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: SANS,
                  textDecoration: "none",
                }}
              >
                📞 Зателефонувати
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}