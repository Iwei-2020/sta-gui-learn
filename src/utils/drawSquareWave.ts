/**
 * 方波绘制方法
 * @param ctx Canvas上下文
 * @param canvasWidth Canvas画布宽度
 * @param riseTime 上升沿位置
 * @param fallTime 下降沿位置
 * @param period 绘制的周期大小
 * @param periodNum 周期数量
 * @param highY 高电平Y轴位置
 * @param lowY 低电平Y轴位置
 */
export const drawSquareWave = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  riseTime: number,
  fallTime: number,
  period: number,
  periodNum: number = 2,
  highY: number,
  lowY: number
) => {
  ctx.strokeStyle = "rgba(241,243,255,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();

  const totalWidth = period * periodNum;
  const scale = (canvasWidth - 4) / totalWidth;

  for (let cycle = 0; cycle < periodNum; cycle++) {
    const startX = cycle * period * scale;
    const endX = startX + period * scale;

    const riseX = startX + riseTime * scale;
    const fallX = startX + fallTime * scale;

    // 低电平
    ctx.moveTo(startX, lowY);
    ctx.lineTo(fallX, lowY);

    //上升沿
    ctx.lineTo(fallX, highY);

    // 高电平
    ctx.lineTo(endX, highY);

    //下降沿
    if (cycle < periodNum - 1) {
      ctx.lineTo(endX, lowY);
    }
  }

  ctx.stroke(); // 执行绘制
};
