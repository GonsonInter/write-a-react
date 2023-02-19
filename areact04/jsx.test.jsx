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

    console.log(JSON.stringify(element));

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
