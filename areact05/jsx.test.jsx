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

describe("Hooks", () => {
  it("it should render useState", async () => {
    const container = document.createElement("div");

    const globalObject = {};

    const App = () => {
      const [count, setCount] = AReact.useState(100);

      globalObject.count = count;
      globalObject.setCount = setCount;

      return <div>{count}</div>;
    };

    const root = AReact.createRoot(container);

    await act(() => {
      root.render(<App />);
    });

    await act(() => {
      globalObject.setCount(count => count + 1);
    });
    expect(globalObject.count).toBe(101);

    await act(() => {
      globalObject.setCount(globalObject.count + 1);
    });

    expect(globalObject.count).toBe(102);
  });

  it("it should render useReducer", async () => {
    const container = document.createElement("div");

    const globalObject = {};

    const reducer = (state, action) => {
      switch (action.type) {
        case "add":
          return state + 1;
        case "sub":
          return state - 1;
      }
    };

    const App = () => {
      const [count, dispatch] = AReact.useReducer(reducer, 100);

      globalObject.count = count;
      globalObject.dispatch = dispatch;

      return <div>{count}</div>;
    };

    const root = AReact.createRoot(container);

    await act(() => {
      root.render(<App />);
    });

    await act(() => {
      globalObject.dispatch({ type: "add" });
      globalObject.dispatch({ type: "add" });
    });
    expect(globalObject.count).toBe(102);

    await act(() => {
      globalObject.dispatch({ type: "sub" });
    });

    expect(globalObject.count).toBe(101);
  });
});
