import { Routes, Route, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import OnboardingPage from "./pages/OnboardingPage";
import CallPage from "./pages/CallPage";

import ActivityPage from "./pages/ActivityPage";
import Proffessor from "./pages/Proffessor";
import Connections from "./pages/Connections";
import EditProfilePage from "./pages/EditProfilePage";
import toast, { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader";
import useAuthUser from "./hooks/useAuthUser";
import Layout from "./components/Layout";

const App = () => {

  const {isLoading, authUser} = useAuthUser();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isonboarded;

  if (isLoading) return <PageLoader/>

  
  return (
      <div>
        
          {/*<button onClick={() => toast.success("Hello")} className="btn btn-primary" >Create a toast</button>*/}
      
      
      
      
      
          <Routes>
            <Route path="/" 
            element={
              isAuthenticated && isOnboarded ? (
                <Layout>
                  <HomePage />
                </Layout>
              ) : (<Navigate to={isAuthenticated ? "/onboarding" : "/login"} />)} />
            
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={
              isOnboarded ? "/" : "/onboarding"
            } />} />
            
            
            
            <Route path="/signup" element={!isAuthenticated ? <SignUpPage /> :  <Navigate to={
              isOnboarded ? "/" : "/onboarding"
            } />} />
            
            
            <Route path="/onboarding" element={isAuthenticated ? (!isOnboarded ? (<OnboardingPage />):(<Navigate to="/" />)) : (<Navigate to="/login" />)} />
            
            
            <Route path="/call/:id" element={
              isAuthenticated && isOnboarded ? (
                <CallPage/>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"}/>
              )
            } />
            
            
            
            
            
            
            
            
            
            <Route
              path="/activity"
              element={isAuthenticated && isOnboarded ? (
                <Layout>
                  <ActivityPage/>
                </Layout>
              ) : (
                <Navigate to = {!isAuthenticated ? "/login" : "/onboarding"}/>
              )}
            />

            <Route
              path="/professor/:id"
              element={isAuthenticated && isOnboarded ? (
                <Layout>
                  <Proffessor/>
                </Layout>
              ) : (
                <Navigate to = {!isAuthenticated ? "/login" : "/onboarding"}/>
              )}
            />

            <Route
              path="/connections"
              element={isAuthenticated && isOnboarded ? (
                <Layout>
                  <Connections/>
                </Layout>
              ) : (
                <Navigate to = {!isAuthenticated ? "/login" : "/onboarding"}/>
              )}
            />

            <Route
              path="/profile"
              element={isAuthenticated && isOnboarded ? (
                <Layout>
                  <EditProfilePage />
                </Layout>
              ) : (
                <Navigate to = {!isAuthenticated ? "/login" : "/onboarding"}/>
              )}
            />

          </Routes>
          <Toaster />
      </div>
  )
}

export default App