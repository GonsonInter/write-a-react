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
 * 判断属性是不是 事件
 * @param {*} attr 属性名
 */
const isEvent = attr => attr.startsWith("on");

/**
 * 是否为普通属性（非children）
 * @param {*} attr 属性名称
 * @returns boolean
 */
const isProperty = attr => attr !== "children" && !isEvent(attr);

const isGone = (prev, next) => key => !(key in next);
const isNew = (prev, next) => key => !(key in prev) && key in next;
const isChanged = (prev, next) => key =>
  key in prev && key in next && prev[key] !== next[key];

let workInProgress = null;
let workInProgressRoot = null;
let currentHookFiber = null;
let currentHookIndex = 0;

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

const updateDom = (stateNode, prevProps, nextProps) => {
  // remove old or changed event binding
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        isGone(prevProps, nextProps)(key) ||
        isChanged(prevProps, nextProps)(key)
    )
    .forEach(key => {
      const eventName = key.toLowerCase().substring(2);
      stateNode.removeEventListener(eventName, prevProps[key]);
    });

  // remove deleted props
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(key => {
      stateNode[key] = "";
    });

  // set new or changed props
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(
      key =>
        isNew(prevProps, nextProps)(key) || isChanged(prevProps, nextProps)(key)
    )
    .forEach(key => {
      stateNode[key] = nextProps[key];
    });

  // add new or event binding
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(
      key =>
        isNew(prevProps, nextProps)(key) || isChanged(prevProps, nextProps)(key)
    )
    .forEach(key => {
      const eventName = key.toLocaleLowerCase().substring(2); // onClick => onclick
      stateNode.addEventListener(eventName, nextProps[key]);
    });
};

const commitDeletion = (fiber, parentStateNode) => {
  if (fiber.stateNode) {
    parentStateNode.contains(fiber.stateNode) &&
      parentStateNode.removeChild(fiber.stateNode);
  } else {
    commitDeletion(fiber.child, parentStateNode);
  }
};

const commitWork = fiber => {
  let domParentFiber = null;

  if (!fiber) return;

  if (fiber.return) {
    /** 函数式组件的 stateNode === null，需要向上查找，直到有一个节点存在 stateNode */
    domParentFiber = fiber.return;
    while (!domParentFiber.stateNode) {
      domParentFiber = domParentFiber.return;
    }
  }

  if (fiber.effectTag === "PLACEMENT" && fiber.stateNode) {
    // set dom props
    // 遍历 children，绑定属性和事件

    updateDom(fiber.stateNode, {}, fiber.props);

    // append dom
    domParentFiber.stateNode.appendChild(fiber.stateNode);
  } else if (fiber.effectTag === "UPDATE") {
    updateDom(fiber.stateNode, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParentFiber.stateNode);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const commitRoot = () => {
  workInProgressRoot.deletions.forEach(commitWork);
  commitWork(workInProgressRoot.current.alternate.child);

  workInProgressRoot.current = workInProgressRoot.current.alternate;
  workInProgressRoot.current.alternate = null;
};

const reconcileChildren = (fiber, children) => {
  /** 初始化 children 的 fiber */
  let prevSibling = null;

  /** mount 阶段，oldFiber 为空，update 阶段为上一次的值 */
  let oldFiber = fiber.alternate?.child;

  // oldFiber [1,2,3]  newFiber [1,2]
  // fiber.props.children.forEach((child, index) => {

  let index = 0;
  while (index < fiber.props.children.length || oldFiber) {
    const child = fiber.props.children[index];

    let newFiber = null;

    let sameType = oldFiber && child && child.type === oldFiber.type;

    if (child && !sameType) {
      // mount/placement
      newFiber = {
        type: child.type,
        stateNode: null,
        props: child.props,
        return: fiber,
        alternate: null,
        child: null,
        sibling: null,
        effectTag: "PLACEMENT",
      };
    } else if (sameType) {
      // update
      newFiber = {
        type: child.type,
        stateNode: oldFiber.stateNode,
        props: child.props,
        return: fiber,
        alternate: oldFiber,
        child: null,
        sibling: null,
        effectTag: "UPDATE",
      };
    } else if (!sameType && oldFiber) {
      // delete
      oldFiber.effectTag = "DELETION";
      workInProgressRoot.deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling && (prevSibling.sibling = newFiber);
    }

    prevSibling = newFiber;

    index++;
  }
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

    currentHookFiber = fiber;
    currentHookFiber.memorizedState = [];
    currentHookIndex = 0;

    fiber.props.children = [fiber.type(fiber.props)];
  } else {
    /** 处理 Host 组件 */
    if (!fiber.stateNode) {
      fiber.stateNode =
        fiber.type === "HostText"
          ? document.createTextNode("")
          : document.createElement(fiber.type);
    }
  }

  reconcileChildren(fiber, fiber.props.children);

  /** 返回下一个要处理的 fiber */
  return getNextFiber(fiber);
};

const workloop = () => {
  while (workInProgress) {
    workInProgress = performUnitOfWork(workInProgress);
  }

  /** 渲染完成后，切换 alternate 到主分支 */
  if (!workInProgress && workInProgressRoot.current.alternate) {
    commitRoot();
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
    workInProgressRoot.deletions = [];
    workInProgress = workInProgressRoot.current.alternate;

    window.requestIdleCallback(workloop);
  }
}

const createRoot = container => {
  return new AReactDomRoot(container);
};

const useState = initialState => {
  const oldHook =
    currentHookFiber.alternate?.memorizedState?.[currentHookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initialState,
    queue: [],
    dispatch: oldHook ? oldHook.dispatch : null,
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = typeof action === "function" ? action(hook.state) : action;
  });

  /** hook 中存在 setState 方法则复用，否则新建 */
  const setState = hook.dispatch
    ? hook.dispatch
    : action => {
        hook.queue.push(action);

        // re-render
        workInProgressRoot.current.alternate = {
          stateNode: workInProgressRoot.containerInfo,
          props: workInProgressRoot.current.props,
          alternate: workInProgressRoot.current, // 交换 current 和 alternate 分枝
        };

        workInProgress = workInProgressRoot.current.alternate;
        workInProgressRoot.deletions = [];
        window.requestIdleCallback(workloop);
      };

  currentHookFiber.memorizedState.push(hook);
  currentHookIndex++;

  return [hook.state, setState];
};

const useReducer = (reducer, initialState) => {
  const [state, setState] = useState(initialState);

  const dispatch = action => {
    setState(state => reducer(state, action));
  };

  return [state, dispatch];
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

export default { createElement, createRoot, act, useState, useReducer };
