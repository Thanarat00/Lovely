import { Component } from "react";
import { STORAGE_KEY } from "../lib/progress.js";

export default class Guard extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (this.state.failed) {
      return (
        <div className="boot">
          <p className="lede">ฉากนี้สะดุด เริ่มใหม่ได้เลย</p>
          <button type="button" className="btn primary" onClick={this.reset}>
            เริ่มใหม่
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
