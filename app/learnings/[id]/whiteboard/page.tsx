"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import Canvas from "@/components/canvas";

// TODO: WebSocket に切り替えられるように、カスタムフックスで抽象化する
// TODO: エラー出てたらコンパイル通らないようにする。Prittier ?

export default function WhiteBoard(request: Request) {
  const servers = {
    iceServers: [
      {
        // stun サーバーは、P2P通信にあたって、NAT の pubic ip を取得して相手に送信するために必要
        // (firestore を通して相手に伝える)
        urls: ["stun:stun1.l.google.com:19302"],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  const [channels, setChannels] = useState<RTCDataChannel[]>([]);

  let id: string;
  let participantId: string;

  let offerCandidatesUnsubscribe: () => void;
  let answerCandidatesUnsubscribe: () => void;
  let connectionDocUnsubscribe: () => void;
  let connectionsUnsubscribe: () => void;
  let participantsUnsubscribe: () => void;

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

  let connectionDict: { [connectionId: string]: RTCPeerConnection } = {};

  const init = async () => {
    const offer = async (
      connection: RTCPeerConnection,
      connectionDoc: firebase.firestore.DocumentReference,
      answer_participant: string
    ) => {
      const offerCandidates = connectionDoc.collection("offerCandidates");
      const answerCandidates = connectionDoc.collection("answerCandidates");

      connection.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
      };

      // チャンネルを作成する
      let dataChannel = connection.createDataChannel("channel");
      console.log("channel を作成しました！", dataChannel);
      dataChannel.onmessage = (event) => {
        // 描画する

        const canvas = document.getElementById(
          "whiteboard"
        ) as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");

        if (ctx === null) {
          alert("描画に失敗しました！！！！！");
          return;
        }

        const data = JSON.parse(event.data);
        if (data.cursorType === "pencil") {
          ctx.beginPath();
          ctx.moveTo(data.x, data.y);

          ctx.lineTo(data.x2, data.y2);
          ctx.stroke();
        } else if (data.cursorType === "eraser") {
          ctx.clearRect(data.x2, data.y2, 10, 10);
        }
      };

      setChannels([...channels, dataChannel]);

      // ローカルのSDPを生成する
      const offerDescription = await connection.createOffer(); // ローカルの SDP が登録される
      await connection.setLocalDescription(offerDescription); // ローカルの ICE Candidates が登録される

      // FirestoreにローカルのSDPを保存する
      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };
      await connectionDoc.set({ offer });
      await connectionDoc.update({ offer_participant: participantId });
      await connectionDoc.update({ answer_participant }); // どの参加者に対する offer かを保存する

      // FirestoreからリモートのSDPを取得する
      connectionDocUnsubscribe = connectionDoc.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!connection.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          connection.setRemoteDescription(answerDescription); // リモートの SDP が登録される
        }
      });

      // FirestoreからリモートのICE candidateを取得して登録する
      answerCandidatesUnsubscribe = answerCandidates.onSnapshot((snapshot) => {
        // QuerySnapshot
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            console.log("answerCandidates を登録するよ！", change.doc.data());
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
      console.log(
        "この時点ではまだセットされていないはず！connection.ondatachannel",
        connection.ondatachannel
      );
      connection.ondatachannel = (event) => {
        console.log("answer の ondatachannel が実行されたよ！");
        event.channel.onmessage = (event) => {
          // 描画する
          const data = JSON.parse(event.data);

          // Canvas コンポーネント内の ctx を取得する
          const canvas = document.getElementById(
            "whiteboard"
          ) as HTMLCanvasElement;
          const ctx = canvas.getContext("2d");

          if (data.cursorType === "pencil") {
            ctx.beginPath();
            ctx.moveTo(data.x, data.y);

            ctx.lineTo(data.x2, data.y2);
            ctx.stroke();
          } else if (data.cursorType === "eraser") {
            ctx.clearRect(data.x2, data.y2, 10, 10);
          }
        };

        setChannels([...channels, event.channel]);
      };

      // offerCandidates を取得し、offer candidates を登録する
      offerCandidates.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          console.log("offerCandidates をセットするよ！！", doc.data());
          const data = doc.data();
          const candidate = new RTCIceCandidate(data);
          connection.addIceCandidate(candidate);
        });
      });

      // FirestoreにローカルのSDPを保存する
      const answer = {
        sdp: answerDescription.sdp,
        type: answerDescription.type,
      };
      await connectionDoc.update({ answer });
    };

    // 新規参加者を検知した時に実行される
    const handleNewJoiner = async (answer_participant: string) => {
      const connection = new RTCPeerConnection(servers);

      id = Math.random().toString(36).slice(-9);
      const connectionDoc = connections.doc(id);

      connectionDict[id] = connection;

      await offer(connection, connectionDoc, answer_participant);
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
    connectionsUnsubscribe = connections.onSnapshot((snapshot) => {
      // 初回は何もしない
      if (initialConnectionsCount === snapshot.size) return;

      console.log(
        "connections コレクションに新規ドキュメントが追加されたことを検知する",
        snapshot
      );
      snapshot.docChanges().forEach(async (change) => {
        console.log("change.type", change.type);
        console.log("change.doc", change.doc);

        const data = change.doc.data();
        console.log("data", data);

        // 自分に対する offer でなければ何もしない
        if (data.answer_participant !== participantId) return;

        // すでに offer_participant に対して answer していたら、何もしない
        if (data.answer) {
          console.log("すでに answer していたので、何もしない");
          return;
        }
        // answerCandidates コレクションが作成されていたら、何もしない
        const connectionDoc = change.doc.ref;
        const answerCandidates = connectionDoc.collection("answerCandidates");
        const answerCandidatesSnapshot = await answerCandidates.get();
        if (answerCandidatesSnapshot.size > 0) {
          console.log(
            "answerCandidates コレクションが作成されていたので、何もしない"
          );
          return;
        }

        // ドキュメントを取得する
        const connection = new RTCPeerConnection(servers);
        connectionDict[change.doc.id] = connection;

        await answer(connection, connectionDoc);
      });
    });

    // participants の数を取得する
    const participantsSnapshot = await participants.get();
    const initialParticipantsCount = participantsSnapshot.size;

    // 新規参加者を検知する
    participantsUnsubscribe = participants.onSnapshot((snapshot) => {
      // 初回は何もしない
      if (initialParticipantsCount === snapshot.size) return;

      console.log("新規参加は検知しましたか？？", snapshot);
      snapshot.docChanges().forEach(async (change) => {
        console.log("新規参加のchangeはいくつある？", change);
        if (change.type === "added") {
          // 自分であれば何もしない
          console.log("自分か？", change.doc.id, participantId);
          if (change.doc.id === participantId) return;

          console.log("handleNewJoinerが実行されるよ");
          await handleNewJoiner(change.doc.id);
        }
      });
    });
  };

  const deleteData = () => {
    console.log("データを削除するぜ！！！");
    const db = firebase.firestore();
    const callDoc = db.collection("whiteboards").doc("5");
    const connections = callDoc.collection("connections");

    connections.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.answer_participant === participantId ||
          data.offer_participant === participantId
        ) {
          // 全てのコレクションを削除する
          connectionDict[doc.ref.id].close();

          // offerCandidates コレクションを削除する
          const offerCandidates = doc.ref.collection("offerCandidates");
          offerCandidates.get().then((snapshot) => {
            snapshot.forEach((doc) => {
              doc.ref.delete();
            });
          });

          // answerCandidates コレクションを削除する
          const answerCandidates = doc.ref.collection("answerCandidates");
          answerCandidates.get().then((snapshot) => {
            snapshot.forEach((doc) => {
              doc.ref.delete();
            });
          });

          // connections コレクション内のドキュメントを削除する
          doc.ref.delete();
        }
      });
    });

    // participants コレクション内の自分のドキュメントを削除する
    const participants = callDoc.collection("participants");
    participants.doc(participantId).delete();
  };

  useEffect(() => {
    // レンダリングされるたびに実行される
    init();

    // DOM が 削除された後に実行される
    return () => {
      console.log(
        "onSnapshot を unsubscribe する",
        offerCandidatesUnsubscribe,
        answerCandidatesUnsubscribe,
        connectionDocUnsubscribe,
        connectionsUnsubscribe,
        participantsUnsubscribe
      );
      offerCandidatesUnsubscribe && offerCandidatesUnsubscribe();
      answerCandidatesUnsubscribe && answerCandidatesUnsubscribe();
      connectionDocUnsubscribe && connectionDocUnsubscribe();
      connectionsUnsubscribe && connectionsUnsubscribe();
      participantsUnsubscribe && participantsUnsubscribe();

      // ondatachannel を unsubscribe する
      console.log("ondatachannel を unsubscribe する", channels);
      channels.forEach((channel) => {
        channel.close();
      });

      deleteData();
    };
  }, []);

  useEffect(() => {
    console.log(
      "セットアップ！ channels は",
      channels,
      " location.pathname は",
      location.pathname
    );

    // location が更新されたことを検知する
    const prevLocationPathname = location.pathname;

    return () => {
      console.log(
        "クリーンアップ！！ prevLocationPathname は",
        prevLocationPathname,
        "channels は",
        channels
      );
      if (prevLocationPathname !== location.pathname) {
        console.log(
          "location が更新されました！クリーンアップ！！ channels は",
          channels
        );
        channels.forEach((channel) => {
          channel.close();
        });
      }
    };
  }, [location, channels]);

  return (
    <div>
      <h1>WhiteBoard</h1>
      <Canvas channels={channels} />
    </div>
  );
}
