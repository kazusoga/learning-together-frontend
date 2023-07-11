import styles from "./styles.module.css";

export default function LearningDetail({ params }: { params: { id: string } }) {
  return <div>LearningDetail {params.id}</div>;
}
