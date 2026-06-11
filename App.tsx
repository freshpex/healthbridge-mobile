import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootApp } from "./src/app/root-app";

export default function App() {
  return (
    <SafeAreaProvider>
      <RootApp />
    </SafeAreaProvider>
  );
}
