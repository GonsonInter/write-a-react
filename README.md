## 手写 React 核心流程

### TDD

基于 Vite 和 Vitest，测试驱动开发。

- 是什么： TDD （Test-Driven Development），敏捷开发中的一项核心实践和技术，也是一种设计方法论
- 怎么做：在开发功能之前，先编写单元测试用例代码，测试用过则表示开发完成
- 为什么：
  - 主流：开源项目的主流开发模式
  - 与解决问题的思路相同：先写预期，后编码达到预期
  - 高质量：编码完成后自动化测试覆盖，始终保证代码质量
  - 心流：容易进入心流，全程在 VSCodo 中完成，不需要切换浏览器，保持专注

### JSX 与同步模式

### Fiber 与并发模式

基于 requestIdleCallback 的实现

### 函数式组件

### useState 和 useReducer

### Reconciler 协调器

DOM diff，render 和 commit 拆分

---

> 以上是课程内容，分别对应 areact 01 - 06

> 以下为自己实现部分，分别对应 areact 07 - 09

---

### Style Object
