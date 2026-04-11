import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import IntroAnimationGate from "./components/IntroAnimationGate.tsx";
import CustomCursor from "./components/ui-custom/CustomCursor.tsx";
import "./index.css";

const ENABLE_INTRO_ANIMATION = true;

createRoot(document.getElementById("root")!).render(
	<>
		<CustomCursor />
		{ENABLE_INTRO_ANIMATION ? (
			<IntroAnimationGate>
				<App />
			</IntroAnimationGate>
		) : (
			<App />
		)}
	</>
);
