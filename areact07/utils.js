/**
 * @author gsjt
 * @description 工具方法
 */


/**
 * 格式化 Style Object
 */
export const setStyleByObject = (style, styleObject) => {
  if (!styleObject || !Reflect.ownKeys(styleObject).length) {
    return ""
  }

  Reflect.ownKeys(styleObject).forEach(key => {
    const styleValue = styleObject[key]
    if (typeof styleValue === 'string') {
      style[key] = styleValue
    }
    if (typeof styleValue === 'number') {
      // 以下属性接受不带单位的数字
      if (['opacity', 'zIndex', 'lineHeight', 'flexGrow', 'flexShrink', 'order', 'fontWeight'].includes(key))
        style[key] = styleValue
      else
        style[key] = `${styleValue}px`
    }
  })
}