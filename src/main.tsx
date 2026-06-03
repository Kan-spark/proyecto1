import React from "react"; 
import ReactDOM from "react-dom/client"; 
import App from "./App"; 
import "./index.css"; 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
import { AuthProvider } from "./context/AuthContext"; 
 
const queryClient = new QueryClient({ 
  defaultOptions: { 
    queries: { 
      retry: 1, 
      refetchOnWindowFocus: false, 
    }, 
  }, 
}); 
 
ReactDOM.createRoot(document.getElementById("root")!).render( 
  <React.StrictMode> 
    <AuthProvider> 
      <QueryClientProvider client={queryClient}> 
        <App /> 
      </QueryClientProvider> 
    </AuthProvider> 
  </React.StrictMode>, 
);