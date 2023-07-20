"use client";

import { useEffect } from "react";
import styles from "./styles.module.css";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

export default function WhiteBoard(request: Request) {
  const servers = {
    iceServers: [
      {
        // stun サーバーは、P2P通信にあたって、NAT の pubic ip を取得して相手に送信するために必要
        urls: ["stun:stun1.l.google.com:19302"],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  const connection = new RTCPeerConnection(servers);

  let channel: RTCDataChannel;
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

    // 通信相手に送信する
    // let channel: RTCDataChannel;
    // connection.ondatachannel = (event) => {
    //   console.log("チャンネルy！！！ここは？？？？？s");
    //   channel = event.channel;

    //   channel.onmessage = (event) => {
    //     console.log(event.data);
    //     // 描画する
    //     const data = JSON.parse(event.data);
    //     ctx.beginPath();
    //     ctx.moveTo(data.x, data.y);

    //     ctx.lineTo(data.x2, data.y2);
    //     ctx.stroke();
    //   };
    // };

    console.log("connection.ondatachannel", connection.ondatachannel);

    // connection.createDataChannel("channel");

    // console.log(channel);

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
      console.log("channel は定義されてますか？？", channel);
      if (channel) {
        console.log("遅れえええええええ");
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

  const createRoom = async () => {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_VUE_APP_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_VUE_APP_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_VUE_APP_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_VUE_APP_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_VUE_APP_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_VUE_APP_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_VUE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_VUE_APP_MEASUREMENT_ID,
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // Firestoreのcallsコレクションにドキュメントを新規追加
    const db = firebase.firestore();
    // id の名前でドキュメントがなければ新規に作成される
    // const callDoc = db.collection("whiteboard").doc(request.params.id);
    // const offerCandidates = callDoc.collection("offerCandidates");
    // const answerCandidates = callDoc.collection("answerCandidates");

    const offer = async () => {
      const callDoc = db.collection("whiteboard").doc(request.params.id);
      const offerCandidates = callDoc.collection("offerCandidates");
      const answerCandidates = callDoc.collection("answerCandidates");

      console.log("inner offerCandidates", offerCandidates);
      connection.onicecandidate = (event) => {
        console.log("発火してますか＿？？", event);
        // offerCandidatesc というコレクションに自動IDでドキュメントを追加し、その中にevent.candidateを保存する
        event.candidate && offerCandidates.add(event.candidate.toJSON());
      };

      // ローカルのSDPを生成する
      const offerDescription = await connection.createOffer();
      console.log("offerDescriptionは", offerDescription);
      await connection.setLocalDescription(offerDescription);

      // FirestoreにローカルのSDPを保存する
      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };
      await callDoc.set({ offer });

      // FirestoreからリモートのSDPを取得する
      callDoc.onSnapshot((snapshot) => {
        console.log("snapshot は発火してますか？answer");
        const data = snapshot.data();
        if (!connection.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          connection.setRemoteDescription(answerDescription);
        }
      });

      // FirestoreからリモートのICE candidateを取得して登録する
      answerCandidates.onSnapshot((snapshot) => {
        // QuerySnapshot
        console.log("snapshot は発火してますか？answercandidatesの変更を検知");
        snapshot.docChanges().forEach((change) => {
          console.log("さらにanswerの変更を検知");
          if (change.type === "added") {
            // 通信経路の候補を登録する
            const candidate = new RTCIceCandidate(change.doc.data());
            connection.addIceCandidate(candidate);
          }
        });
      });
    };

    const answer = async () => {
      const callDoc = db.collection("whiteboard").doc(request.params.id);
      const offerCandidates = callDoc.collection("offerCandidates");
      const answerCandidates = callDoc.collection("answerCandidates");

      connection.onicecandidate = (event) => {
        console.log("あれ？answerCandidatesに追加してますか_");
        // answerCandidates というコレクションに自動IDでドキュメントを追加し、その中にevent.candidateを保存する
        event.candidate && answerCandidates.add(event.candidate.toJSON());
      };

      // FirestoreからリモートのSDPを取得する
      console.log("callDoc", callDoc);
      const callDataSnapshot = await callDoc.get();
      console.log("callDataSnapshot data", callDataSnapshot.data());
      const offerDescription = new RTCSessionDescription(
        callDataSnapshot.data().offer
      );
      connection.setRemoteDescription(offerDescription);

      // ローカルのSDPを生成する
      const answerDescription = await connection.createAnswer();
      await connection.setLocalDescription(answerDescription);

      // チャンネルを監視する
      connection.ondatachannel = (event) => {
        console.log("チャンネルy！！！ここは？？？？？s");
        channel = event.channel;
        channel.onmessage = (event) => {
          console.log(event.data);
          // 描画する
          const data = JSON.parse(event.data);
          ctx.beginPath();
          ctx.moveTo(data.x, data.y);

          ctx.lineTo(data.x2, data.y2);
          ctx.stroke();
        };
      };

      // FirestoreにローカルのSDPを保存する
      const answer = {
        sdp: answerDescription.sdp,
        type: answerDescription.type,
      };
      await callDoc.update({ answer });

      // const offerget = await offerCandidates.get();
      // console.log(
      //   "offerCandidatesは！！！",
      //   offerget.docChanges()[0].doc.data()
      // );

      // connection.addIceCandidate(
      //   new RTCIceCandidate(offerget.docChanges()[0].doc.data())
      // );

      offerCandidates.onSnapshot((snapshot) => {
        // 最初の一回は無条件に実行される。その後は、offerCandidates に変更があった場合に実行される
        console.log("snapshot は発火してますか？offerの変更を検知");
        snapshot.docChanges().forEach((change) => {
          console.log("さらにofferの変更を検知", change);
          if (change.type === "added") {
            console.log(
              "offerCandidatesに追加されたので、ICE candidateを登録する",
              change.doc.data()
            );
            let data = change.doc.data();
            connection.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    };

    console.log("request", request.searchParams.offer);

    // const callDoc = db.collection("whiteboard").doc(request.params.id);
    // const offerCandidates = callDoc.collection("offerCandidates");
    // const answerCandidates = callDoc.collection("answerCandidates");

    // connection.createDataChannel("channel");

    if (request.searchParams.offer) {
      console.log("connection.ondatachannel", connection.ondatachannel);
      channel = connection.createDataChannel("channel");
      channel.onmessage = (event) => {
        console.log(event.data);
        // 描画する
        const data = JSON.parse(event.data);
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);

        ctx.lineTo(data.x2, data.y2);
        ctx.stroke();
      };
      await offer();
    } else if (request.searchParams.answer) {
      await answer();

      // connection.ondatachannel = (event) => {
      //   console.log("チャンネルy！！！ここは？？？？？s");
      //   channel = event.channel;

      //   channel.onmessage = (event) => {
      //     console.log(event.data);
      //     // 描画する
      //     const data = JSON.parse(event.data);
      //     ctx.beginPath();
      //     ctx.moveTo(data.x, data.y);

      //     ctx.lineTo(data.x2, data.y2);
      //     ctx.stroke();
      //   };
      // };
    }
  };

  useEffect(() => {
    intializeCanvas();

    (async () => {
      await createRoom();
    })();
  }, []);

  return (
    <div>
      <h1>WhiteBoard</h1>
      <canvas id="whiteboard"></canvas>
    </div>
  );
}
