import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F0] flex flex-col items-center justify-center p-6 text-center font-mono">
          <div className="max-w-md w-full bg-white border-3 border-[#0F172A] rounded-2xl p-6 shadow-[6px_6px_0px_#0F172A] flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FF4757] border-2 border-[#0F172A] flex items-center justify-center text-white text-2xl shadow-[3px_3px_0px_#0F172A]">
              !
            </div>
            <h1 className="text-xl font-black text-[#0F172A]">Something went wrong</h1>
            <p className="text-xs text-[#64748B] font-sans">
              CodeArena encountered an unexpected error. Don't worry, your progress is safe.
            </p>
            {this.state.error && (
              <div className="w-full text-left bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl p-3 text-xs text-[#0F172A] overflow-x-auto max-h-32">
                <code>{this.state.error.message || String(this.state.error)}</code>
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 bg-[#FFDF2B] hover:bg-[#FACC15] text-[#0F172A] font-black rounded-xl border-2 border-[#0F172A] shadow-[3px_3px_0px_#0F172A] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              Reload CodeArena
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
