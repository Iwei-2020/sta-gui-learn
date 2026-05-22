import { debounce } from "lodash";
import React, { useEffect, useMemo, useRef, useState } from "react";

type FunctionalChildren = (width: number, height: number) => React.ReactNode;

interface IProps {
  children: FunctionalChildren;
  debounceEvent?: {
    enable?: boolean;
    interval?: number;
  };
}

/**
 * 根据外部容器的 size 变化同步传递给子组件
 * @attention 外部容器的 height 属性需要支持内部组件设置为 100%
 *
 * @param props
 * @returns
 */
function FullSizeKeep(
  props: IProps & Omit<React.HTMLAttributes<HTMLDivElement>, "children">
) {
  const { children, debounceEvent, ...restProps } = props;

  const debounceEventEnable = debounceEvent?.enable || debounceEvent?.interval;

  const [initWidth, setInitWidth] = useState(0);
  const [initHeight, setInitHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const debounceFn = debounceEventEnable ? debounce : (fn: any) => fn;
    const resizeObserver = new ResizeObserver(
      debounceFn(() => {
        const width = ref.current?.clientWidth ?? 0;
        const height = ref.current?.clientHeight ?? 0;
        setInitWidth(width);
        setInitHeight(height);
      }, debounceEvent?.interval || 300)
    );
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    setInitWidth(ref.current?.clientWidth ?? 0);
    setInitHeight(ref.current?.clientHeight ?? 0);
  }, []);

  if (typeof children !== "function") {
    throw new TypeError("FullSizeKeep 接受的 children 必须是一个函数");
  }

  const finalChildrenEl = useMemo(
    () => children(initWidth, initHeight),
    [initWidth, initHeight, children]
  );

  /**
   * 设置样式 overflow: hidden 是必要的，当 ref 节点因内部节点尺寸导致出现滚动条时，
   * 会导致 ResizeObserver 认为 ref 节点尺寸变更从而导致重新计算宽高。
   */
  return (
    <div
      {...restProps}
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...(restProps.style || {}),
      }}
    >
      {finalChildrenEl}
    </div>
  );
}

export default FullSizeKeep;
