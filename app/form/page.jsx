import { Suspense } from "react";
import FormContent from "./FormContent";

// useSearchParams 사용으로 인해 Suspense 필요
export default function FormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormContent />
    </Suspense>
  );
}
