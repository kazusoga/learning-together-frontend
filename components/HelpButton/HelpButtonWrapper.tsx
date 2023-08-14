"use client";

import { useloginUserContext } from "@/app/providers";
import HelpButton from "./HelpButton";

export default function HelpButtonWrapper({
  learningId,
  learningUserId,
}: {
  learningId: number;
  learningUserId: number;
}) {
  const loginUser = useloginUserContext();
  if (!loginUser) return null;
  if (loginUser.id !== learningUserId) return null;

  return <HelpButton learningId={learningId} />;
}
