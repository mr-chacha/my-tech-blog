import { Suspense } from "react";
import PortfolioFormContent from "./FormContent";

export default function PortfolioFormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PortfolioFormContent />
    </Suspense>
  );
}
