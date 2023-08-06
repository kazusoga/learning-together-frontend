"use client";

import { useRef, useEffect, use } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

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

    // firestore から描画情報を取得する
    const db = firebase.firestore();
    db.collection("whiteboards")
      .doc("5")
      .collection("points")
      .doc("latest")
      .onSnapshot((doc) => {
        console.log("firestore から初期描画データを取得しました！", doc.data());

        // 描画情報を取得する
        const data = doc.data();

        // 描画情報をキャンバスに反映する
        if (!data) {
          return;
        }
        if (!ctx) {
          return;
        }

        for (const point of Object.values(data)) {
          if (point.type === "pencil") {
            ctx!.beginPath();
            ctx.moveTo(point.startX, point.startY);
            ctx.lineTo(point.endX, point.endY);
            ctx.stroke();
          } else if (point.type === "eraser") {
            ctx.clearRect(point.x2, point.y2, 10, 10);
          }
        }
      });
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

  const sendLatestPointToFirestore = (
    type: "pencil" | "eraser",
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    // firestore に最新の座標を送信して追加する
    const db = firebase.firestore();

    // 連番を作成する
    const id = Date.now().toString();

    // id は変数展開する。{id: {x, y}} という形で保存する
    // 前のものも残しておく
    db.collection("whiteboards")
      .doc("5")
      .collection("points")
      .doc("latest")
      .set({ [id]: { type, startX, startY, endX, endY } }, { merge: true })
      .then(() => {
        console.log("最新の座標を firestore に送信しました！");
      })
      .catch((error) => {
        console.log("最新の座標の送信に失敗しました！", error);
      });
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

      // firestore に描画情報を送信する
      sendLatestPointToFirestore("pencil", x, y, x2, y2);
    } else if (cursorType === "eraser") {
      // 消しゴムを描画する
      ctx.clearRect(x2, y2, 10, 10);
      sendLatestPointToFirestore("eraser", x, y, x2, y2);
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
