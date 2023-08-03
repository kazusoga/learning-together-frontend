"use client";

import { useRef, useEffect, use } from "react";

let canvas: HTMLCanvasElement;

let x: number = 0;
let y: number = 0;
let x2: number = 0;
let y2: number = 0;

let isDown: boolean = false;

let cursorType: "pencil" | "eraser" = "pencil";

let ctx: CanvasRenderingContext2D | null;

export default function Canvas({ channels }: { channels: RTCDataChannel[] }) {
  console.log("canvasがレンダリングされました！");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const intializeCanvas = () => {
    // キャンバスのサイズを設定する
    // canvas = canvasRef.current;
    canvas = document.getElementById("whiteboard") as HTMLCanvasElement;
    canvas.width = 500;
    canvas.height = 500;

    ctx = canvas.getContext("2d");
  };

  useEffect(() => {
    console.log("canvas がマウントされました！");
    // ホワイトボードを初期化する
    intializeCanvas();
  }, [channels]);

  const changeCursorToPencil = () => {
    console.log("ペンを選択しました！");
    canvas.style.cursor = "default";

    cursorType = "pencil";
  };

  const changeCursorToEraser = () => {
    console.log("消しゴムを選択しました！");
    canvas.style.cursor = "pointer";

    cursorType = "eraser";
  };

  const mouseDown: React.MouseEventHandler<HTMLCanvasElement> = (
    e: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>
  ) => {
    // マウスが押されている状態にする
    isDown = true;

    // マウスの座標を取得する
    console.log(
      "マウスが押されました！",
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
    x = e.nativeEvent.offsetX;
    y = e.nativeEvent.offsetY;
  };

  // マウスが動いた時の処理
  const mouseMove: React.MouseEventHandler = (e) => {
    // マウスが押されていなければ処理を中断する
    if (!isDown) return;

    // マウスの座標を取得する
    x2 = e.nativeEvent.offsetX;
    y2 = e.nativeEvent.offsetY;

    if (!ctx) return;

    if (cursorType === "pencil") {
      // 線を描画する
      ctx.beginPath();
      console.log("描画開始点", x, y);
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      console.log("描画終了点", x2, y2);
      ctx.stroke();
    } else if (cursorType === "eraser") {
      // 消しゴムを描画する
      ctx.clearRect(x2, y2, 10, 10);
    }

    // 通信相手に送信する
    console.log("channel はありますか！", channels);
    if (channels) {
      channels.forEach((channel) => {
        if (channel.readyState !== "open") {
          console.log("channel は開いていません！");
          // マウスの座標を更新する
          x = x2;
          y = y2;
          return;
        }

        console.log("いけえええええええ！！！");
        channel.send(JSON.stringify({ cursorType, x, y, x2, y2 }));
        console.log("送信しました！");
      });
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

  // // イベントハンドラを削除する
  // useEffect(() => {
  //   return () => {
  //     console.log("イベントハンドラを削除します！");
  //     canvas.removeEventListener("mousedown", mouseDown);
  //     canvas.removeEventListener("mousemove", mouseMove);
  //     canvas.removeEventListener("mouseup", mouseUp);
  //     canvas.removeEventListener("mouseout", mouseOut);
  //   };
  // }, []);

  return (
    <div>
      <canvas
        id="whiteboard"
        ref={canvasRef}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        onMouseOut={mouseOut}
      ></canvas>
      {/* ペンか消しゴムかを選択する欄を作る */}
      <div>
        <input
          type="radio"
          name="tool"
          value="pencil"
          onClick={changeCursorToPencil}
          defaultChecked
        />
        ペン
        <input
          type="radio"
          name="tool"
          value="eraser"
          onClick={changeCursorToEraser}
        />
        消しゴム
      </div>
    </div>
  );
}
