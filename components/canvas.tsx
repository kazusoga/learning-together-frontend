"use client";

import { useEffect } from "react";

export default function Canvas({ channel }: { channel: RTCDataChannel }) {
  console.log("canvasがレンダリングされました！");
  let ctx: CanvasRenderingContext2D;

  const intializeCanvas = () => {
    // キャンバスのサイズを設定する
    const canvas = document.getElementById("whiteboard") as HTMLCanvasElement;
    canvas.width = 500;
    canvas.height = 500;

    // ホワイトボードにマウスで描画できるようにする
    ctx = canvas.getContext("2d");

    // マウスの座標を取得する
    let x: number;
    let y: number;

    // マウスが押されているかどうか
    let isDown = false;

    // マウスが押された時の処理
    const mouseDown = (e: MouseEvent) => {
      // マウスが押されている状態にする
      isDown = true;

      // マウスの座標を取得する
      x = e.offsetX;
      y = e.offsetY;
    };

    // マウスが動いた時の処理
    const mouseMove = (e: MouseEvent) => {
      // マウスが押されていなければ処理を中断する
      if (!isDown) return;

      // マウスの座標を取得する
      const x2 = e.offsetX;
      const y2 = e.offsetY;

      // 線を描画する
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // 通信相手に送信する
      console.log("channel はありますか！", channel);
      if (channel) {
        console.log("いけえええええええ！！！");
        channel.send(JSON.stringify({ x, y, x2, y2 }));
      }

      // マウスの座標を更新する
      x = x2;
      y = y2;
    };

    // マウスが離れた時の処理
    const mouseUp = () => {
      // マウスが押されていない状態にする
      isDown = false;
    };

    // マウスがキャンバスから離れた時の処理
    const mouseOut = () => {
      // マウスが押されていない状態にする
      isDown = false;
    };

    // イベントを登録する
    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mousemove", mouseMove);
    canvas.addEventListener("mouseup", mouseUp);
    canvas.addEventListener("mouseout", mouseOut);
  };

  useEffect(() => {
    console.log("canvas がマウントされました！");
    // ホワイトボードを初期化する
    intializeCanvas();
  }, [channel]);

  return <canvas id="whiteboard"></canvas>;
}
