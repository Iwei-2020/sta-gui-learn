import { drawSquareWave } from "@/utils/drawSquareWave";
import styles from "./index.less";
import pinSource from "@/assets/Icon/pinSource.png";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IEndClockInfo,
  IPathDelay,
  IRequiredInfo,
  IStartClockInfo,
  IWaveform,
} from "./interface";
import { Button } from "antd";
import { flexLayoutManager } from "@/mobx";

const WaveformPage = (props: IWaveform) => {
  const { winName, summaryId, pathId, singlePathInfo } = props;
  const isValid = flexLayoutManager.isTabValid(winName);
  const isDisabled = !isValid;
  const waveRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [startClock, setStartClock] = useState<IStartClockInfo>();
  const [endClock, setEndClock] = useState<IEndClockInfo>();
  const [pathDelayInfo, setPathDelayInfo] = useState<IPathDelay>();
  const [requiredInfo, setRequiredInfo] = useState<IRequiredInfo>();
  const [slackValue, setSlackValue] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawWaveform = useCallback(() => {
    if (width <= 0 || height <= 0) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    let totalWidth: number = 0;
    let periodNum: number = 0;
    if (startClock && pathDelayInfo) {
      const pathMaxValue = Math.ceil(
        pathDelayInfo.startPosition + pathDelayInfo.value + startClock.period
      );
      totalWidth =
        pathMaxValue < startClock.period * 2
          ? Math.ceil(startClock.period * 2)
          : pathMaxValue;

      periodNum = Math.ceil(totalWidth / startClock.period);

      drawSquareWave(
        ctx,
        width,
        startClock.risePosition,
        startClock.declinePosition,
        startClock.period,
        Math.ceil(totalWidth / startClock.period), // 绘制的周期数
        height / 6,
        height / 3
      );

      ctx.fillStyle = "#f1f3ff";
      const startClockName = startClock.clockName;
      ctx.textAlign = "left";
      ctx.fillText(startClockName, 4, height / 3 + 16);
    }

    if (endClock) {
      drawSquareWave(
        ctx,
        width,
        endClock.risePosition,
        endClock.declinePosition,
        endClock.period,
        Math.ceil(totalWidth / endClock.period), // 绘制的周期数
        (height * 2) / 3,
        (height * 5) / 6
      );

      ctx.fillStyle = "#f1f3ff";
      const endClockName = endClock.clockName;
      ctx.textAlign = "left";
      ctx.fillText(endClockName, 4, (height * 5) / 6 + 16);
    }

    const scale = totalWidth > 0 ? (width - 4) / totalWidth : 1;

    // path delay info
    if (pathDelayInfo && requiredInfo && startClock) {
      const pathStartX =
        (pathDelayInfo.startPosition + startClock?.declinePosition) * scale;
      const pathValue = pathDelayInfo.value * scale;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(106, 241, 251, 0.85)";
      ctx.lineWidth = 2;

      // path delay 起点竖直线
      ctx.moveTo(pathStartX, height / 3 + 8);
      ctx.lineTo(pathStartX, height / 3 + 40);

      // path delay横线
      const pathEndX = pathStartX + pathValue;
      ctx.moveTo(pathStartX, height / 3 + 24);
      ctx.lineTo(pathEndX, height / 3 + 24);

      // 绘制箭头
      ctx.moveTo(pathEndX - 8, height / 3 + 24 - 4);
      ctx.lineTo(pathEndX, height / 3 + 24);

      ctx.moveTo(pathEndX - 8, height / 3 + 24 + 4);
      ctx.lineTo(pathEndX, height / 3 + 24);

      // path delay 终点竖直线
      ctx.moveTo(pathEndX, height / 3 + 8);
      ctx.lineTo(pathEndX, height / 2 + 16);

      ctx.fillStyle = "rgba(106, 241, 251, 0.85)";
      ctx.fillText("path delay", pathStartX + 64, height / 3 + 16);
      ctx.fillText(`${pathDelayInfo.value}`, pathStartX + 40, height / 3 + 40);

      // required
      const requiredStartX =
        (requiredInfo.startPostion + startClock.declinePosition) * scale;
      const requiredEndX =
        (requiredInfo.endPosition + startClock.declinePosition) * scale;

      ctx.moveTo(requiredStartX, height / 2 + 16);
      ctx.lineTo(requiredEndX, height / 2 + 16);

      // 绘制箭头
      if (periodNum && periodNum > 4) {
        ctx.moveTo(requiredEndX + 8, height / 2 + 16 - 4);
        ctx.lineTo(requiredEndX, height / 2 + 16);

        ctx.moveTo(requiredEndX + 8, height / 2 + 16 + 4);
        ctx.lineTo(requiredEndX, height / 2 + 16);
      }

      ctx.fillText("required", requiredEndX - 16, height / 2 + 40);
      ctx.stroke();

      // required 起点竖直线
      ctx.strokeStyle = "#5549ed";
      ctx.beginPath();
      ctx.moveTo(requiredStartX, height / 2);
      ctx.lineTo(requiredStartX, (2 * height) / 3 - 6);
      ctx.stroke();

      //required 终点竖直线
      ctx.strokeStyle = "#6af1fb";
      ctx.beginPath();
      ctx.moveTo(requiredEndX, height / 2 - 16);
      ctx.lineTo(requiredEndX, height / 2 + 32);
      ctx.stroke();

      // slack
      ctx.strokeStyle = "#a82d39";
      ctx.beginPath();
      ctx.moveTo(pathEndX, height / 2 - 6);
      ctx.lineTo(requiredEndX, height / 2 - 6);

      // 绘制箭头
      if (periodNum && periodNum > 4) {
        // 左侧箭头
        ctx.moveTo(requiredEndX, height / 2 - 6);
        ctx.lineTo(requiredEndX + 8, height / 2 - 6 - 4);

        ctx.moveTo(requiredEndX, height / 2 - 6);
        ctx.lineTo(requiredEndX + 8, height / 2 - 6 + 4);

        // 右侧箭头
        ctx.moveTo(pathEndX - 8, height / 2 - 6 - 4);
        ctx.lineTo(pathEndX, height / 2 - 6);

        ctx.moveTo(pathEndX - 8, height / 2 - 6 + 4);
        ctx.lineTo(pathEndX, height / 2 - 6);
      }

      ctx.stroke();

      ctx.fillStyle = "#a82d39";
      ctx.fillText(`slack: ${slackValue}`, requiredEndX + 4, height / 2 - 16);
    }

    ctx.stroke();
  }, [
    width,
    height,
    startClock,
    endClock,
    pathDelayInfo,
    requiredInfo,
    slackValue,
  ]);

  // 容器长宽变化后更改schematic的对应长宽;
  useEffect(() => {
    if (!waveRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      const width = waveRef.current?.clientWidth ?? 0;
      const height = waveRef.current?.clientHeight ?? 0;
      // 减去padding的各8px
      setWidth(width - 16);
      // 减去padding的各8px, 上面按钮高度32px, 下面内容显示区32px
      setHeight(height - 16 - 32 - 32);
    });
    resizeObserver.observe(waveRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  useEffect(() => {
    // waveform interface
    const fetchData = async () => {
      const waveformRes = await window.electronAPI.request({
        type: "waveform",
        summaryId,
        pathId,
        winName,
      });
      if (waveformRes.data && Array.isArray(waveformRes.data)) {
        setStartClock(waveformRes.data[0].startClock);
        setEndClock(waveformRes.data[0].endClock);
        setPathDelayInfo(waveformRes.data[0].pathDelay);
        setRequiredInfo(waveformRes.data[0].required);
        setSlackValue(waveformRes.data[0].slackValue);
      }
    };
    fetchData();
  }, []);

  const switchTab = () => {
    if (isValid) {
      flexLayoutManager.switchToTab(winName);
    }
  };

  return (
    <div className={styles["waveform-page"]} ref={waveRef}>
      <Button
        className={styles["waveform-btn"]}
        onClick={switchTab}
        disabled={isDisabled}
      >
        {winName}
        <img src={pinSource} className={styles["btn-icon"]} />
      </Button>
      <canvas
        id="waveCanvas"
        width={width}
        height={height}
        style={{ background: "#040404" }}
        ref={canvasRef}
      ></canvas>
      <div className={styles["waveform-info"]}>
        {`Path from '${singlePathInfo.startpoint}' to '${singlePathInfo.endpoint}' slack=${singlePathInfo.slack}`}{" "}
      </div>
    </div>
  );
};

export default WaveformPage;
