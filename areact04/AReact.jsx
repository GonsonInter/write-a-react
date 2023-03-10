/**
 * createElement 函数
 */

import "../requestIdleCallbackPolyFill";

const createTextElement = text => {
  return {
    type: "HostText",
    props: {
      nodeValue: text,
      children: [],
    },
  };
};

const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.flat().map(child => {
        return typeof child !== "object" ? createTextElement(child) : child;
      }),
    },
  };
};

/**
 * 是否为普通属性（非children）
 * @param {*} attr 属性名称
 * @returns boolean
 */
const isProperty = attr => attr !== "children";

let workInProgress = null;
let workInProgressRoot = null;

/** 根据当前的 fiber 获取下一个要处理的 fiber */
const getNextFiber = fiber => {
  /**
   * fiber 的遍历顺序：
   * - 先遍历 child
   * - 再遍历 sibling
   * - 最后 return 并找下一个 sibling
   */

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    else nextFiber = nextFiber.return;
  }

  return null;
};

const performUnitOfWork = fiber => {
  /** 处理当前 fiber： 创建 DOM ，设置 props */
  const isFunctionComponent = fiber.type instanceof Function;

  /**
   * 对于函数式组件：
   * - stateNode === null
   * - 函数式组件的 children 不是来自于 props.children，而是自己的返回值
   */

  if (isFunctionComponent) {
    /** 处理函数式组件 */
    fiber.props.children = [fiber.type(fiber.props)];
  } else {
    /** 处理 Host 组件 */
    if (!fiber.stateNode) {
      fiber.stateNode =
        fiber.type === "HostText"
          ? document.createTextNode("")
          : document.createElement(fiber.type);

      Object.keys(fiber.props)
        .filter(isProperty)
        .forEach(key => {
          fiber.stateNode[key] = fiber.props[key];
        });
    }

    /**  插入当前 dom 到 parent */
    if (fiber.return) {
      /** 函数式组件的 stateNode === null，需要向上查找，直到有一个节点存在 stateNode */
      let domParentFiber = fiber.return;
      while (!domParentFiber.stateNode) {
        domParentFiber = domParentFiber.return;
      }

      domParentFiber.stateNode.appendChild(fiber.stateNode);
    }
  }

  /** 初始化 children 的 fiber */
  let prevSibling = null;
  fiber.props.children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      stateNode: null,
      props: child.props,
      return: fiber,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
  });

  /** 返回下一个要处理的 fiber */
  return getNextFiber(fiber);
};

const workloop = () => {
  while (workInProgress) {
    workInProgress = performUnitOfWork(workInProgress);
  }
};

class AReactDomRoot {
  _internalRoot = null;

  constructor(container) {
    this._internalRoot = {
      current: null,
      containerInfo: container,
    };
  }

  render(element) {
    this._internalRoot.current = {
      alternate: {
        stateNode: this._internalRoot.containerInfo,
        props: {
          children: [element],
        },
      },
    };

    workInProgressRoot = this._internalRoot;
    workInProgress = workInProgressRoot.current.alternate;

    window.requestIdleCallback(workloop);
  }
}

const createRoot = container => {
  return new AReactDomRoot(container);
};

const act = callback => {
  callback();
  return new Promise(resolve => {
    const loop = () => {
      if (workInProgress) {
        window.requestIdleCallback(loop);
      } else {
        resolve();
      }
    };
    loop();
  });
};

export default { createElement, createRoot, act };
