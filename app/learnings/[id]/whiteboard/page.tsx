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

  let channel: RTCDataChannel;
  let ctx: CanvasRenderingContext2D;
  let id: string;
  let participantId: string;

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

  const init = async () => {
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

    // Firestore の whiteboard コレクションにドキュメントを新規追加
    let db = firebase.firestore();

    const offer = async (
      connection: RTCPeerConnection,
      connectionDoc: firebase.firestore.DocumentReference
    ) => {
      const offerCandidates = connectionDoc.collection("offerCandidates");
      const answerCandidates = connectionDoc.collection("answerCandidates");

      connection.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
      };

      // チャンネルを作成する
      channel = connection.createDataChannel("channel");
      channel.onmessage = (event) => {
        // 描画する
        const data = JSON.parse(event.data);
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);

        ctx.lineTo(data.x2, data.y2);
        ctx.stroke();
      };

      // ローカルのSDPを生成する
      const offerDescription = await connection.createOffer();
      await connection.setLocalDescription(offerDescription);

      // FirestoreにローカルのSDPを保存する
      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };
      await connectionDoc.set({ offer });

      // FirestoreからリモートのSDPを取得する
      connectionDoc.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!connection.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          connection.setRemoteDescription(answerDescription);
        }
      });

      // FirestoreからリモートのICE candidateを取得して登録する
      answerCandidates.onSnapshot((snapshot) => {
        // QuerySnapshot
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            // 通信経路の候補を登録する
            const candidate = new RTCIceCandidate(change.doc.data());
            connection.addIceCandidate(candidate);
          }
        });
      });
    };

    const answer = async (
      connection: RTCPeerConnection,
      connectionDoc: firebase.firestore.DocumentReference
    ) => {
      const offerCandidates = connectionDoc.collection("offerCandidates");
      const answerCandidates = connectionDoc.collection("answerCandidates");

      connection.onicecandidate = (event) => {
        // answerCandidates というコレクションに自動IDでドキュメントを追加し、その中にevent.candidateを保存する
        event.candidate && answerCandidates.add(event.candidate.toJSON());
      };

      // FirestoreからリモートのSDPを取得する
      const connectionDataSnapshot = await connectionDoc.get();
      const offerDescription = new RTCSessionDescription(
        connectionDataSnapshot.data().offer
      );
      connection.setRemoteDescription(offerDescription);

      // ローカルのSDPを生成する
      const answerDescription = await connection.createAnswer();
      await connection.setLocalDescription(answerDescription);
      console.log("answerDescription", answerDescription);

      // チャンネルを監視する
      connection.ondatachannel = (event) => {
        console.log("answer の ondatachannel が実行されたよ！");
        channel = event.channel;
        channel.onmessage = (event) => {
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
      await connectionDoc.update({ answer });

      offerCandidates.onSnapshot((snapshot) => {
        // 最初の一回は無条件に実行される。その後は、offerCandidates に変更があった場合に実行される
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            let data = change.doc.data();
            connection.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    };

    // 新規参加者を検知した時に実行される
    const handleNewJoiner = async () => {
      const connection = new RTCPeerConnection(servers);

      id = Math.random().toString(36).slice(-9);
      const connectionDoc = connections.doc(id);

      await offer(connection, connectionDoc);
    };

    const callDoc = db.collection("whiteboards").doc(request.params.id);
    const participants = callDoc.collection("participants");
    participantId = Math.random().toString(36).slice(-9);
    console.log("作れえええええ");
    const participantDoc = participants.doc(participantId);
    participantDoc.set({ test: "test" });

    const connections = callDoc.collection("connections");
    // connections コレクションの初期のドキュメント数を取得する
    const connectionsSnapshot = await connections.get();
    const initialConnectionsCount = connectionsSnapshot.size;

    // 既存ユーザーが自分の参加を検知して
    // connections コレクションに新規ドキュメントを追加した (自分に対する offer を作成した) ことを検知する
    connections.onSnapshot((snapshot) => {
      // 初回は何もしない
      if (initialConnectionsCount === snapshot.size) return;

      console.log(
        "connections コレクションに新規ドキュメントが追加されたことを検知する",
        snapshot
      );
      snapshot.docChanges().forEach(async (change) => {
        console.log("change.type", change.type);
        if (change.type === "added") {
          console.log("change.doc", change.doc);
          // 自分が作成したドキュメントだったら、何もしない
          console.log("自分が作成したドキュメントのid", id, change.doc.id);
          if (change.doc.id === id) return;

          // ドキュメントを取得する
          const connectionDoc = change.doc.ref;
          // offerCandidates コレクションを監視する
          const offerCandidates = connectionDoc.collection("offerCandidates");
          // offerCandidates コレクションの初期のドキュメント数を取得する
          // const offerCandidatesSnapshot = await offerCandidates.get();
          // const initialOfferCandidatesCount = offerCandidatesSnapshot.size;

          offerCandidates.onSnapshot(async (snapshot) => {
            if (change.type === "added") {
              console.log("offerCandidates docChanges change.doc", change);
              let data = change.doc.data();
              // offer が 追加されたことを検知したら、answer する
              const connection = new RTCPeerConnection(servers);
              await answer(connection, connectionDoc);
            }
          });
        }
      });
    });

    // participants の数を取得する
    const participantsSnapshot = await participants.get();
    const initialParticipantsCount = participantsSnapshot.size;

    // 新規参加者を検知する
    participants.onSnapshot((snapshot) => {
      // 初回は何もしない
      if (initialParticipantsCount === snapshot.size) return;

      console.log("新規参加は検知しましたか？？", snapshot);
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          // 自分であれば何もしない
          console.log("自分か？", change.doc.id, participantId);
          if (change.doc.id === participantId) return;

          console.log("handleNewJoinerが実行されるよ");
          await handleNewJoiner();
        }
      });
    });
  };

  useEffect(() => {
    intializeCanvas();

    init();
  }, []);

  return (
    <div>
      <h1>WhiteBoard</h1>
      <canvas id="whiteboard"></canvas>
    </div>
  );
}
