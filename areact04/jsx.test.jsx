import { describe, it, expect } from "vitest";
import AReact from "./AReact";

const { act } = AReact;

describe("AReact JSX", () => {
  it("It should render JSX", async () => {
    const container = document.createElement("div");

    const element = (
      <div id="foo">
        <div id="bar"></div>
        <button></button>
      </div>
    );

    const root = AReact.createRoot(container);

    await act(() => {
      root.render(element);
    });

    expect(container.innerHTML).toBe(
      '<div id="foo"><div id="bar"></div><button></button></div>'
    );
  });

  it("It should render JSX with string", async () => {
    const container = document.createElement("div");

    const element = (
      <div id="foo">
        <div id="bar">hello string</div>
        <button>add</button>
      </div>
    );

    const root = AReact.createRoot(container);

    await act(() => {
      root.render(element);
    });

    expect(container.innerHTML).toBe(
      '<div id="foo"><div id="bar">hello string</div><button>add</button></div>'
    );
  });

  it("It should render JSX with different props", async () => {
    const container = document.createElement("div");

    const element = (
      <div id="foo" className="foo-class">
        <div id="bar" className="bar-class">
          hello string
        </div>
        <button>add</button>
      </div>
    );

    const root = AReact.createRoot(container);

    await act(() => {
      root.render(element);
    });

    expect(container.innerHTML).toBe(
      '<div id="foo" class="foo-class"><div id="bar" class="bar-class">hello string</div><button>add</button></div>'
    );
  });
});

describe("AReact Concurrent", () => {
  it("ite should render jsx in async", async () => {
    const container = document.createElement("div");

    const element = (
      <div id="foo">
        <div id="bar"></div>
        <button></button>
      </div>
    );

    const root = AReact.createRoot(container);

    await act(() => {
      root.render(element);
      expect(container.innerHTML).toBe("");
    });

    expect(container.innerHTML).toBe(
      '<div id="foo"><div id="bar"></div><button></button></div>'
    );
  });

  it("ite should render jsx in async", async () => {
    const container = document.createElement("div");
    const element = (
      <div id="foo">
        <div id="bar"></div>
        <button></button>
      </div>
    );

    const root = AReact.createRoot(container);

    await act(() => {
      root.render(element);
      expect(container.innerHTML).toBe("");
    });

    expect(container.innerHTML).toBe(
      '<div id="foo"><div id="bar"></div><button></button></div>'
    );
  });
});

describe("Function Component", () => {
  it("it should render function component", async () => {
    const container = document.createElement("div");

    const App = () => {
      return (
        <div id="foo">
          <div id="bar"></div>
          <button></button>
        </div>
      );
    };

    const root = AReact.createRoot(container);

    await act(() => {
      root.render(<App />);
      expect(container.innerHTML).toBe("");
    });

    expect(container.innerHTML).toBe(
      '<div id="foo"><div id="bar"></div><button></button></div>'
    );
  });

  it("it should render nested function component", async () => {
    const container = document.createElement("div");

    const App = props => {
      return (
        <div id="foo">
          <div id="bar">{props.title}</div>
          <button></button>
          {props.children}
        </div>
      );
    };

    const root = AReact.createRoot(container);

    await act(() => {
      root.render(
        <App title="main title">
          <App title="sub title" />
        </App>
      );
      expect(container.innerHTML).toBe("");
    });

    console.log(container.innerHTML);

    expect(container.innerHTML).toBe(
      '<div id="foo"><div id="bar">main title</div><button></button><div id="foo"><div id="bar">sub title</div><button></button></div></div>'
    );
  });
});
