import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";

function PrivateRoute({ component: Component, ...rest }: any) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }
  
  return <Component {...rest} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard/*">
          {(params) => <PrivateRoute component={Dashboard} />}
        </Route>
        <Route path="/" component={Login} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
